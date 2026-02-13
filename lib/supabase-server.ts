
import { createClient } from '@supabase/supabase-js';

// Usar chave de serviço para operações administrativas (dedução de créditos)
// NOTA: Nunca exponha SUPABASE_SERVICE_ROLE_KEY no frontend!
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('CRITICAL ERROR: Supabase URL e Service Key são obrigatórios no servidor.');
}

// Função para obter o cliente de forma segura
export const getSupabaseServer = () => {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('CONFIG ERROR: Supabase URL e Service Role Key são obrigatórios no servidor. Verifique as Environment Variables na Vercel.');
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
};

// Exportar uma instância (mas com cuidado se as variáveis faltarem)
export const supabase = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
    : null as any;
