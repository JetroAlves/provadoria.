
import { generateText } from '../server/gemini';
import { supabase } from '../lib/supabase-server';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, systemInstruction, jsonSchema } = req.body;
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
        const result = await generateText(user.id, prompt, systemInstruction, jsonSchema);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
