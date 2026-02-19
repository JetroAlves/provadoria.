
import React, { useState, useRef, useMemo } from 'react';
import {
  UserCircle,
  Upload,
  Sparkles,
  Loader2,
  X,
  ShoppingBag,
  Download,
  Share2,
  Check,
  Shirt,
  Footprints,
  Watch,
  Scissors,
  Plus,
  Trash2,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Product } from '../../types';
import { apiService } from '../../services/api';

// Definição dos Slots de Composição
type OutfitSlot = 'top' | 'bottom' | 'shoes' | 'accessory' | 'fullbody';

interface OutfitState {
  top: Product | null;
  bottom: Product | null;
  shoes: Product | null;
  accessory: Product | null;
  fullbody: Product | null;
}

const VirtualTryOn: React.FC = () => {
  const { products } = useSettings();

  // State: Cliente e Resultado
  const [clientImage, setClientImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  // State: Configuração do Look
  const [activeSlot, setActiveSlot] = useState<OutfitSlot>('top');
  const [selectedGender, setSelectedGender] = useState<'Feminino' | 'Masculino' | 'Unissex'>('Feminino');
  const [outfit, setOutfit] = useState<OutfitState>({
    top: null, bottom: null, shoes: null, accessory: null, fullbody: null
  });

  // State: Controle da API
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... (Filters and slot logic remain the same) ...
  const getSlotForCategory = (category: string): OutfitSlot => {
    const cat = category.toLowerCase();
    if (cat.includes('vestido') || cat.includes('conjunto') || cat.includes('macacão')) return 'fullbody';
    if (cat.includes('calça') || cat.includes('short') || cat.includes('saia')) return 'bottom';
    if (cat.includes('sapato') || cat.includes('tênis') || cat.includes('bota')) return 'shoes';
    if (cat.includes('acessório') || cat.includes('bolsa') || cat.includes('boné')) return 'accessory';
    return 'top';
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const productSlot = p.wearableType || getSlotForCategory(p.category);
      let slotMatch = false;
      if (activeSlot === 'fullbody') {
        slotMatch = productSlot === 'fullbody';
      } else {
        slotMatch = productSlot === activeSlot;
      }
      const genderMatch = !p.gender || p.gender === 'Unissex' || p.gender === selectedGender;
      return slotMatch && genderMatch;
    });
  }, [products, activeSlot, selectedGender]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientImage(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectProduct = (product: Product) => {
    setOutfit(prev => {
      const newState = { ...prev };
      if (activeSlot === 'fullbody') {
        newState.top = null;
        newState.bottom = null;
        newState.fullbody = product;
      } else if (activeSlot === 'top' || activeSlot === 'bottom') {
        newState.fullbody = null;
        newState[activeSlot] = product;
      } else {
        newState[activeSlot] = product;
      }
      return newState;
    });
  };

  const removeProduct = (slot: OutfitSlot) => {
    setOutfit(prev => ({ ...prev, [slot]: null }));
  };

  const handleGenerateOutfit = async () => {
    const activeItems = (Object.entries(outfit) as [string, Product | null][]).filter(([_, p]) => p !== null) as [string, Product][];

    if (!clientImage || activeItems.length === 0 || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGenerationStep('Inicializando IA...');

    try {
      const clientMedia = {
        data: clientImage.split(',')[1],
        mimeType: clientImage.split(',')[0].split(':')[1].split(';')[0]
      };

      const imagesParts: any[] = [clientMedia];

      let promptDescription = `TASK: HYPER-REALISTIC SIMULTANEOUS VIRTUAL TRY-ON.
      INPUTS:
      - IMAGE 1: The Client (Target Body). Preserve facial identity, skin tone, hair, and pose exactly.
      `;

      let imgIndex = 2;
      for (const [slot, product] of activeItems) {
        if (!product) continue;
        setGenerationStep(`Processando ${product.name}...`);

        const prodMedia = await apiService.urlToBase64(product.image);
        imagesParts.push(prodMedia);

        promptDescription += `- IMAGE ${imgIndex}: ${slot.toUpperCase()} GARMENT ("${product.name}"). Apply this item to the client.\n`;
        imgIndex++;
      }

      promptDescription += `
      INSTRUCTIONS:
      1. Generate A SINGLE final image where the client is wearing ALL the provided garments AT ONCE.
      2. LOGIC:
         - If TOP + BOTTOM are provided, tuck them naturally or layer them based on standard fashion rules.
         - If SHOES are provided, replace the client's footwear.
         - If ACCESSORIES are provided, place them correctly (e.g., bag in hand/shoulder).
      3. FIDELITY:
         - Maintain the EXACT texture, print, and material of all product images.
         - Adapt the fit realistically to the client's body shape and pose.
         - Do NOT generate multiple images. Synthesize the complete look in one shot.
      4. LIGHTING: Match the lighting of the new garments to the client's original environment.
      `;

      setGenerationStep('Renderizando Composição Final...');

      const response = await apiService.generateImage({
        prompt: promptDescription,
        images: imagesParts,
        aspectRatio: "3:4",
        useProModel: true
      });

      if (response.image) {
        setResultImage(response.image);
      } else {
        throw new Error("Billing inativo ou erro de geração.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro na geração. Tente menos peças ou outra foto.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'lumiere_outfit.png';
      link.click();
    }
  };

  // ... (UI remains identical)
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-2xl shadow-lg shadow-indigo-100">
            <Layers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Provador Multi-Peças</h1>
            <p className="text-slate-500 text-sm font-medium">Monte looks completos e gere em uma única etapa.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

        {/* COLUNA 1: Configuração do Look (Outfit Builder) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          {/* Seletor de Gênero */}
          <div className="p-1 bg-slate-100 rounded-xl flex">
            {['Feminino', 'Masculino', 'Unissex'].map(g => (
              <button
                key={g}
                onClick={() => setSelectedGender(g as any)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedGender === g ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Slots de Peças */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[600px] scrollbar-hide">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Composição do Look</h3>

            {/* Slot: Parte de Cima */}
            <div
              onClick={() => setActiveSlot('top')}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${activeSlot === 'top' ? 'border-black bg-slate-50' : 'border-slate-100 hover:border-slate-200'} ${outfit.fullbody ? 'opacity-30 pointer-events-none' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${outfit.top ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <Shirt size={18} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Parte de Cima</p>
                <p className="text-xs font-bold text-slate-900 truncate">{outfit.top ? outfit.top.name : 'Vazio'}</p>
              </div>
              {outfit.top && <button onClick={(e) => { e.stopPropagation(); removeProduct('top') }} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-full"><Trash2 size={14} /></button>}
            </div>

            {/* Slot: Parte de Baixo */}
            <div
              onClick={() => setActiveSlot('bottom')}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${activeSlot === 'bottom' ? 'border-black bg-slate-50' : 'border-slate-100 hover:border-slate-200'} ${outfit.fullbody ? 'opacity-30 pointer-events-none' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${outfit.bottom ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <Scissors size={18} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Parte de Baixo</p>
                <p className="text-xs font-bold text-slate-900 truncate">{outfit.bottom ? outfit.bottom.name : 'Vazio'}</p>
              </div>
              {outfit.bottom && <button onClick={(e) => { e.stopPropagation(); removeProduct('bottom') }} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-full"><Trash2 size={14} /></button>}
            </div>

            {/* Divider OR */}
            <div className="flex items-center gap-2">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[8px] font-black uppercase text-slate-300">OU</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            {/* Slot: Full Body */}
            <div
              onClick={() => setActiveSlot('fullbody')}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${activeSlot === 'fullbody' ? 'border-black bg-slate-50' : 'border-slate-100 hover:border-slate-200'} ${(outfit.top || outfit.bottom) ? 'opacity-30 pointer-events-none' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${outfit.fullbody ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <Sparkles size={18} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Peça Única</p>
                <p className="text-xs font-bold text-slate-900 truncate">{outfit.fullbody ? outfit.fullbody.name : 'Vazio'}</p>
              </div>
              {outfit.fullbody && <button onClick={(e) => { e.stopPropagation(); removeProduct('fullbody') }} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-full"><Trash2 size={14} /></button>}
            </div>

            <div className="h-px bg-slate-100 my-2"></div>

            {/* Slot: Sapatos */}
            <div
              onClick={() => setActiveSlot('shoes')}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${activeSlot === 'shoes' ? 'border-black bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${outfit.shoes ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <Footprints size={18} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Calçados</p>
                <p className="text-xs font-bold text-slate-900 truncate">{outfit.shoes ? outfit.shoes.name : 'Vazio'}</p>
              </div>
              {outfit.shoes && <button onClick={(e) => { e.stopPropagation(); removeProduct('shoes') }} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-full"><Trash2 size={14} /></button>}
            </div>

            {/* Slot: Acessório */}
            <div
              onClick={() => setActiveSlot('accessory')}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${activeSlot === 'accessory' ? 'border-black bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${outfit.accessory ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <Watch size={18} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Acessório</p>
                <p className="text-xs font-bold text-slate-900 truncate">{outfit.accessory ? outfit.accessory.name : 'Vazio'}</p>
              </div>
              {outfit.accessory && <button onClick={(e) => { e.stopPropagation(); removeProduct('accessory') }} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-full"><Trash2 size={14} /></button>}
            </div>
          </div>
        </div>

        {/* COLUNA 2: Área Visual (Cliente & Resultado) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-slate-100 rounded-[2.5rem] border-8 border-white shadow-2xl overflow-hidden relative group h-[500px]">

            {/* Estado de Geração */}
            {isGenerating && (
              <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                <Loader2 className="animate-spin text-black" size={48} />
                <div className="text-center space-y-2">
                  <p className="text-lg font-black uppercase tracking-tight text-slate-900">{generationStep}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Isso pode levar até 20 segundos</p>
                </div>
              </div>
            )}

            {/* Resultado ou Input */}
            {resultImage ? (
              <div className="w-full h-full relative animate-in zoom-in-95 duration-700 bg-slate-200">
                <img src={resultImage} className="w-full h-full object-contain" alt="Resultado IA" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 w-full justify-center px-4">
                  <button onClick={handleDownload} className="px-6 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                    <Download size={14} /> Baixar
                  </button>
                  <button onClick={() => setResultImage(null)} className="px-6 py-3 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                    Novo Teste
                  </button>
                </div>
              </div>
            ) : clientImage ? (
              <div className="w-full h-full relative bg-slate-200">
                <img src={clientImage} className="w-full h-full object-contain" alt="Client" />
                <button
                  onClick={() => { setClientImage(null); setResultImage(null) }}
                  className="absolute top-4 right-4 p-3 bg-white/50 backdrop-blur-md text-slate-900 rounded-full hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                >
                  <X size={18} />
                </button>

                {/* Floating Generate Button */}
                <div className="absolute bottom-6 left-6 right-6">
                  <button
                    onClick={handleGenerateOutfit}
                    disabled={Object.values(outfit).every(v => v === null) || isGenerating}
                    className="w-full py-5 bg-black text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 disabled:opacity-50 disabled:translate-y-4 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Sparkles size={18} /> Gerar Look Completo
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6">
                  <UserCircle size={40} className="text-slate-300" />
                </div>
                <p className="text-lg font-black uppercase tracking-tight text-slate-900">Foto do Cliente</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Clique para carregar a base</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in shake">
              <AlertCircle size={18} className="text-rose-500" />
              <p className="text-xs font-black uppercase text-rose-800 tracking-wide">{error}</p>
            </div>
          )}
        </div>

        {/* COLUNA 3: Catálogo Filtrado (Picker) */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-6 flex flex-col h-[500px] overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
              {activeSlot === 'top' ? 'Partes de Cima' :
                activeSlot === 'bottom' ? 'Partes de Baixo' :
                  activeSlot === 'shoes' ? 'Calçados' :
                    activeSlot === 'accessory' ? 'Acessórios' : 'Peças Únicas'}
            </h3>
            <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">{filteredProducts.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(p => {
                const isSelected = (Object.values(outfit) as (Product | null)[]).some(o => o?.id === p.id);

                return (
                  <button
                    key={p.id}
                    onClick={() => selectProduct(p)}
                    className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 transition-all text-left group ${isSelected
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                        : 'border-transparent hover:border-slate-100 hover:bg-slate-50'
                      }`}
                  >
                    <div className="w-10 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-100">
                      <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-[9px] font-black uppercase truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>{p.name}</p>
                      <p className="text-[8px] font-medium text-slate-400 truncate">R$ {p.price}</p>
                    </div>
                    {isSelected && <CheckCircle2 size={14} className="text-indigo-600 mr-1" />}
                  </button>
                )
              })
            ) : (
              <div className="py-20 text-center opacity-40">
                <ShoppingBag size={32} className="mx-auto mb-4 text-slate-300" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nenhuma peça encontrada</p>
              </div>
            )}
          </div>

          <button
            onClick={() => { }}
            className="w-full mt-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            Gerenciar Catálogo
          </button>
        </div>

      </div>
    </div>
  );
};

// Icon Helper for selections
const CheckCircle2 = ({ size, className }: { size: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default VirtualTryOn;