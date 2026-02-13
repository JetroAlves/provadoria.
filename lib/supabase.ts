
import { createClient } from '@supabase/supabase-js';

// Credenciais reais fornecidas

// Credenciais reais fornecidas via variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: Supabase URL e Anon Key são obrigatórios. Verifique seu arquivo .env. A aplicação pode não funcionar corretamente.');
}

// Fallback to empty string to prevent crash, client will just fail requests
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Helper para upload de arquivos no Supabase Storage
 */
export const uploadFile = async (bucket: string, path: string, file: File | Blob) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: 'image/png'
  });

  if (error) {
    console.error("Storage Error:", error);
    throw new Error(`Falha no upload de imagem: ${error.message}. Certifique-se que o bucket '${bucket}' existe e é público.`);
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

/**
 * Converte base64 para Blob para facilitar o upload
 */
export const base64ToBlob = async (base64: string) => {
  try {
    const res = await fetch(base64);
    if (!res.ok) throw new Error("Falha ao processar dados da imagem.");
    return await res.blob();
  } catch (e) {
    throw new Error("Erro ao converter imagem para processamento.");
  }
};
