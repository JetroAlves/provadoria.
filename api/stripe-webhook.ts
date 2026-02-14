
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
                        console.error('Error updating user_subscriptions:', error);
                        throw error;
                    }
                    console.log(`Successfully linked subscription ${subscriptionId} to user ${userId}`);
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;

                if (!subscriptionId) break;

                // Buscar assinatura para pegar o userId e planId
                const { data: sub, error: subError } = await supabase
                    .from('user_subscriptions')
                    .select('user_id, plan_id')
                    .eq('stripe_subscription_id', subscriptionId)
                    .single();

                if (subError || !sub) {
                    console.error('Subscription not found for invoice.paid:', subscriptionId, subError);
                    break;
                }

                // Buscar monthly_credits do plano
                const { data: plan, error: planError } = await supabase
                    .from('plans')
                    .select('monthly_credits')
                    .eq('id', sub.plan_id)
                    .single();

                if (planError || !plan) {
                    console.error('Plan not found for id:', sub.plan_id, planError);
                    break;
                }

                // Buscar saldo atual
                const { data: currentCredits, error: balanceError } = await supabase
                    .from('user_credits')
                    .select('balance')
                    .eq('user_id', sub.user_id)
                    .single();

                // user_credits pode não existir para novos usuários
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

                // Registrar transação
                const { error: transError } = await supabase
                    .from('credit_transactions')
                    .insert({
                        user_id: sub.user_id,
                        amount: plan.monthly_credits,
                        type: 'monthly_allocation',
                        description: `Créditos mensais do plano: ${plan.monthly_credits}`
                    });

                if (transError) {
                    console.error('Error inserting credit_transaction:', transError);
                }

                console.log(`Allocated ${plan.monthly_credits} credits to user ${sub.user_id}. New balance: ${newBalance}`);
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
