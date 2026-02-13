
import { createClient } from '@supabase/supabase-js';

// Usar chave de serviço para operações administrativas (dedução de créditos)
// NOTA: Nunca exponha SUPABASE_SERVICE_ROLE_KEY no frontend!
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('CRITICAL ERROR: Supabase URL e Service Key são obrigatórios no servidor.');
}

export const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});
