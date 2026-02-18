
import React, { useState, useMemo, useEffect } from 'react';
import {
  Camera,
  Wand2,
  Loader2,
  ImageIcon,
  Trash2,
  Sun,
  Snowflake,
  Leaf,
  Flower,
  Layout,
  Smartphone,
  Instagram,
  Monitor,
  CheckCircle2,
  Save,
  Download,
  Shirt,
  Scissors,
  Sparkles,
  Footprints,
  Watch,
  User,
  Users
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useGallery } from '../../context/GalleryContext';
import { uploadFile, base64ToBlob } from '../../lib/supabase';
import { useCampaignGenerator, Gender, Format } from '../../hooks/useCampaignGenerator';
import AnnotatedOverlay from './AnnotatedOverlay';

// --- CONSTANTS ---
const SEASON_CATEGORIES = [
  { id: 'verao', name: 'Verão', icon: Sun },
  { id: 'inverno', name: 'Inverno', icon: Snowflake },
  { id: 'outono', name: 'Outono', icon: Leaf },
  { id: 'primavera', name: 'Primavera', icon: Flower }
];

const SCENES = [
  // VERÃO
  { id: 'noronha', category: 'verao', name: 'Fernando de Noronha', description: 'Praia paradisíaca.', prompt: 'High-end fashion editorial in Fernando de Noronha, Brazil. Baía do Sancho background. Golden sand, bright tropical sun.' },
  { id: 'trancoso', category: 'verao', name: 'Trancoso – Quadrado', description: 'Rústico chic.', prompt: 'Fashion editorial in the Quadrado of Trancoso, Bahia. Colorful rustic houses, shadow-casting trees. Chic bohemian luxury.' },
  { id: 'beach-club', category: 'verao', name: 'Ibiza Beach Club', description: 'Lounge exclusivo.', prompt: 'Exclusive Ibiza beach club. White umbrellas, turquoise water background, luxury lounge furniture. Golden hour.' },
  {
    id: 'marco-zero-recife',
    category: 'verao',
    name: 'Marco Zero – Recife Antigo',
    description: 'Urbano tropical histórico.',
    prompt: 'High-fashion editorial at Marco Zero, Recife Antigo. Colonial architecture, colorful facades, tropical sunlight, cinematic urban Brazilian vibe.'
  },
  {
    id: 'carnaval-pernambuco',
    category: 'verao',
    name: 'Carnaval de Pernambuco',
    description: 'Editorial vibrante.',
    prompt: 'Fashion editorial inspired by Pernambuco carnival. Colorful confetti, vibrant movement, artistic lighting, energetic Brazilian celebration aesthetic.'
  },
  {
    id: 'iate-luxo',
    category: 'verao',
    name: 'Iate de Luxo',
    description: 'Resort sofisticado.',
    prompt: 'Luxury fashion editorial on a modern yacht. Deep blue ocean, golden sunset light, exclusive resort atmosphere.'
  },
  {
    id: 'arraial-dajuda',
    category: 'verao',
    name: 'Arraial d’Ajuda',
    description: 'Praia charmosa.',
    prompt: 'Fashion editorial in Arraial d’Ajuda beach village. Rustic colorful houses, tropical nature, warm coastal light.'
  },
  {
    id: 'jeri-dunas',
    category: 'verao',
    name: 'Jericoacoara – Dunas',
    description: 'Minimalismo natural.',
    prompt: 'High-fashion shoot in Jericoacoara sand dunes. Clean desert lines, golden sand, dramatic sunlight, minimalist luxury aesthetic.'
  },

  // INVERNO
  { id: 'gramado', category: 'inverno', name: 'Gramado – RS', description: 'Charme europeu.', prompt: 'Winter fashion editorial in Gramado. European-style stone architecture, hydrangeas, misty morning. Sophisticated winter mood.' },
  { id: 'paris-street', category: 'inverno', name: 'Ruas de Paris', description: 'Urbano clássico.', prompt: 'Fashion photography in Paris streets. Haussmann architecture, overcast soft light, elegant city atmosphere.' },
  {
    id: 'campos-jordao',
    category: 'inverno',
    name: 'Campos do Jordão',
    description: 'Inverno sofisticado.',
    prompt: 'Winter fashion editorial in Campos do Jordão. Alpine-style architecture, cold mist, cozy luxury atmosphere.'
  },
  {
    id: 'curitiba-urbano',
    category: 'inverno',
    name: 'Curitiba Moderna',
    description: 'Urbano contemporâneo.',
    prompt: 'Modern urban fashion shoot in Curitiba. Contemporary architecture, soft cloudy lighting, minimalist city mood.'
  },
  {
    id: 'serra-gaucha-vinicula',
    category: 'inverno',
    name: 'Vinícola Serra Gaúcha',
    description: 'Rústico elegante.',
    prompt: 'Winter editorial in a Serra Gaúcha winery. Stone buildings, foggy hills, warm rustic textures.'
  },

  // OUTONO
  { id: 'vale-vinhedos', category: 'outono', name: 'Vale dos Vinhedos', description: 'Vinícola dourada.', prompt: 'Autumn editorial in a vineyard. Rolling hills, orange and yellow leaves, rustic stone winery background.' },
  { id: 'studio-clean', category: 'outono', name: 'Estúdio Minimalista', description: 'Fundo infinito.', prompt: 'Minimalist fashion studio with organic props. Cyclorama wall, soft box lighting, beige and earth tones.' },
  {
    id: 'ouro-preto',
    category: 'outono',
    name: 'Ouro Preto Colonial',
    description: 'Histórico artístico.',
    prompt: 'Fashion editorial in Ouro Preto colonial streets. Baroque architecture, warm golden tones, cinematic artistic mood.'
  },
  {
    id: 'fazenda-cafe',
    category: 'outono',
    name: 'Fazenda de Café',
    description: 'Elegância rural.',
    prompt: 'Editorial in a Brazilian coffee farm. Rustic wooden textures, golden afternoon light, countryside elegance.'
  },

  // PRIMAVERA
  { id: 'holambra', category: 'primavera', name: 'Campos de Flores', description: 'Vibrante e colorido.', prompt: 'Fashion editorial in a flower field. Vibrant tulips, bright daylight, joyful spring atmosphere.' },
  { id: 'oscar-freire', category: 'primavera', name: 'Oscar Freire', description: 'Luxo urbano.', prompt: 'High-end urban fashion at Oscar Freire street. Luxury storefronts, cosmopolitan energy, bright morning light.' },
  {
    id: 'ibirapuera',
    category: 'primavera',
    name: 'Parque Ibirapuera',
    description: 'Natureza urbana.',
    prompt: 'Fashion editorial at Ibirapuera Park. Modern architecture, green landscapes, bright spring daylight.'
  },
  {
    id: 'inhotim',
    category: 'primavera',
    name: 'Inhotim – Arte Contemporânea',
    description: 'Arte e natureza.',
    prompt: 'High-fashion shoot at a contemporary art garden inspired by Inhotim. Sculptures, modern architecture, lush greenery.'
  },
  {
    id: 'studio-premium',
    category: 'primavera',
    name: 'Estúdio Premium',
    description: 'Editorial high-end.',
    prompt: 'Luxury fashion studio with cinematic lighting, textured backdrop, premium editorial aesthetic, Vogue-style photography.'
  }
];

