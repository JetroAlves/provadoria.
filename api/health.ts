import { getSupabaseServer } from '../lib/supabase-server.js';

export default async function handler(req: any, res: any) {
    try {
        const envStatus = {
            hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL || !!process.env.SUPABASE_URL,
            hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.SUPABASE_SERVICE_KEY,
            hasGeminiKey: !!process.env.GEMINI_API_KEY
        };

        let supabaseStatus = "Not attempted";
        try {
            const client = getSupabaseServer();
            const { error } = await client.from('user_credits').select('count', { count: 'exact', head: true });
            supabaseStatus = error ? `Error: ${error.message}` : 'Connection OK';
        } catch (sErr: any) {
            supabaseStatus = `Init Error: ${sErr.message}`;
        }

        return res.status(200).json({
            success: true,
            data: {
                message: 'Central API Health Check',
                envStatus,
                supabaseStatus,
                nodeVersion: process.version
            }
        });
    } catch (err: any) {
        return res.status(500).json({
            success: false,
            error: err.message || 'Internal Server Error'
        });
    }
}
