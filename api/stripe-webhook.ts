
import { Stripe } from 'stripe';
import { getSupabaseServer } from '../lib/supabase-server.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Desabilitar bodyParser para que possamos ler o corpo bruto para validação da assinatura do Stripe
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const sig = req.headers['stripe-signature'];

    if (!sig || !webhookSecret) {
        console.error('CRITICAL: Missing stripe-signature or STRIPE_WEBHOOK_SECRET');
        return res.status(400).send('Webhook Error: Missing signature or secret');
    }

    let event: Stripe.Event;

    try {
        const rawBody = await getRawBody(req);
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Signature Validation Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const supabase = getSupabaseServer();

    try {
        console.log(`Processing Stripe event: ${event.type} [${event.id}]`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id;
                const planId = session.metadata?.planId;
                const subscriptionId = (session as any).subscription as string;

                if (userId && planId) {
                    console.log(`Linking userID ${userId} to plan ${planId} with subscription ${subscriptionId}`);
                    const { error } = await supabase
                        .from('user_subscriptions')
                        .upsert({
                            user_id: userId,
                            plan_id: planId,
                            stripe_subscription_id: subscriptionId,
                            status: 'active',
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id' });

                    if (error) {
                        console.error('CRITICAL: Error updating user_subscriptions:', error);
                        // Tentar insert se upsert falhar em ambientes sem constraint
                        const { error: insertError } = await supabase
                            .from('user_subscriptions')
                            .insert({
                                user_id: userId,
                                plan_id: planId,
                                stripe_subscription_id: subscriptionId,
                                status: 'active',
                                updated_at: new Date().toISOString()
                            });
                        if (insertError) console.error('Final attempt failed:', insertError);
                    }
                    console.log(`Successfully processed checkout.session.completed for user ${userId}`);
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;
                const priceId = (invoice as any).lines.data[0]?.price?.id;

                if (!subscriptionId || !priceId) break;

                // 1. Buscar o planId correspondente ao priceId na tabela plans
                const { data: plan, error: planError } = await supabase
                    .from('plans')
                    .select('id, monthly_credits')
                    .eq('stripe_price_id', priceId)
                    .single();

                if (planError || !plan) {
                    console.error('Plan not found for stripe_price_id:', priceId, planError);
                    break;
                }

                // 2. Buscar o userId associado a esta assinatura
                const { data: sub, error: subError } = await supabase
                    .from('user_subscriptions')
                    .select('user_id')
                    .eq('stripe_subscription_id', subscriptionId)
                    .single();

                if (subError || !sub) {
                    // Se não encontrar, tenta buscar pelo checkout session (fallback)
                    // Ou talvez a assinatura ainda não tenha sido criada no checkout.session.completed
                    console.error('Subscription not found for subscriptionId:', subscriptionId, subError);
                    break;
                }

                // 3. Atualizar assinatura com o novo planId (em caso de upgrade/downgrade) e status active
                const { error: updateSubError } = await supabase
                    .from('user_subscriptions')
                    .update({
                        plan_id: plan.id,
                        status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                if (updateSubError) {
                    console.error('Error updating user_subscriptions on invoice.paid:', updateSubError);
                }

                // 4. Buscar saldo atual e adicionar créditos
                const { data: currentCredits } = await supabase
                    .from('user_credits')
                    .select('balance')
                    .eq('user_id', sub.user_id)
                    .single();

                const currentBalance = currentCredits?.balance || 0;
                const newBalance = currentBalance + plan.monthly_credits;

                const { error: creditError } = await supabase
                    .from('user_credits')
                    .upsert({
                        user_id: sub.user_id,
                        balance: newBalance,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });

                if (creditError) {
                    console.error('Error updating user_credits:', creditError);
                    throw creditError;
                }

                // 5. Registrar transação
                const { error: transError } = await supabase
                    .from('credit_transactions')
                    .insert({
                        user_id: sub.user_id,
                        amount: plan.monthly_credits,
                        type: 'monthly_allocation',
                        description: `Créditos mensais do plano: ${plan.id}`
                    });

                if (transError) {
                    console.error('Error inserting credit_transaction:', transError);
                }

                console.log(`Successfully processed invoice.paid: Allocated ${plan.monthly_credits} credits to user ${sub.user_id}. New balance: ${newBalance}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const { error } = await supabase
                    .from('user_subscriptions')
                    .update({ status: 'canceled', updated_at: new Date().toISOString() })
                    .eq('stripe_subscription_id', subscription.id);

                if (error) {
                    console.error('Error canceling subscription:', error);
                } else {
                    console.log(`Canceled subscription ${subscription.id} in database`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return res.status(500).send(`Internal Server Error: ${error.message}`);
    }
}

/**
 * Função utilitária para obter o corpo bruto da requisição
 */
async function getRawBody(readable: any): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}
