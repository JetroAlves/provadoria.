
import { GoogleGenAI, Type } from "@google/genai";
import { getSupabaseServer } from "../lib/supabase-server.js"; // Acesso administrativo seguro

// A API Key deve vir de variáveis de ambiente seguras no servidor
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });

const MODELS = {
  text: 'gemini-3-flash-preview',
  image: 'gemini-2.5-flash-image',
  imageHighQuality: 'gemini-3-pro-image-preview',
  video: 'veo-3.1-fast-generate-preview'
};

// --- CONFIGURAÇÃO DE CUSTOS E LIMITES ---
const COSTS = {
  text: 1,
  image: 5,
  tryOn: 8,
  avatar: 10,
  video: 40
};

// Helper para validar e deduzir créditos
const UsageController = {
  async validateAndAuthorize(userId: string, feature: keyof typeof COSTS, isPublic: boolean = false) {
    const supabase = getSupabaseServer();
    // 1. Buscar assinatura e plano do usuário
    const { data: sub, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .single();

    if (subError || !sub) {
      throw new Error(isPublic ? "Esta loja atingiu o limite de provador. Tente mais tarde." : "Assinatura não encontrada. Contate o suporte.");
    }

    const cost = COSTS[feature];
    const plan = sub.plans;

    // 2. Verificar permissões do plano
    if (feature === 'video' && !plan.allow_video) {
      throw new Error(`O plano não permite geração de vídeo.`);
    }

    // 4. Verificar saldo de créditos na tabela user_credits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (!credits || credits.balance < cost) {
      throw new Error(isPublic ? "Esta vitrine pausou o provador temporariamente." : `Créditos insuficientes. Custo: ${cost}, Disponível: ${credits?.balance || 0}.`);
    }

    return { sub, cost };
  },

  async deductCredits(userId: string, feature: keyof typeof COSTS, cost: number) {
    const supabase = getSupabaseServer();
    // Deduz créditos via RPC atômico
    const { error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: cost,
      p_feature: feature
    });

    if (error) {
      console.error("Erro ao deduzir créditos:", error);
      // Não lançamos erro aqui para não falhar a request se a geração já ocorreu, 
      // mas idealmente deveria ser transacional. Como o generate já foi feito, apenas logamos.
    }
  }
};

/**
 * Endpoint: /api/generate-text
 */
export const generateText = async (userId: string, prompt: string, systemInstruction?: string, jsonSchema?: boolean, isPublic: boolean = false) => {
  // Validação de Créditos
  const { cost } = await UsageController.validateAndAuthorize(userId, 'text', isPublic);

  const config: any = { systemInstruction };

  if (jsonSchema) {
    config.responseMimeType = "application/json";
    config.responseSchema = {
      type: Type.OBJECT,
      properties: {
        explanation: { type: Type.STRING },
        suggestedItems: { type: Type.ARRAY, items: { type: Type.STRING } },
        items: { type: Type.ARRAY, items: { type: Type.STRING } },
        pieceType: { type: Type.STRING },
        color: { type: Type.STRING },
        material: { type: Type.STRING }
      },
    };
  }

  const response = await ai.models.generateContent({
    model: MODELS.text,
    contents: prompt,
    config
  });

  // Dedução após sucesso
  await UsageController.deductCredits(userId, 'text', cost);

  return { text: response.text };
};

/**
 * Endpoint: /api/generate-image
 */
export const generateImage = async (
  userId: string,
  prompt: string,
  images: { data: string, mimeType: string }[] = [],
  aspectRatio: string = "1:1",
  useProModel: boolean = false,
  isPublic: boolean = false
) => {
  // Determinar tipo de custo
  let featureType: keyof typeof COSTS = 'image';
  if (images.length > 0) featureType = 'tryOn';
  if (prompt.toLowerCase().includes('avatar')) featureType = 'avatar';

  const { cost } = await UsageController.validateAndAuthorize(userId, featureType, isPublic);

  const model = useProModel ? MODELS.imageHighQuality : MODELS.image;

  const parts: any[] = images.map(img => ({
    inlineData: {
      data: img.data,
      mimeType: img.mimeType
    }
  }));

  parts.push({ text: prompt });

  const config: any = {
    imageConfig: { aspectRatio }
  };

  if (useProModel) {
    config.imageConfig.imageSize = "1K";
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part?.inlineData) {
    throw new Error("Nenhuma imagem gerada.");
  }

  // Dedução após sucesso
  await UsageController.deductCredits(userId, featureType, cost);

  return {
    image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
  };
};

/**
 * Endpoint: /api/generate-video
 */
export const generateVideo = async (userId: string, prompt: string, image?: { data: string, mimeType: string }, aspectRatio: string = '9:16') => {
  // Validação de Créditos e Limite de Vídeo
  const { cost } = await UsageController.validateAndAuthorize(userId, 'video');

  const input: any = {
    model: MODELS.video,
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: aspectRatio as any
    }
  };

  if (image) {
    input.image = {
      imageBytes: image.data,
      mimeType: image.mimeType
    };
  }

  let operation = await ai.models.generateVideos(input);

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!videoUri) {
    throw new Error("Falha na geração do vídeo.");
  }

  // Fetch e conversão compatível com navegador (sem Buffer)
  const videoResponse = await fetch(`${videoUri}&key=${process.env.GEMINI_API_KEY || process.env.API_KEY}`);
  const videoBlob = await videoResponse.blob();

  const videoArrayBuffer = await videoResponse.arrayBuffer();
  const base64Video = Buffer.from(videoArrayBuffer).toString('base64');

  // Dedução após sucesso
  await UsageController.deductCredits(userId, 'video', cost);

  return {
    videoBase64: `data:video/mp4;base64,${base64Video}`
  };
};
