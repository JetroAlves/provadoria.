
import { supabase } from '../lib/supabase-server';

export default async function handler(req: any, res: any) {
    try {
        const { data, error } = await supabase.from('user_credits').select('count', { count: 'exact', head: true });

        res.status(200).json({
            status: 'ok',
            nodeVersion: process.version,
            env: {
                hasSupabaseUrl: !!process.env.SUPABASE_URL || !!process.env.VITE_SUPABASE_URL,
                hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                hasGeminiKey: !!process.env.GEMINI_API_KEY
            },
            supabaseTest: error ? `Error: ${error.message}` : 'Connection OK'
        });
    } catch (err: any) {
        res.status(500).json({
            status: 'error',
            message: err.message,
            stack: err.stack
        });
    }
}
