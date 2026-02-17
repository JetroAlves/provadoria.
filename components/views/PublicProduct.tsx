
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  UserCircle,
  Share2,
  Heart,
  X,
  Upload,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Product } from '../../types';
import { apiService } from '../../services/api';

const PublicProduct: React.FC = () => {
  const { storeSlug, productId } = useParams();
  const navigate = useNavigate();
  const { settings, products, isLoading: isContextLoading, loadPublicStore } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // IA States
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);
  const [isStylistModalOpen, setIsStylistModalOpen] = useState(false);
  const [clientPhoto, setClientPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [stylistResult, setStylistResult] = useState<any | null>(null);

  useEffect(() => {
    if (storeSlug) {
      loadPublicStore(storeSlug);
    }
  }, [storeSlug]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientPhoto(reader.result as string);
        setTryOnResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!isContextLoading) {
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
        setError(null);
      } else if (products.length > 0) {
        setError('O produto solicitado não foi encontrado nesta coleção.');
      }
      setInternalLoading(false);
    }
  }, [productId, products, isContextLoading]);

  const handleTryOnIA = async () => {
    if (!clientPhoto || !product || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const clientMedia = {
        data: clientPhoto.split(',')[1],
        mimeType: clientPhoto.split(',')[0].split(':')[1].split(';')[0]
      };

      const productMedia = await apiService.urlToBase64(product.image);
      const prompt = `VIRTUAL TRY-ON: Realistic professional fashion application. Dress the person in [USER_PHOTO] with the garment from [PRODUCT_PHOTO]. Preserve identity and textile quality.`;

      const response = await apiService.generateImage({
        prompt,
        images: [clientMedia, productMedia],
        aspectRatio: "3:4",
        useProModel: true
      });

      if (response.image) {
        setTryOnResult(response.image);
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado na IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestLook = async () => {
    if (!product || isGenerating) return;
    setIsStylistModalOpen(true);
    setIsGenerating(true);
    try {
      const response = await apiService.generateText({
        prompt: `Como um stylist de luxo, sugira uma composição de look para a peça: ${product.name}.`,
        jsonMode: true
      });

      const result = JSON.parse(response.text || '{}');
      setStylistResult(result);
    } catch (err: any) {
      setError("Falha ao consultar consultoria IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ... (Rest of UI)
  if (isContextLoading || internalLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-slate-50 border-t-[#E11D48] rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Renderizando Experiência...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in">
        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-rose-500">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Produto Indisponível</h2>
          <p className="text-slate-400 max-w-xs mx-auto font-medium italic">{error || 'Este item não faz mais parte da coleção atual.'}</p>
        </div>
        <button onClick={() => navigate(-1)} className="px-12 py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-2xl">Voltar para Loja</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Inter'] selection:bg-[#E11D48] selection:text-white pb-32 md:pb-0 animate-in fade-in duration-700">
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 bg-white/90 backdrop-blur-xl border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-50 rounded-full text-slate-900 transition-colors"><ArrowLeft size={24} /></button>
          <div className="hidden md:flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/loja/${storeSlug}`)}>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-black flex items-center justify-center">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.storeName} className="w-full h-full object-contain" />
              ) : (
                <span className="text-white text-[10px] font-black">{settings.storeName.charAt(0)}</span>
              )}
            </div>
            <span className="text-sm font-black tracking-tighter uppercase">{settings.storeName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000) }} className={`p-3 rounded-full transition-all ${isCopied ? 'bg-black text-white' : 'hover:bg-slate-50'}`}>{isCopied ? <Check size={20} /> : <Share2 size={20} />}</button>
          <button onClick={() => setIsLiked(!isLiked)} className={`p-3 rounded-full transition-all ${isLiked ? 'text-[#E11D48]' : 'text-slate-900'}`}><Heart size={22} fill={isLiked ? "currentColor" : "none"} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-28 px-0 md:px-8 grid grid-cols-1 md:grid-cols-12 md:gap-20">
        <section className="md:col-span-7 lg:col-span-8 px-4 md:px-0">
          <div className="aspect-[3/4] md:aspect-square lg:aspect-[4/5] bg-slate-50 overflow-hidden relative md:rounded-[3.5rem] shadow-sm group">
            <img src={product.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={product.name} />
            <div className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-white/50">
              <Sparkles size={14} className="text-[#E11D48]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Certified Luxury</span>
            </div>
          </div>
        </section>

        <section className="md:col-span-5 lg:col-span-4 p-8 md:pt-4 space-y-12">
          <div className="space-y-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{product.category}</span>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">{product.name}</h1>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            {product.description && <p className="text-slate-500 font-medium leading-relaxed italic text-lg border-l-2 border-slate-100 pl-6">{product.description}</p>}
          </div>

          {settings.virtualTryOnActive && (
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-inner">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[#E11D48]" size={20} />
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Visualização Inteligente IA</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setIsTryOnModalOpen(true)}
                  className="w-full py-5 bg-white border-2 border-black text-black font-black text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
                >
                  <UserCircle size={20} /> Provar com IA
                </button>
                <button
                  onClick={handleSuggestLook}
                  className="w-full py-5 bg-black text-white font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                >
                  <Sparkles size={18} /> Ver sugestão de look
                </button>
              </div>
            </div>
          )}

          <button className="w-full py-6 bg-black text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all">
            <ShoppingBag size={20} /> Adicionar ao Carrinho
          </button>
        </section>
      </main>

      {/* MODAL: PROVADOR VIRTUAL */}
      {isTryOnModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-in fade-in" onClick={() => !isGenerating && setIsTryOnModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden p-8 md:p-12 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Provador Pro <span className="text-[#E11D48]">.</span></h2>
              <button onClick={() => setIsTryOnModalOpen(false)} className="p-3 bg-slate-50 rounded-full transition-colors hover:bg-rose-50 text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>

            {!tryOnResult ? (
              <div className="space-y-8">
                {!clientPhoto ? (
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-black transition-all group p-10">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mb-6">
                      <Upload size={32} className="text-[#E11D48]" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Carregar sua foto para teste</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="aspect-[3/4] max-h-[450px] mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group relative">
                      <img src={clientPhoto} className="w-full h-full object-cover" />
                      <button onClick={() => setClientPhoto(null)} className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={24} /></button>
                    </div>
                    <button onClick={handleTryOnIA} disabled={isGenerating} className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30 shadow-2xl transition-all">
                      {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                      {isGenerating ? 'Processando Identidade...' : 'Processar Provador Pro'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="aspect-[3/4] max-h-[500px] mx-auto rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.2)] border-8 border-white"><img src={tryOnResult} className="w-full h-full object-cover" /></div>
                <div className="flex gap-4">
                  <button onClick={() => setTryOnResult(null)} className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Trocar Foto</button>
                  <button onClick={() => setIsTryOnModalOpen(false)} className="flex-1 py-5 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Finalizar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: STYLIST IA */}
      {isStylistModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-in fade-in" onClick={() => setIsStylistModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden p-10 md:p-14 animate-in slide-in-from-bottom-12 duration-500">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3"><Sparkles className="text-[#E11D48]" /> Stylist IA</h2>
              <button onClick={() => setIsStylistModalOpen(false)} className="p-3 bg-slate-50 rounded-full transition-colors hover:bg-rose-50 text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>

            {isGenerating ? (
              <div className="py-24 flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-[#E11D48] rounded-full animate-spin"></div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Consultando Tendências...</p>
              </div>
            ) : stylistResult ? (
              <div className="space-y-10 animate-in fade-in">
                <div className="p-8 bg-slate-50 rounded-[2.5rem] italic text-slate-600 text-lg leading-relaxed border border-slate-100 shadow-inner">
                  "{stylistResult.explanation}"
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] px-4">Outfit Composition</label>
                  <div className="grid grid-cols-1 gap-2">
                    {stylistResult.items?.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight shadow-sm">
                        <div className="w-2 h-2 bg-[#E11D48] rounded-full shadow-[0_0_8px_rgba(225,29,72,0.5)]" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setIsStylistModalOpen(false)} className="w-full py-6 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-900 transition-all">Fechar</button>
              </div>
            ) : (
              <div className="py-12 text-center space-y-6">
                <div className="w-20 h-20 bg-rose-50 rounded-full mx-auto flex items-center justify-center text-rose-500">
                  <AlertCircle size={32} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-rose-600">Erro ao carregar consultoria.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProduct;