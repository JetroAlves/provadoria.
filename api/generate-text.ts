
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

        const result = await generateText(user.id, prompt, systemInstruction, jsonSchema);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error("Gemini API error (Text):", error);

        const statusCode = error.message.includes('Créditos insuficientes') ? 403 : 500;

        return res.status(statusCode).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
}
