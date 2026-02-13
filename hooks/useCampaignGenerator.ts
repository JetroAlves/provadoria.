
import { useState, useMemo } from 'react';
import { Product, BrandAvatar } from '../types';
import { useSettings } from '../context/SettingsContext';
import { apiService } from '../services/api';

export type Gender = 'Feminino' | 'Masculino' | 'Unissex';
export type Slot = 'top' | 'bottom' | 'fullbody' | 'shoes' | 'accessory';
export type Format = '9:16' | '1:1' | '4:5' | '16:9';

interface CampaignState {
  gender: Gender;
  selectedAvatarId: string | null;
  selectedProducts: {
    top: Product | null;
    bottom: Product | null;
    fullbody: Product | null;
    shoes: Product | null;
    accessories: Product[]; // Array para múltiplos acessórios
  };
  collectionId: string; // Scene category
  sceneId: string;
  format: Format;
}

export const useCampaignGenerator = () => {
  const { products, avatars, settings } = useSettings();
  
  const [state, setState] = useState<CampaignState>({
    gender: 'Feminino',
    selectedAvatarId: null,
    selectedProducts: {
      top: null,
      bottom: null,
      fullbody: null,
      shoes: null,
      accessories: []
    },
    collectionId: 'verao',
    sceneId: '',
    format: '3:4' as Format // Default do sistema atual mapeado para editorial
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // Helpers de Classificação
  const getProductSlot = (p: Product): Slot => {
    if (p.wearableType) return p.wearableType;
    // Fallback baseado em nome/categoria
    const cat = p.category.toLowerCase() + ' ' + p.name.toLowerCase();
    if (cat.includes('vestido') || cat.includes('macacão') || cat.includes('conjunto')) return 'fullbody';
    if (cat.includes('calça') || cat.includes('saia') || cat.includes('short') || cat.includes('bermuda')) return 'bottom';
    if (cat.includes('sapato') || cat.includes('tênis') || cat.includes('bota') || cat.includes('sandália')) return 'shoes';
    if (cat.includes('bolsa') || cat.includes('óculos') || cat.includes('colar') || cat.includes('brinco') || cat.includes('chapéu')) return 'accessory';
    return 'top';
  };

  // Filtros
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const genderMatch = state.gender === 'Unissex' || !p.gender || p.gender === 'Unissex' || p.gender === state.gender;
      const statusMatch = p.status === 'active';
      return genderMatch && statusMatch;
    });
  }, [products, state.gender]);

  const filteredAvatars = useMemo(() => {
    return avatars.filter(a => {
        // Avatares infantis só devem aparecer se o usuário estiver explicitamente buscando por infantil 
        // Mas como o filtro de gênero "menino/menina" não existe no CampaignGenerator (apenas Fem/Masc),
        // Vamos permitir que apareçam e filtrar por compatibilidade de gênero base
        
        // Mapeamento: Menina -> Feminino, Menino -> Masculino
        const avatarGender = a.config?.gender;
        if (!avatarGender) return true;
        
        const mapGender = (g: string) => {
           if (g === 'Menina') return 'Feminino';
           if (g === 'Menino') return 'Masculino';
           return g;
        };

        const mappedAvatarGender = mapGender(avatarGender);

        if (state.gender === 'Unissex') return true;
        return mappedAvatarGender === state.gender;
    });
  }, [avatars, state.gender]);

  // Actions
  const setGender = (gender: Gender) => {
    setState(prev => ({ ...prev, gender, selectedProducts: { top: null, bottom: null, fullbody: null, shoes: null, accessories: [] }, selectedAvatarId: null }));
  };

  const toggleProduct = (product: Product) => {
    const slot = getProductSlot(product);
    
    setState(prev => {
      const newProducts = { ...prev.selectedProducts };

      if (slot === 'accessory') {
        const exists = newProducts.accessories.find(p => p.id === product.id);
        if (exists) {
          newProducts.accessories = newProducts.accessories.filter(p => p.id !== product.id);
        } else {
          newProducts.accessories = [...newProducts.accessories, product];
        }
      } else if (slot === 'fullbody') {
        // Se selecionar peça única, limpa top e bottom
        newProducts.fullbody = newProducts.fullbody?.id === product.id ? null : product;
        if (newProducts.fullbody) {
          newProducts.top = null;
          newProducts.bottom = null;
        }
      } else {
        // Top, Bottom, Shoes
        if (slot === 'top' || slot === 'bottom') {
           newProducts.fullbody = null; // Limpa fullbody se selecionar partes
        }
        // Toggle logic
        newProducts[slot] = (newProducts[slot] as Product)?.id === product.id ? null : product;
      }

      return { ...prev, selectedProducts: newProducts };
    });
  };

  const setAvatar = (id: string) => setState(prev => ({ ...prev, selectedAvatarId: id }));
  const setCollection = (id: string) => setState(prev => ({ ...prev, collectionId: id }));
  const setScene = (id: string) => setState(prev => ({ ...prev, sceneId: id }));
  const setFormat = (f: Format) => setState(prev => ({ ...prev, format: f }));

  // Generation Logic
  const generateCampaign = async (scenePrompt: string) => {
    const { selectedProducts, selectedAvatarId } = state;
    
    // Validação básica: Pelo menos 1 produto selecionado
    const hasProduct = selectedProducts.top || selectedProducts.bottom || selectedProducts.fullbody || selectedProducts.shoes || selectedProducts.accessories.length > 0;
    
    if (!hasProduct || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imagesParts: any[] = [];
      let promptBuilder = `FASHION CAMPAIGN GENERATION for brand "${settings.storeName}".\n`;
      promptBuilder += `CONTEXT: ${scenePrompt}\n`;
      
      let isChildModel = false;

      // 1. Avatar
      if (selectedAvatarId) {
        const avatar = avatars.find(a => a.id === selectedAvatarId);
        if (avatar) {
          const avatarMedia = await apiService.urlToBase64(avatar.image_url);
          imagesParts.push(avatarMedia);
          promptBuilder += `MODEL IDENTITY: Use the face and body structure from [IMAGE 1]. Maintain identity strictly.\n`;
          
          if (avatar.config?.modelCategory === 'child') {
            isChildModel = true;
            promptBuilder += `IMPORTANT: The model is a CHILD (${avatar.config.age}). Ensure AGE-APPROPRIATE STYLING, proportions, and modest presentation. Child-safe editorial.\n`;
          }
        }
      } else {
        promptBuilder += `MODEL: Professional ${state.gender} fashion model.\n`;
      }

      // 2. Products
      let imgIndex = imagesParts.length + 1;
      const activeItems: Product[] = [];
      if (selectedProducts.fullbody) activeItems.push(selectedProducts.fullbody);
      if (selectedProducts.top) activeItems.push(selectedProducts.top);
      if (selectedProducts.bottom) activeItems.push(selectedProducts.bottom);
      if (selectedProducts.shoes) activeItems.push(selectedProducts.shoes);
      selectedProducts.accessories.forEach(a => activeItems.push(a));

      for (const product of activeItems) {
        const prodMedia = await apiService.urlToBase64(product.image);
        imagesParts.push(prodMedia);
        promptBuilder += `GARMENT ${imgIndex}: Apply item from [IMAGE ${imgIndex}] ("${product.name}"). PRESERVE TEXTURE, COLOR AND DETAILS EXACTLY.\n`;
        imgIndex++;
      }

      promptBuilder += `\nINSTRUCTIONS:
      - Create a coherent high-fashion editorial image.
      - The model is wearing ALL the listed garments simultaneously.
      - Lighting: Cinematic, consistent with the scene.
      - Composition: ${state.format === '9:16' ? 'Full body vertical' : 'Editorial framing'}.
      - Quality: Photorealistic, 8K, Vogue Magazine style.
      ${isChildModel ? '- SAFETY: Ensure the image complies with child safety guidelines. Modest pose, innocent expression, age-appropriate environment.' : ''}
      `;

      const response = await apiService.generateImage({
        prompt: promptBuilder,
        images: imagesParts,
        aspectRatio: state.format === '4:5' ? '3:4' : state.format, // Mapping 4:5 to 3:4 as supported by API
        useProModel: true
      });

      if (response.image) {
        setGeneratedImages(prev => [response.image, ...prev]);
      }

    } catch (err: any) {
      console.error(err);
      setError('Erro ao gerar campanha. Verifique se o plano permite uso intensivo de tokens.');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    state,
    filteredProducts,
    filteredAvatars,
    isGenerating,
    error,
    generatedImages,
    setGeneratedImages,
    actions: {
      setGender,
      toggleProduct,
      setAvatar,
      setCollection,
      setScene,
      setFormat,
      generateCampaign
    },
    helpers: {
      getProductSlot
    }
  };
};
