
import { Stripe } from 'stripe';
import { getSupabaseServer } from '../lib/supabase-server.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any, // Using a stable version
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { planId } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Missing token'
            });
        }

        const token = authHeader.split(' ')[1];
        const supabase = getSupabaseServer();
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth Error:', authError);
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid token'
            });
        }

        if (!planId) {
            return res.status(400).json({
                success: false,
                error: 'planId is required'
            });
        }

        // 1. Busca stripe_price_id na tabela plans
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('stripe_price_id')
            .eq('id', planId)
            .single();

        if (planError || !plan) {
            console.error('Plan Error:', planError);
            return res.status(404).json({
                success: false,
                error: 'Plan not found'
            });
        }

        if (!plan.stripe_price_id) {
            return res.status(400).json({
                success: false,
                error: 'Plan does not have a Stripe Price ID configured'
            });
        }

        // 2. Cria Checkout Session
        // Nota: origin deve ser passado do frontend ou inferido do header referer/origin
        const origin = req.headers.origin || `https://${req.headers.host}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: plan.stripe_price_id,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/#/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/#/settings`,
            client_reference_id: user.id,
            metadata: {
                userId: user.id,
                planId: planId,
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                    planId: planId,
                },
            },
            customer_email: user.email,
        });

        console.log(`Checkout session created for user ${user.id}: ${session.id}`);

        return res.status(200).json({
            success: true,
            checkoutUrl: session.url
        });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}
