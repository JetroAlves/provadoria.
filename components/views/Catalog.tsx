
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  Plus, 
  Edit3, 
  Sparkles, 
  UserCircle, 
  Eye, 
  ChevronDown, 
  X, 
  ArrowRight, 
  Package, 
  Trash2,
  ShoppingBag,
  Share2,
  ExternalLink,
  Check
} from 'lucide-react';
import { AppRoute } from '../../types';
import { useSettings } from '../../context/SettingsContext';

const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const { products, deleteProduct, settings, categories } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCopied, setIsCopied] = useState(false);

  // Gera a lista dinâmica de categorias para o filtro, sempre incluindo "Todos"
  const categoryOptions = useMemo(() => {
    const names = categories.map(c => c.name);
    return ['Todos', ...names];
  }, [categories]);

  // Fallback para slug caso não esteja definido nas configurações
  const storeSlug = settings.publicStoreSlug || settings.storeName
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-') || 'minha-loja';

  const publicStoreUrl = `${window.location.origin}${window.location.pathname}#/loja/${storeSlug}`;

  const handleShareCatalog = () => {
    navigator.clipboard.writeText(publicStoreUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenPublicStore = () => {
    window.open(publicStoreUrl, '_blank');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, statusFilter, products]);

  const handleEditProduct = (id: string) => {
    navigate(`/catalog/edit/${id}`);
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/loja/${storeSlug}/produto/${productId}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 relative pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Catálogo de Produtos</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Gerencie e visualize seu inventário inteligente.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-1">
            <button 
              onClick={handleShareCatalog}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isCopied ? 'bg-emerald-500 text-white' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              {isCopied ? <Check size={16} /> : <Share2 size={16} />}
              {isCopied ? 'Link Copiado!' : 'Compartilhar Catálogo'}
            </button>
            <div className="w-[1px] h-6 bg-slate-100 mx-1"></div>
            <button 
              onClick={handleOpenPublicStore}
              title="Visualizar Vitrine Pública"
              className="p-3 text-slate-400 hover:text-black hover:bg-slate-50 rounded-xl transition-all"
            >
              <ExternalLink size={18} />
            </button>
          </div>

          <button 
            onClick={() => navigate(AppRoute.CATALOG_NEW)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-95 shrink-0"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 p-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm sticky top-24 z-30">
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
        
        <div className="flex gap-2">
          <div className="relative min-w-[200px]">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none pl-6 pr-12 py-5 bg-slate-50 border-none rounded-2xl text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-black/5 outline-none cursor-pointer"
            >
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          <button 
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-3 px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
              isFilterDrawerOpen ? 'bg-black text-white border-black shadow-xl' : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
            }`}
          >
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700">
              <div className="aspect-[4/5] p-3 overflow-hidden relative bg-slate-50/50 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-1000" 
                />
                <div className={`absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-xl border ${
                  product.status === 'active' 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}>
                  {product.status === 'active' ? 'Ativo' : 'Inativo'}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button onClick={() => handleViewProduct(product.id)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all text-slate-900 shadow-2xl"><Eye size={20} /></button>
                  <button onClick={() => handleEditProduct(product.id)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all text-slate-900 shadow-2xl"><Edit3 size={20} /></button>
                  <button onClick={() => deleteProduct(product.id)} className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all text-rose-600 shadow-2xl"><Trash2 size={20} /></button>
                </div>
                <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-slate-900/90 backdrop-blur rounded-xl text-[8px] font-black text-white uppercase tracking-widest">
                  {product.category}
                </div>
              </div>
              <div className="px-8 pb-8 pt-6 flex-1 flex flex-col">
                <h3 className="font-black text-sm uppercase tracking-tight text-slate-900 mb-1 truncate group-hover:text-black">
                  {product.name}
                </h3>
                <p className="text-xl font-black text-slate-900 tracking-tighter">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center gap-2 mt-2">
                   <Package size={12} className="text-slate-400" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.stock} em estoque</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-8">
                  <button onClick={() => navigate(`${AppRoute.PRODUCT_SHOWCASE}?productId=${product.id}`)} className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"><Sparkles size={14} /> Showcase</button>
                  <button onClick={() => navigate(`${AppRoute.VIRTUAL_TRYON}?productId=${product.id}`)} className="flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"><UserCircle size={14} /> Provador</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
          <ShoppingBag className="text-slate-200 mb-6" size={64} />
          <h2 className="text-2xl font-black text-slate-900">Catálogo Vazio</h2>
          <p className="text-slate-400 mt-2 font-medium italic">Adicione seu primeiro produto para começar.</p>
        </div>
      )}
      {isFilterDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] animate-in fade-in" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[110] shadow-[0_0_80px_rgba(0,0,0,0.1)] p-12 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-slate-900">Filtros</h2>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="space-y-10">
               <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Status</label>
                  <div className="flex gap-2">
                    {['all', 'active', 'inactive'].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-black text-white' : 'bg-slate-50 text-slate-400'}`}>
                        {s === 'all' ? 'Tudo' : s === 'active' ? 'Ativo' : 'Off'}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Categorias</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {categoryOptions.map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedCategory === cat ? 'bg-black text-white border-black' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>{cat}</button>
                    ))}
                  </div>
               </div>
            </div>
            <button onClick={() => setIsFilterDrawerOpen(false)} className="w-full mt-auto py-6 bg-black text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">Aplicar <ArrowRight size={18} /></button>
          </div>
        </>
      )}
    </div>
  );
};

export default Catalog;
