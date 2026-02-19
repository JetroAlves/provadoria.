
import { generateText } from '../server/gemini.js';
import { getSupabaseServer } from '../lib/supabase-server.js';

export default async function handler(req: any, res: any) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

        const { prompt, systemInstruction, jsonSchema } = req.body;
        const authHeader = req.headers.authorization;
        const publicStoreSlug = req.headers['x-store-slug'];

        const supabase = getSupabaseServer();
        let targetUserId: string | null = null;
        let isPublic = false;

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);

            if (authError || !user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized: Invalid token'
                });
            }
            targetUserId = user.id;
        } else if (publicStoreSlug) {
            const { data: profile, error: pError } = await supabase
                .from('profiles')
                .select('id, virtual_tryon_active')
                .eq('store_slug', publicStoreSlug)
                .single();

            if (pError || !profile) {
                return res.status(404).json({ success: false, error: 'Store not found' });
            }

            if (!profile.virtual_tryon_active) {
                return res.status(403).json({ success: false, error: 'O provador virtual não está ativo para esta loja.' });
            }

            targetUserId = profile.id;
            isPublic = true;

            // IP Rate Limit (5 per hour)
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

            const { count } = await supabase
                .from('audit_logs')
                .select('*', { count: 'exact', head: true })
                .eq('ip_address', clientIp)
                .gt('created_at', oneHourAgo);

            if (count && count >= 5) {
                return res.status(429).json({ success: false, error: 'Limite de uso por hora atingido para seu endereço IP.' });
            }

            await supabase.from('audit_logs').insert({
                user_id: targetUserId,
                action: 'public_stylist',
                ip_address: clientIp,
                metadata: { slug: publicStoreSlug }
            });
        }

        if (!targetUserId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Missing identification'
            });
        }

        const result = await generateText(targetUserId, prompt, systemInstruction, jsonSchema, isPublic);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error("Gemini API error (Text):", error);

        let errorMessage = error.message || "Internal server error";
        let statusCode = 500;

        if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('UNAVAILABLE')) {
            statusCode = 503;
            errorMessage = "O serviço de IA está temporariamente indisponível devido à alta demanda. Tente novamente em alguns instantes.";
        } else if (errorMessage.includes('Créditos insuficientes')) {
            statusCode = 403;
        }

        return res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
}
