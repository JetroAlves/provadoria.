
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Sparkles,
  MessageCircle,
  UserCircle,
  X,
  ChevronRight,
  Info,
  ArrowRight,
  Heart,
  Share2,
  AlertCircle,
  Home
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Product } from '../../types';

// CATEGORIES removed to use real ones from context

const PublicStore: React.FC = () => {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const { settings, products, categories, isLoading, loadPublicStore } = useSettings();

  const [activeCategory, setActiveCategory] = useState('Tudo');
  const [activeGender, setActiveGender] = useState('Todos');
  const [activeType, setActiveType] = useState('Todos');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Validate Store Accessibility
  const isAvailable = settings.publicStoreActive && storeSlug === settings.publicStoreSlug;

  // Advanced Filtering and Sorting
  const publicProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const isActive = p.status === 'active' && p.stock > 0;
      const matchesCategory = activeCategory === 'Tudo' || p.category === activeCategory;
      const matchesGender = activeGender === 'Todos' || p.gender === activeGender;
      const matchesType = activeType === 'Todos' || p.wearableType === activeType;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      return isActive && matchesCategory && matchesGender && matchesType && matchesSearch;
    });

    // Sorting Logic
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'newest') return (b.lastGenerated ? new Date(b.lastGenerated).getTime() : 0) - (a.lastGenerated ? new Date(a.lastGenerated).getTime() : 0);
      return 0;
    });
  }, [products, activeCategory, activeGender, activeType, searchTerm, sortBy]);

  useEffect(() => {
    if (storeSlug) {
      loadPublicStore(storeSlug);
    }
  }, [storeSlug]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openProduct = (p: Product) => {
    navigate(`/loja/${storeSlug}/produto/${p.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
          <span className="text-white font-black text-3xl tracking-tighter">P</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-slate-100 border-t-[#E11D48] rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Provadoria Intelligence</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-slate-300">
          <AlertCircle size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Vitrine Indisponível</h1>
          <p className="text-slate-500 max-w-sm mx-auto font-medium italic">
            Esta loja não está aceitando visitas públicas no momento ou o endereço está incorreto.
          </p>
        </div>
        <div className="pt-4">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Provadoria Fashion AI SaaS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-['Inter'] selection:bg-black selection:text-white">
      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 py-6 flex items-center justify-between ${scrolled ? 'bg-white/90 backdrop-blur-2xl border-b border-slate-100 py-4 shadow-sm' : 'bg-transparent text-white'
        }`}>
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(`/loja/${storeSlug}`)}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden ${scrolled ? 'bg-black text-white' : 'bg-white text-black'}`}>
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.storeName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-black text-xl tracking-tighter">{settings.storeName.charAt(0)}</span>
            )}
          </div>
          <span className={`font-black text-2xl tracking-tighter transition-colors duration-500 ${scrolled ? 'text-black' : 'text-white'}`}>
            {settings.storeName}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button className={`p-2 transition-transform hover:scale-110 relative ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            <ShoppingBag size={24} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-black">0</span>
          </button>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <section className="relative h-[90vh] w-full overflow-hidden flex items-center">
        <picture className="absolute inset-0 w-full h-full">
          <source
            media="(max-width: 768px)"
            srcSet={settings.bannerMobileUrl || settings.bannerDeskUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800"}
          />
          <img
            src={settings.bannerDeskUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600"}
            alt="Banner"
            className="w-full h-full object-cover scale-110 animate-slow-zoom"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 px-8 md:px-20 max-w-7xl mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-left-20 duration-1000">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[1px] w-12 bg-white/60"></span>
              <h2 className="text-white/60 text-xs font-black uppercase tracking-[0.4em]">Essential / {settings.brandStyle}</h2>
            </div>
            {settings.heroTitle ? (
              <h1 className="text-white text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85] uppercase">
                {settings.heroTitle.split(' ').slice(0, -1).join(' ')} <br />
                <span className="text-transparent border-text-white">{settings.heroTitle.split(' ').slice(-1)}</span>
              </h1>
            ) : (
              <h1 className="text-white text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85] uppercase">
                Curadoria <br /> <span className="text-transparent border-text-white">Premium</span>
              </h1>
            )}
            <p className="text-white/70 max-w-lg text-lg md:text-xl leading-relaxed mb-12 font-medium italic">
              {settings.publicStoreDescription || settings.description}
            </p>
            {/* Buttons removed as requested */}
          </div>
        </div>
      </section>

      {/* Prominent Search & Filters Bar */}
      <div className="sticky top-0 md:top-[88px] z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-4 p-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative z-30">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, SKU ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[180px]">
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full appearance-none pl-6 pr-12 py-5 bg-slate-50 border-none rounded-2xl text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-black/5 outline-none cursor-pointer"
                >
                  <option value="Tudo">Todas Categorias</option>
                  {categories.filter(c => c.status === 'active').map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
              </div>

              <div className="relative min-w-[180px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pl-6 pr-12 py-5 bg-slate-50 border-none rounded-2xl text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-black/5 outline-none cursor-pointer"
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="name">Nome (A-Z)</option>
                </select>
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-3 px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${isFilterOpen ? 'bg-black text-white border-black shadow-xl' : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
                  }`}
              >
                <Filter size={18} />
                Filtros
              </button>
            </div>
          </div>

          {/* Advanced Filter Panel */}
          {isFilterOpen && (
            <div className="py-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Gênero</p>
                <div className="flex flex-wrap gap-2">
                  {['Todos', 'Feminino', 'Masculino', 'Unissex'].map(g => (
                    <button
                      key={g}
                      onClick={() => setActiveGender(g)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${activeGender === g ? 'bg-black text-white border-black' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Tipo de Peça</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: 'Todos', label: 'Todos' },
                    { val: 'top', label: 'Blusas/Top' },
                    { val: 'bottom', label: 'Calças/Saias' },
                    { val: 'fullbody', label: 'Vestidos/Macacões' },
                    { val: 'accessory', label: 'Acessórios' }
                  ].map(t => (
                    <button
                      key={t.val}
                      onClick={() => setActiveType(t.val)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${activeType === t.val ? 'bg-black text-white border-black' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-end">
                <button
                  onClick={() => { setActiveGender('Todos'); setActiveType('Todos'); setActiveCategory('Tudo'); setSearchTerm(''); setSortBy('newest'); }}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors underline underline-offset-4"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {publicProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-20">
            {publicProducts.map(product => (
              <div
                key={product.id}
                className="group cursor-pointer flex flex-col"
                onClick={() => openProduct(product)}
              >
                <div className="aspect-[4/5] p-6 overflow-hidden bg-slate-50/50 relative mb-6 flex items-center justify-center rounded-[2rem] border border-slate-100 group-hover:shadow-xl transition-all duration-700">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                  />

                  {/* Hover Quick Action */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent">
                    <button className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2">
                      Ver Detalhes <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm">
                    <Sparkles className="text-amber-500" size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">IA Approved</span>
                  </div>
                </div>

                <div className="space-y-2 px-1">
                  <div className="flex justify-between items-start">
                    <div className="px-3 py-1 bg-slate-900/90 backdrop-blur rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
                      {product.category}
                    </div>
                    <Heart size={16} className="text-slate-200 hover:text-rose-500 cursor-pointer transition-colors" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 mb-1 truncate group-hover:text-black mt-4">
                    {product.name}
                  </h3>
                  <p className="text-xl font-black text-slate-900 pt-2 tracking-tighter">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-4">
            <ShoppingBag className="mx-auto text-slate-200" size={80} strokeWidth={1} />
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nenhuma peça encontrada</h2>
            <p className="text-slate-400 font-medium italic">Tente mudar os filtros ou termo de busca.</p>
            <button onClick={() => { setActiveCategory('Tudo'); setSearchTerm(''); }} className="mt-8 px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest">Limpar Filtros</button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-16">
          <div className="space-y-6 max-w-2xl">
            <h4 className="font-black text-6xl tracking-tighter uppercase leading-none">{settings.storeName}</h4>
            <p className="text-slate-400 font-medium italic leading-relaxed">"{settings.description}"</p>
          </div>

          <div className="w-full h-[1px] bg-white/10"></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full text-left">
            <div className="space-y-6">
              <h5 className="font-black text-xs uppercase tracking-[0.2em] text-white">Curadoria</h5>
              <ul className="space-y-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <li>Nova Coleção</li>
                <li>Best Sellers</li>
                <li>Lookbooks IA</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="font-black text-xs uppercase tracking-[0.2em] text-white">Suporte</h5>
              <ul className="space-y-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <li>Envio Global</li>
                <li>Trocas & Devoluções</li>
                <li>Pagamento Seguro</li>
              </ul>
            </div>
          </div>

          <div className="pt-16 flex flex-col md:flex-row justify-between w-full border-t border-white/5 gap-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
            <p>© {new Date().getFullYear()} {settings.storeName} x Provadoria Fashion AI.</p>
            <div className="flex gap-8">
              <span>Privacidade</span>
              <span>Termos</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Contact (Public View) */}
      {settings.whatsapp && (
        <a
          href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-10 right-10 z-[150] w-20 h-20 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-90 transition-all group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <MessageCircle size={36} className="relative z-10 fill-white group-hover:rotate-12 transition-transform" />
        </a>
      )}

      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite alternate;
        }
        .border-text-white {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.4);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PublicStore;