const FORMATS = [
  { id: '9:16', name: 'Stories', icon: Smartphone },
  { id: '1:1', name: 'Feed', icon: Instagram },
  { id: '4:5', name: 'Retrato', icon: User },
  { id: '16:9', name: 'Wide', icon: Monitor }
];

const SLOT_ICONS = {
  top: Shirt,
  bottom: Scissors,
  fullbody: Sparkles,
  shoes: Footprints,
  accessory: Watch
};

const CreativeStudio: React.FC = () => {
  const { addToGallery } = useGallery();
  const {
    state,
    filteredProducts,
    filteredAvatars,
    isGenerating,
    generatedImages,
    setGeneratedImages,
    actions,
    helpers
  } = useCampaignGenerator();

  const [activeSlotFilter, setActiveSlotFilter] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);

  // Inicializa a cena padrão quando a categoria muda
  useEffect(() => {
    const firstScene = SCENES.find(s => s.category === state.collectionId);
    if (firstScene) actions.setScene(firstScene.id);
  }, [state.collectionId]);

  const handleGenerateClick = () => {
    let prompt;
    if (state.isAnnotatedMode) {
      prompt = `EXTREME HIGH-END FASHION EDITORIAL. PURE WHITE BACKGROUND. Model perfectly centered. Studio lighting. Vogue aesthetic. No props. Clean background.`;
    } else {
      const scene = SCENES.find(s => s.id === state.sceneId);
      prompt = scene?.prompt || '';
    }
    actions.generateCampaign(prompt);
  };

  const flattenImage = async (imgUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imgUrl);

        ctx.drawImage(img, 0, 0);

        // Render annotations onto canvas
        const annotations = [];
        if (state.selectedProducts.fullbody) {
          annotations.push({ product: state.selectedProducts.fullbody, x: 0.7, y: 0.4, side: 'right' });
        } else {
          if (state.selectedProducts.top) annotations.push({ product: state.selectedProducts.top, x: 0.3, y: 0.3, side: 'left' });
          if (state.selectedProducts.bottom) annotations.push({ product: state.selectedProducts.bottom, x: 0.7, y: 0.6, side: 'right' });
        }
        if (state.selectedProducts.shoes) annotations.push({ product: state.selectedProducts.shoes, x: 0.3, y: 0.85, side: 'left' });
        state.selectedProducts.accessories.forEach((acc, idx) => {
          annotations.push({ product: acc, x: 0.7, y: 0.2 + idx * 0.1, side: 'right' });
        });

        annotations.forEach(ann => {
          const isLeft = ann.side === 'left';
          const x = ann.x * canvas.width;
          const y = ann.y * canvas.height;
          const labelMargin = 0.05 * canvas.width; // 5% de margem
          const labelX = isLeft ? labelMargin : canvas.width - labelMargin;

          // Draw Line
          ctx.beginPath();
          ctx.moveTo(labelX, y);
          ctx.lineTo(x, y);
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.2;
          ctx.stroke();

          // Draw Point
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = 'black';
          ctx.globalAlpha = 0.6;
          ctx.fill();

          // Draw Text
          ctx.font = 'bold 24px Inter, sans-serif';
          ctx.textAlign = isLeft ? 'left' : 'right';
          ctx.fillStyle = 'black';
          ctx.globalAlpha = 1;

          const text = ann.product.name.toUpperCase();
          const price = `R$ ${ann.product.price.toLocaleString('pt-BR')}`;

          const textX = isLeft ? 0.02 * canvas.width : canvas.width - 0.02 * canvas.width;

          ctx.fillText(text, textX, y - 10);
          ctx.font = '20px Inter, sans-serif';
          ctx.fillStyle = '#64748b'; // slate-500
          ctx.fillText(price, textX, y + 25);
        });

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imgUrl;
    });
  };

  const handleSaveToGallery = async (img: string) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const finalImg = state.isAnnotatedMode ? await flattenImage(img) : img;
      const blob = await base64ToBlob(finalImg);
      const url = await uploadFile('ai-generated', `campaign_${Date.now()}.png`, blob);

      // Coletar IDs dos produtos selecionados
      const productIds: string[] = [];
      if (state.selectedProducts.top) productIds.push(state.selectedProducts.top.id);
      if (state.selectedProducts.bottom) productIds.push(state.selectedProducts.bottom.id);
      if (state.selectedProducts.fullbody) productIds.push(state.selectedProducts.fullbody.id);
      if (state.selectedProducts.shoes) productIds.push(state.selectedProducts.shoes.id);
      state.selectedProducts.accessories.forEach(a => productIds.push(a.id));

      const scene = SCENES.find(s => s.id === state.sceneId);

      addToGallery(url, {
        avatarId: state.selectedAvatarId,
        productIds,
        collectionId: state.collectionId,
        sceneId: state.sceneId,
        format: state.format,
        prompt: scene?.prompt
      });

      alert('Campanha salva na Galeria com todos os metadados!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar na galeria.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredScenes = useMemo(() => SCENES.filter(s => s.category === state.collectionId), [state.collectionId]);

  const visibleProducts = useMemo(() => {
    if (activeSlotFilter === 'all') return filteredProducts;
    return filteredProducts.filter(p => helpers.getProductSlot(p) === activeSlotFilter);
  }, [filteredProducts, activeSlotFilter, helpers]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-10rem)] animate-in fade-in pb-20">

      {/* SIDEBAR: WIZARD */}
      <aside className="w-full lg:w-80 space-y-6 shrink-0 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-y-auto max-h-fit lg:max-h-[calc(100vh-12rem)] scrollbar-hide">
        <div className="flex items-center gap-3 mb-2">
          <Camera className="text-slate-400" size={18} />
          <h2 className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Campaign Generator</h2>
        </div>

        {/* 1. Escolha do Modo */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">0. Modo de Trabalho</label>
          <div className="flex p-1 bg-slate-50 rounded-2xl gap-1">
            <button
              onClick={() => actions.setAnnotatedMode(false)}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!state.isAnnotatedMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Campanha
            </button>
            <button
              onClick={() => actions.setAnnotatedMode(true)}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${state.isAnnotatedMode ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Look Anotado
            </button>
          </div>
        </div>

        {/* 1. Gênero */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">1. Público & Gênero</label>
          <div className="flex p-1 bg-slate-50 rounded-2xl">
            {['Feminino', 'Masculino', 'Unissex'].map(g => (
              <button
                key={g}
                onClick={() => actions.setGender(g as any)}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${state.gender === g ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Seleção de Produtos */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">2. Produtos (Look)</label>
            <div className="flex gap-1">
              {Object.entries(SLOT_ICONS).map(([key, Icon]) => (
                <button
                  key={key}
                  onClick={() => setActiveSlotFilter(activeSlotFilter === key ? 'all' : key)}
                  className={`p-1.5 rounded-lg transition-all ${activeSlotFilter === key ? 'bg-indigo-100 text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}
                  title={key}
                >
                  <Icon size={12} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-hide">
            {visibleProducts.map(p => {
              const slot = helpers.getProductSlot(p);
              const isSelected =
                state.selectedProducts[slot as keyof typeof state.selectedProducts] === p ||
                (Array.isArray(state.selectedProducts.accessories) && state.selectedProducts.accessories.some(a => a.id === p.id));

              return (
                <button
                  key={p.id}
                  onClick={() => actions.toggleProduct(p)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all group ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-100 scale-95' : 'border-transparent hover:border-slate-200'}`}
                >
                  <img src={p.image} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-white drop-shadow-md" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 p-1 bg-white/90 rounded-md">
                    {React.createElement(SLOT_ICONS[slot] || Shirt, { size: 8, className: 'text-slate-900' })}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[8px] text-slate-400 text-center font-medium">Selecione peças para compor o look completo.</p>
        </div>

        {/* 3. Avatar */}
        <div className="space-y-4 pt-2 border-t border-slate-50">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">3. Casting (Avatar)</label>
            <button
              onClick={() => actions.setAvatar('')}
              className="text-[8px] text-rose-500 font-bold uppercase hover:underline"
              disabled={!state.selectedAvatarId}
            >
              Limpar
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto p-1 no-scrollbar">
            {filteredAvatars.length > 0 ? filteredAvatars.map(a => (
              <button
                key={a.id}
                onClick={() => actions.setAvatar(a.id)}
                className={`relative w-16 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${state.selectedAvatarId === a.id ? 'border-black scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={a.image_url} className="w-full h-full object-cover" />
                {state.selectedAvatarId === a.id && <div className="absolute bottom-1 right-1"><CheckCircle2 size={12} className="text-black bg-white rounded-full" /></div>}
              </button>
            )) : (
              <div className="w-full py-4 text-center border border-dashed border-slate-200 rounded-xl">
                <Users className="mx-auto text-slate-300" size={16} />
                <p className="text-[8px] text-slate-400 mt-1">Sem avatares para {state.gender}</p>
              </div>
            )}
          </div>
        </div>

        {!state.isAnnotatedMode && (
          <div className="space-y-4 pt-2 border-t border-slate-50">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">4. Coleção & Contexto</label>
            <div className="flex p-1 bg-slate-50 rounded-2xl gap-1">
              {SEASON_CATEGORIES.map(s => (
                <button key={s.id} onClick={() => actions.setCollection(s.id)} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${state.collectionId === s.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  <s.icon size={14} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">{s.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
              {filteredScenes.map(s => (
                <button key={s.id} onClick={() => actions.setScene(s.id)} className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${state.sceneId === s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}`}>
                  <div className="overflow-hidden">
                    <p className={`text-[9px] font-black uppercase leading-none truncate ${state.sceneId === s.id ? 'text-white' : 'text-slate-900'}`}>{s.name}</p>
                    <p className={`text-[7px] mt-1 opacity-60 leading-tight truncate ${state.sceneId === s.id ? 'text-indigo-100' : 'text-slate-400'}`}>{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Formato */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">5. Formato de Campanha</label>
          <div className="grid grid-cols-4 gap-2">
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => actions.setFormat(f.id as any)} className={`flex flex-col items-center justify-center gap-2 p-2 rounded-2xl border-2 transition-all ${state.format === f.id ? 'bg-black border-black text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}>
                <f.icon size={14} />
                <span className="text-[7px] font-black uppercase">{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={isGenerating}
          className="w-full py-6 bg-black text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-800 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
          {isGenerating ? 'Produzindo Campanha...' : state.isAnnotatedMode ? 'Gerar Look Anotado' : 'Gerar Ensaio'}
        </button>
      </aside>

      {/* MAIN: PREVIEW AREA */}
      <main className="flex-1 bg-slate-100/50 border-4 border-white rounded-[3.5rem] p-10 min-h-[600px] shadow-inner relative flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Resultados da Campanha</h3>
          {generatedImages.length > 0 && <button onClick={() => setGeneratedImages([])} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline">Limpar Mesa</button>}
        </div>

        {generatedImages.length === 0 && !isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
            <ImageIcon size={64} className="text-slate-300 mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">Configure o briefing da campanha <br /> para iniciar a produção visual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-hide p-2">
            {isGenerating && (
              <div className={`rounded-3xl bg-white/60 backdrop-blur-xl border-4 border-white flex flex-col items-center justify-center gap-6 animate-pulse shadow-xl ${state.format === '9:16' ? 'aspect-[9/16]' : state.format === '16:9' ? 'aspect-video' : 'aspect-[3/4]'}`}>
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 text-center px-4">Compondo Cenário <br /> & Iluminação...</p>
              </div>
            )}
            {generatedImages.map((img, idx) => (
              <div key={idx} className={`group relative rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border-4 border-white animate-in zoom-in-95 duration-700 ${state.format === '9:16' ? 'aspect-[9/16]' : state.format === '16:9' ? 'aspect-video' : 'aspect-[3/4]'}`}>
                <img src={img} className="w-full h-full object-cover" />

                {state.isAnnotatedMode && (
                  <AnnotatedOverlay
                    products={state.selectedProducts}
                  />
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 z-30">
                  <button
                    onClick={() => handleSaveToGallery(img)}
                    disabled={isSaving}
                    className="w-48 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Salvar Galeria
                  </button>
                  <button
                    onClick={async () => {
                      const finalImg = state.isAnnotatedMode ? await flattenImage(img) : img;
                      const link = document.createElement('a');
                      link.href = finalImg;
                      link.download = 'look_anotado.png';
                      link.click();
                    }}
                    className="w-48 py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                  >
                    <Download size={14} /> Download HQ
                  </button>
                  <button onClick={() => setGeneratedImages(prev => prev.filter((_, i) => i !== idx))} className="p-3 bg-rose-500/20 text-white rounded-full hover:bg-rose-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CreativeStudio;
