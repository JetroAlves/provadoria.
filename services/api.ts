
// Este arquivo simula a comunicação com o backend (server/gemini.ts)
import { supabase } from '../lib/supabase';

// Helper para obter o token de sessão
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado');
  }
  return session.access_token;
};

// Helper genérico para chamadas de API
const apiCall = async (endpoint: string, body: any) => {
  const token = await getAuthToken();
  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro na requisição');
  }

  return await response.json();
};

export const apiService = {

  generateText: async (params: { prompt: string, systemInstruction?: string, jsonMode?: boolean }) => {
    try {
      return await apiCall('generate-text', {
        prompt: params.prompt,
        systemInstruction: params.systemInstruction,
        jsonSchema: params.jsonMode
      });
    } catch (error: any) {
      console.error("API Error (Text):", error);
      throw new Error(error.message || "Erro na geração de texto");
    }
  },

  generateImage: async (params: { prompt: string, images?: { data: string, mimeType: string }[], aspectRatio?: string, useProModel?: boolean }) => {
    try {
      return await apiCall('generate-image', {
        prompt: params.prompt,
        images: params.images,
        aspectRatio: params.aspectRatio,
        useProModel: params.useProModel
      });
    } catch (error: any) {
      console.error("API Error (Image):", error);
      throw new Error(error.message || "Erro na geração de imagem");
    }
  },

  generateVideo: async (params: { prompt: string, image?: { data: string, mimeType: string }, aspectRatio?: string }) => {
    try {
      return await apiCall('generate-video', {
        prompt: params.prompt,
        image: params.image,
        aspectRatio: params.aspectRatio
      });
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
