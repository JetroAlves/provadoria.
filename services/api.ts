
// Este arquivo simula a comunicação com o backend (server/gemini.ts)
import { supabase } from '../lib/supabase';

// Helper para obter o token de sessão (Opcional para Vitrine Pública)
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

// Helper genérico para chamadas de API
const apiCall = async (endpoint: string, body: any, storeSlug?: string) => {
  const token = await getAuthToken();
  const headers: any = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (storeSlug) {
    headers['X-Store-Slug'] = storeSlug;
  } else {
    throw new Error('Identificação necessária para usar a IA.');
  }

  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new Error(json.error || 'Erro na requisição');
  }

  // Retorna apenas a parte de dados para o frontend, mantendo compatibilidade
  return json.data;
};

export const apiService = {

  generateText: async (params: { prompt: string, systemInstruction?: string, jsonMode?: boolean, storeSlug?: string }) => {
    try {
      return await apiCall('generate-text', {
        prompt: params.prompt,
        systemInstruction: params.systemInstruction,
        jsonSchema: params.jsonMode
      }, params.storeSlug);
    } catch (error: any) {
      console.error("API Error (Text):", error);
      throw new Error(error.message || "Erro na geração de texto");
    }
  },

  generateImage: async (params: { prompt: string, images?: { data: string, mimeType: string }[], aspectRatio?: string, useProModel?: boolean, storeSlug?: string }) => {
    try {
      return await apiCall('generate-image', {
        prompt: params.prompt,
        images: params.images,
        aspectRatio: params.aspectRatio,
        useProModel: params.useProModel
      }, params.storeSlug);
    } catch (error: any) {
      console.error("API Error (Image):", error);
      throw new Error(error.message || "Erro na geração de imagem");
    }
  },

  generateVideo: async (params: { prompt: string, image?: { data: string, mimeType: string }, aspectRatio?: string, storeSlug?: string }) => {
    try {
      return await apiCall('generate-video', {
        prompt: params.prompt,
        image: params.image,
        aspectRatio: params.aspectRatio
      }, params.storeSlug);
    } catch (error: any) {
      console.error("API Error (Video):", error);
      throw new Error(error.message || "Erro na geração de vídeo");
    }
  },

  // Helper para converter URL/Blob para formato esperado pelo backend
  urlToBase64: async (url: string): Promise<{ data: string, mimeType: string }> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({
        data: (reader.result as string).split(',')[1],
        mimeType: blob.type
      });
      reader.readAsDataURL(blob);
    });
  }
};
