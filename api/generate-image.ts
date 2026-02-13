
import { generateImage } from '../server/gemini.js';
import { getSupabaseServer } from '../lib/supabase-server.js';

// Aumentar limite de tamanho do corpo da requisição para imagens
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req: any, res: any) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

        const { prompt, images, aspectRatio, useProModel } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Missing token'
            });
        }

        const token = authHeader.split(' ')[1];

        // Testar Supabase Auth de forma segura
        const supabase = getSupabaseServer();
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth Error:', authError);
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid token'
            });
        }

        const result = await generateImage(user.id, prompt, images, aspectRatio, useProModel);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error("Gemini API error (Image):", error);

        const statusCode = error.message.includes('Créditos insuficientes') ? 403 : 500;

        return res.status(statusCode).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
}
