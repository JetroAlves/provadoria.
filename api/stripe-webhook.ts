
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

        if (!rawBody || rawBody.length === 0) {
            console.error('Webhook Error: Empty body received');
            return res.status(400).json({ success: false, error: 'Empty body' });
        }

        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Signature Validation Error: ${err.message}`);
        return res.status(400).json({
            success: false,
            error: `Stripe Signature Error: ${err.message}`,
            hint: 'Verifique se a STRIPE_WEBHOOK_SECRET na Vercel bate com a do painel do Stripe para este endpoint especifico.',
            secret_preview: webhookSecret ? `${webhookSecret.substring(0, 8)}...${webhookSecret.substring(webhookSecret.length - 4)}` : 'missing',
            received_signature: `${sig.substring(0, 10)}...`
        });
    }

    const supabase = getSupabaseServer();

    try {
        console.log(`Processing Stripe event: ${event.type} [${event.id}]`);

        // Logs extras no response para debug no painel do Stripe
        const debugInfo = {
            type: event.type,
            eventId: event.id,
            timestamp: new Date().toISOString()
        };

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id;
                const planId = session.metadata?.planId;
                const subscriptionId = (session as any).subscription as string;

                if (userId && planId) {
                    console.log(`Linking userID ${userId} to plan ${planId} with subscription ${subscriptionId}`);
                    // 3. Atualizar ou criar assinatura
                    const { error: upsertSubError } = await supabase
                        .from('user_subscriptions')
                        .upsert({
                            user_id: userId,
                            stripe_customer_id: session.customer as string,
                            stripe_subscription_id: subscriptionId,
                            plan_id: planId,
                            status: 'active'
                        }, { onConflict: 'user_id' });

                    if (upsertSubError) {
                        console.error('CRITICAL: Error updating user_subscriptions:', upsertSubError);
                        // Tentar insert se upsert falhar em ambientes sem constraint
                        const { error: insertError } = await supabase
                            .from('user_subscriptions')
                            .insert({
                                user_id: userId,
                                plan_id: planId,
                                stripe_subscription_id: subscriptionId,
                                status: 'active'
                            });
                        if (insertError) console.error('Final attempt failed:', insertError);
                    }
                    console.log(`Successfully processed checkout.session.completed for user ${userId}`);
                } else {
                    return res.status(200).json({
                        success: false,
                        error: 'Missing userId or planId in session',
                        userId,
                        planId
                    });
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as any;

                // Extração hiper-resiliente de ID de Assinatura
                const subscriptionId = invoice.subscription ||
                    invoice.subscription_details?.subscription ||
                    invoice.parent?.subscription_details?.subscription ||
                    invoice.lines?.data[0]?.subscription ||
                    invoice.lines?.data[0]?.parent?.subscription_item_details?.subscription;

                // Extração hiper-resiliente de ID de Preço
                const firstLine = invoice.lines?.data[0];
                const priceId = firstLine?.price?.id ||
                    firstLine?.pricing?.price_details?.price ||
                    firstLine?.metadata?.price_id;

                if (!subscriptionId || !priceId) {
                    return res.status(200).json({
                        success: false,
                        error: 'Missing critical identifiers',
                        details: {
                            subscriptionId: subscriptionId || 'not_found',
                            priceId: priceId || 'not_found'
                        },
                        hint: 'Verifique se a estrutura do JSON do Stripe mudou na versao da API que voce esta usando.'
                    });
                }

                // 1. Buscar o plano no banco pelo stripe_price_id ou metadata
                // Primeiro tentamos pelo ID do metadado se existir
                const planIdQuery = invoice.metadata?.planId;

                let { data: plan, error: planError } = await supabase
                    .from('plans')
                    .select('id, monthly_credits')
                    .or(`stripe_price_id.eq.${priceId}${planIdQuery ? `,id.eq.${planIdQuery}` : ''}`)
                    .single();

                if (planError || !plan) {
                    console.error('Plan not found for stripe_price_id:', priceId, planError);
                    return res.status(200).json({
                        success: false,
                        error: 'Plan not found in database',
                        stripePriceId: priceId,
                        planError
                    });
                }

                // 2. Buscar o userId associado a esta assinatura em nosso banco
                let { data: sub, error: subError } = await supabase
                    .from('user_subscriptions')
                    .select('user_id')
                    .eq('stripe_subscription_id', subscriptionId)
                    .maybeSingle();

                let userId = sub?.user_id;

                // 3. FALLBACK CRÍTICO: Se não acharmos o userId no banco, buscamos a assinatura no Stripe
                // para ver se o userId está no metadados
                if (!userId) {
                    console.log(`User ID not found in DB for sub ${subscriptionId}. Fetching from Stripe...`);
                    try {
                        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
                        userId = stripeSub.metadata?.userId || stripeSub.metadata?.user_id;

                        if (!userId) {
                            // Tenta buscar no Checkout Session se não estiver na assinatura
                            const sessions = await stripe.checkout.sessions.list({ subscription: subscriptionId });
                            if (sessions.data.length > 0) {
                                userId = sessions.data[0].client_reference_id || sessions.data[0].metadata?.userId;
                            }
                        }
                    } catch (stripeErr) {
                        console.error('Error fetching subscription from Stripe:', stripeErr);
                    }
                }

                if (!userId) {
                    console.log(`Still no userId for sub ${subscriptionId}. Trying email fallback...`);
                    const customerId = invoice.customer as string;
                    if (customerId) {
                        try {
                            const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
                            if (customer.email) {
                                console.log(`Found email ${customer.email} for customer ${customerId}. Searching in profiles...`);
                                const { data: profile } = await supabase
                                    .from('profiles')
                                    .select('id')
                                    .eq('email', customer.email)
                                    .maybeSingle();

                                userId = profile?.id;
                            }
                        } catch (err) {
                            console.error('Email fallback failed:', err);
                        }
                    }
                }

                if (!userId) {
                    console.error('CRITICAL: Could not determine userId for subscription:', subscriptionId);
                    return res.status(200).json({
                        success: false,
                        message: 'User could not be identified',
                        subscriptionId
                    });
                }

                // 4. Garantir que a assinatura exista no banco (upsert resiliente)
                const { error: upsertSubError } = await supabase
                    .from('user_subscriptions')
                    .upsert({
                        user_id: userId,
                        plan_id: plan.id,
                        stripe_subscription_id: subscriptionId,
                        status: 'active'
                    }, { onConflict: 'user_id' });

                if (upsertSubError) {
                    console.error('Error ensuring user_subscriptions on invoice.paid:', upsertSubError);
                    // Tentativa de insert simples se o upsert falhar por motivos de constraint
                    await supabase.from('user_subscriptions').insert({
                        user_id: userId,
                        plan_id: plan.id,
                        stripe_subscription_id: subscriptionId,
                        status: 'active'
                    }).select();
                }

                // 5. Buscar saldo atual e adicionar créditos
                const { data: currentCredits } = await supabase
                    .from('user_credits')
                    .select('balance')
                    .eq('user_id', userId)
                    .maybeSingle();

                const currentBalance = currentCredits?.balance || 0;
                const creditsToAdd = plan.monthly_credits || (plan as any).credits || 0;
                const newBalance = currentBalance + creditsToAdd;

                const { error: creditError } = await supabase
                    .from('user_credits')
                    .upsert({
                        user_id: userId,
                        balance: newBalance
                    }, { onConflict: 'user_id' });

                if (creditError) {
                    console.error('Error updating user_credits:', creditError);
                    throw creditError;
                }

                // 6. Registrar transação
                const creditsAllocated = plan.monthly_credits || (plan as any).credits || 0;
                const { error: transError } = await supabase
                    .from('credit_transactions')
                    .insert({
                        user_id: userId,
                        amount: creditsAllocated,
                        type: 'monthly_allocation',
                        description: `Créditos mensais do plano: ${plan.id}`
                    });

                if (transError) {
                    console.error('Error inserting credit_transaction:', transError);
                }

                console.log(`Successfully processed invoice.paid: Allocated ${plan.monthly_credits} credits to user ${userId}. New balance: ${newBalance}`);

                // Retornar sucesso explícito aqui para ver no dashboard do Stripe
                return res.status(200).json({
                    success: true,
                    message: 'Credits allocated successfully',
                    data: {
                        user_id: userId,
                        plan_id: plan.id,
                        credits_added: creditsToAdd,
                        new_balance: newBalance,
                        db_results: {
                            sub_error: upsertSubError,
                            credit_error: creditError,
                            trans_error: transError
                        }
                    }
                });
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const { error } = await supabase
                    .from('user_subscriptions')
                    .update({ status: 'canceled' })
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

        return res.status(200).json({
            success: true,
            message: `Event ${event.type} reached end of handler`,
            processed_by_default: true,
            type: event.type
        });
    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return res.status(200).json({
            success: false,
            error: error.message,
            stack: error.stack,
            context: 'Catch block in main handler'
        });
    }
}

/**
 * Função utilitária robusta para obter o corpo bruto da requisição
 */
function getRawBody(req: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        req.on('data', (chunk: any) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}
