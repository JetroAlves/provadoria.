
import { generateVideo } from '../server/gemini';
import { supabase } from '../lib/supabase-server';

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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, image, aspectRatio } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    try {
        const result = await generateVideo(user.id, prompt, image, aspectRatio);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
