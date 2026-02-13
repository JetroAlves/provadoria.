
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Globe, 
  ArrowRight, 
  Loader2, 
  Check, 
  Sparkles,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppRoute } from '../../types';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();

  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    setStoreSlug(generateSlug(val));
  };

  // Simulate slug availability check
  useEffect(() => {
    if (storeSlug.length < 3) {
      setSlugError(null);
      return;
    }

    setIsCheckingSlug(true);
    const timer = setTimeout(() => {
      // Logic simulation: slugs ending in "test" are "taken"
      if (storeSlug.endsWith('teste')) {
        setSlugError('Este endereço já está em uso por outra marca.');
      } else {
        setSlugError(null);
      }
      setIsCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [storeSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError || !storeName || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await completeOnboarding(storeName, storeSlug);
      navigate(AppRoute.DASHBOARD);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Inter'] selection:bg-black selection:text-white overflow-hidden">
      {/* Top Header Navigation */}
      <header className="p-8 md:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xl tracking-tighter">P</span>
          </div>
          <h1 className="text-black text-xl font-black tracking-tight uppercase">Provadoria AI</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full mb-4">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Configuração Inicial</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Dê nome à sua <br /> <span className="text-indigo-600">Vitrine Digital.</span>
            </h2>
            <p className="text-slate-500 font-medium italic">Como você gostaria que seus clientes encontrassem sua marca?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6 bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
              
              {/* Brand Name */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nome da sua Marca</label>
                <div className="relative group">
                  <Store className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={22} />
                  <input 
                    autoFocus
                    required
                    value={storeName}
                    onChange={handleNameChange}
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-lg font-black focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-200"
                    placeholder="Minha Boutique Premium"
                  />
                </div>
              </div>

              {/* Public URL Slug */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">URL da sua Vitrine Pública</label>
                <div className="relative group">
                  <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={22} />
                  <div className="flex bg-slate-50 rounded-2xl overflow-hidden pl-16 pr-4 py-5 group-focus-within:ring-4 group-focus-within:ring-black/5 transition-all">
                    <span className="text-slate-300 font-bold select-none">provadoria.ai/loja/</span>
                    <input 
                      required
                      value={storeSlug}
                      onChange={(e) => setStoreSlug(generateSlug(e.target.value))}
                      className="flex-1 bg-transparent border-none text-slate-900 font-black outline-none placeholder:text-slate-200"
                      placeholder="minha-boutique"
                    />
                    {isCheckingSlug ? (
                      <Loader2 size={16} className="animate-spin text-slate-300" />
                    ) : storeSlug.length >= 3 && !slugError ? (
                      <Check size={18} className="text-emerald-500" />
                    ) : null}
                  </div>
                </div>

                {slugError && (
                  <div className="flex items-center gap-2 px-2 text-rose-500 animate-in fade-in slide-in-from-left-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{slugError}</span>
                  </div>
                )}
              </div>

              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                 <LinkIcon className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                 <p className="text-[10px] text-indigo-900 font-medium leading-relaxed italic">
                   Este endereço será usado para gerar todos os links dos seus produtos no Provador Virtual e Marketing IA. Você poderá alterá-lo nas configurações depois.
                 </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!slugError || !storeName}
              className="w-full py-6 bg-black text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-4 active:scale-95"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              {isSubmitting ? 'Configurando Ecossistema...' : 'Finalizar Setup & Entrar'}
            </button>
          </form>
        </div>
      </main>

      {/* Progress Decoration */}
      <footer className="p-8 md:px-16 flex justify-center">
         <div className="flex gap-2">
           <div className="w-12 h-1 bg-black rounded-full"></div>
           <div className="w-12 h-1 bg-black rounded-full"></div>
           <div className="w-12 h-1 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
         </div>
      </footer>
    </div>
  );
};

export default Onboarding;