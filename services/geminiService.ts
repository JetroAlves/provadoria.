
import { supabase } from '@/lib/supabase';

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado');
  }
  return session.access_token;
};

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

export const generateText = async (prompt: string, systemInstruction?: string, jsonSchema?: boolean) => {
  return await apiCall('generate-text', { prompt, systemInstruction, jsonSchema });
};

export const generateImage = async (prompt: string, images: { data: string, mimeType: string }[] = [], aspectRatio: string = "1:1", useProModel: boolean = false) => {
  return await apiCall('generate-image', { prompt, images, aspectRatio, useProModel });
};

export const generateVideo = async (prompt: string, image?: { data: string, mimeType: string }, aspectRatio: string = '9:16') => {
  return await apiCall('generate-video', { prompt, image, aspectRatio });
};
