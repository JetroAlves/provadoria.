
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
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
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
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addFeedback, setAddFeedback] = useState(false);
  const { cartItems, totalItems, totalPrice, addItem, updateQuantity, removeItem, clearCart } = useCart();

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
    const sessionTriesKey = `tryon_tries_${storeSlug}`;
    const triesCount = parseInt(sessionStorage.getItem(sessionTriesKey) || '0');

    if (triesCount >= 3) {
      setError("Limite de 3 tentativas por sessão atingido. Volte mais tarde!");
      return;
    }

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
        useProModel: true,
        storeSlug: storeSlug // Pass context
      });

      if (response.image) {
        setTryOnResult(response.image);
        sessionStorage.setItem(sessionTriesKey, (triesCount + 1).toString());
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
        jsonMode: true,
        storeSlug: storeSlug
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
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 rounded-full hover:bg-slate-50 text-slate-900 transition-all relative"
          >
            <ShoppingBag size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-black animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </button>
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

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center bg-slate-50 rounded-2xl p-2 border border-slate-100">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all font-bold text-slate-400 hover:text-black"
                >
                  -
                </button>
                <span className="w-12 text-center font-black text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all font-bold text-slate-400 hover:text-black"
                >
                  +
                </button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantidade</p>
            </div>

            <button
              onClick={() => {
                addItem(product, quantity);
                setQuantity(1);
                setAddFeedback(true);
                setTimeout(() => setAddFeedback(false), 3000);
                setTimeout(() => setIsCartOpen(true), 500); // Open cart after a short delay
              }}
              className={`w-full py-6 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all ${addFeedback ? 'bg-green-500 text-white' : 'bg-black text-white'}`}
            >
              {addFeedback ? <Check size={20} /> : <ShoppingBag size={20} />}
              {addFeedback ? 'Adicionado com Sucesso!' : 'Adicionar ao Carrinho'}
            </button>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Control (Public View) */}
      <div className="fixed bottom-10 right-10 z-[150]">
        {settings.whatsapp && (
          <a
            href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <MessageCircle size={28} className="relative z-10 fill-white group-hover:rotate-12 transition-transform" />
          </a>
        )}
      </div>

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[300] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Sua Sacola <span className="text-[#E11D48]">.</span></h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar text-slate-900">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <ShoppingBag size={48} />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Sua sacola está vazia</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-6 group">
                      <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-black uppercase tracking-tight pr-4 text-slate-900">{item.name}</h4>
                          <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-400">R$ {item.price.toLocaleString('pt-BR')}</p>

                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all text-slate-400"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-[11px] font-black text-slate-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all text-slate-400"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total Estimado</p>
                  <p className="text-3xl font-black tracking-tighter text-slate-900">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <button
                  onClick={() => {
                    const message = encodeURIComponent(
                      `Olá! Gostaria de fazer o seguinte pedido na ${settings.storeName}:\n\n` +
                      cartItems.map(item => `- ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toLocaleString('pt-BR')})`).join('\n') +
                      `\n\n*Total: R$ ${totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*`
                    );
                    window.open(`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
                  }}
                  className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 hover:bg-slate-900 transition-all active:scale-[0.98]"
                >
                  Continuar no WhatsApp
                </button>
                <button
                  onClick={clearCart}
                  className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Limpar Sacola
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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