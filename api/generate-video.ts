
import { generateVideo } from '../server/gemini.js';
import { getSupabaseServer } from '../lib/supabase-server.js';

// Aumentar limite para upload inicial de imagem
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
        maxDuration: 60 // Estender timeout para geração de vídeo
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

        const { prompt, image, aspectRatio } = req.body;
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
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid token'
            });
        }

        const result = await generateVideo(user.id, prompt, image, aspectRatio);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error("Gemini API error (Video):", error);

        let errorMessage = error.message || "Internal server error";
        let statusCode = 500;

        if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('UNAVAILABLE')) {
            statusCode = 503;
            errorMessage = "A geração de vídeos está com alta demanda. Por favor, tente novamente em alguns instantes.";
        } else if (errorMessage.includes('Créditos insuficientes')) {
            statusCode = 403;
        }

        return res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
}
