
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Upload, 
  Check, 
  Loader2, 
  Info,
  Package,
  Plus,
  ShoppingBag,
  AlertCircle,
  Tag,
  Users
} from 'lucide-react';
import { AppRoute, Product } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { uploadFile, base64ToBlob } from '../../lib/supabase';

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, addProduct, updateProduct, deleteProduct, categories } = useSettings();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: categories[0]?.name || 'Geral',
    price: 0,
    stock: 0,
    description: '',
    status: 'active',
    image: '',
    gender: 'Feminino',
    wearableType: undefined
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for passed state from Showcase AI or other tools
    if (location.state) {
      const { prefilledImage, prefilledCategory, prefilledDescription } = location.state as any;
      if (prefilledImage) setPreviewImage(prefilledImage);
      
      setFormData(prev => ({
        ...prev,
        category: prefilledCategory || prev.category,
        description: prefilledDescription || prev.description,
        name: prefilledCategory ? `${prefilledCategory} Nova Coleção` : prev.name
      }));
    }

    // 2. Load existing product if editing
    if (isEditing) {
      const existing = products.find(p => p.id === id);
      if (existing) {
        setFormData(existing);
        setPreviewImage(existing.image);
      }
    } else if (categories.length > 0 && !formData.category && !location.state?.prefilledCategory) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [id, isEditing, products, categories, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      let finalImageUrl = previewImage || '';

      // Se houver uma nova imagem em base64/preview que precisa de upload
      if (previewImage && previewImage.startsWith('data:')) {
        const blob = await base64ToBlob(previewImage);
        const fileName = `prod_${Date.now()}.png`;
        finalImageUrl = await uploadFile('catalog', fileName, blob);
      }

      if (!finalImageUrl) {
        throw new Error("É necessário carregar uma imagem para o produto.");
      }

      const productData = {
        name: formData.name || 'Novo Produto',
        category: formData.category || (categories[0]?.name || 'Geral'),
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        description: formData.description,
        status: (formData.status as any) || 'active',
        image: finalImageUrl,
        gender: formData.gender || 'Feminino',
        wearableType: formData.wearableType
      };

      if (isEditing && id) {
        await updateProduct(id, productData);
      } else {
        await addProduct(productData);
      }
      setSaveSuccess(true);
      setTimeout(() => navigate(AppRoute.CATALOG), 1000);
    } catch (err: any) {
      console.error('Erro ao salvar produto:', err);
      // Tratamento específico para erro de schema
      if (err.message?.includes('column')) {
        setError('Erro de Banco de Dados: Coluna não encontrada. Verifique o schema no Supabase.');
      } else {
        setError(err.message || 'Falha ao salvar produto. Verifique sua conexão e os dados inseridos.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const WEARABLE_TYPES = [
    { id: 'top', label: 'Parte de Cima' },
    { id: 'bottom', label: 'Parte de Baixo' },
    { id: 'fullbody', label: 'Peça Única' },
    { id: 'shoes', label: 'Calçados' },
    { id: 'accessory', label: 'Acessório' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(AppRoute.CATALOG)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all text-slate-400 hover:text-black shadow-sm">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{isEditing ? 'Configurar Produto' : 'Cadastrar Produto'}</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">Informações técnicas e visuais da peça.</p>
          </div>
        </div>

        <div className="flex gap-4">
          {isEditing && (
            <button 
              type="button" 
              onClick={() => { if(window.confirm('Excluir este produto permanentemente?')) { deleteProduct(id!); navigate(AppRoute.CATALOG); } }} 
              className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-3"
            >
              <Trash2 size={20} /> Excluir
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isLoading || saveSuccess}
            className={`px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl active:scale-95 min-w-[200px] justify-center ${
              saveSuccess ? 'bg-emerald-500 text-white' : 'bg-black text-white hover:bg-slate-800'
            }`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : saveSuccess ? <Check size={20} /> : <Save size={20} />}
            {isLoading ? 'Sincronizando...' : saveSuccess ? 'Concluído!' : 'Salvar Produto'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4">
          <AlertCircle className="text-rose-500 shrink-0" size={24} />
          <p className="text-xs font-black text-rose-900 uppercase tracking-widest">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
            
            {/* Detalhes Gerais */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                <Info className="text-indigo-600" size={24} /> Detalhes Gerais
              </h3>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nome da Peça</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-300" placeholder="Ex: Saia Envelope Satin" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categoria</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} 
                    className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-black/5 outline-none appearance-none"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    {categories.length === 0 && <option value="Geral">Geral</option>}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estado no Catálogo</label>
                  <div className="flex gap-2 p-2 bg-slate-50 rounded-[2rem]">
                    {(['active', 'inactive'] as const).map(s => (
                      <button key={s} type="button" onClick={() => setFormData(prev => ({ ...prev, status: s }))} className={`flex-1 py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === s ? 'bg-white text-black shadow-lg' : 'text-slate-400'}`}>
                        {s === 'active' ? 'Ativo' : 'Pausado'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* NOVA SEÇÃO: CLASSIFICAÇÃO TÉCNICA */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><Tag size={12} /> Classificação (Slot)</label>
                    <select 
                      value={formData.wearableType || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, wearableType: e.target.value as any }))} 
                      className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-black/5 outline-none appearance-none"
                    >
                      <option value="">Automático (IA)</option>
                      {WEARABLE_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><Users size={12} /> Gênero</label>
                    <div className="flex gap-1 p-1 bg-slate-50 rounded-[2rem]">
                      {['Feminino', 'Masculino', 'Unissex'].map(g => (
                        <button 
                          key={g} 
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, gender: g as any }))} 
                          className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Composição & Estilo</label>
                <textarea rows={5} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-black/5 outline-none transition-all resize-none placeholder:text-slate-300" placeholder="Descreva material, caimento..." />
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50 space-y-6">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                <Package className="text-emerald-600" size={24} /> Logística & Valor
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Preço Sugerido (R$)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">R$</span>
                    <input type="number" required value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))} className="w-full pl-14 pr-6 py-6 bg-slate-50 border-none rounded-[2rem] text-lg font-black focus:ring-4 focus:ring-black/5 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Unidades Disponíveis</label>
                  <input type="number" required value={formData.stock} onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-lg font-black focus:ring-4 focus:ring-black/5 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 text-center">
            <h3 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-4">
              <Upload className="text-slate-400" size={24} /> Visual da Peça
            </h3>

            {!previewImage ? (
              <div onClick={() => document.getElementById('img-up')?.click()} className="aspect-square rounded-[3rem] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-white transition-all group p-12">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mb-6">
                  <Plus className="text-slate-300 group-hover:text-black" size={32} />
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregar Foto</span>
                <input type="file" id="img-up" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            ) : (
              <div className="relative group aspect-square rounded-[3rem] overflow-hidden border-8 border-slate-50 shadow-2xl transition-all">
                <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-6">
                  <button type="button" onClick={() => setPreviewImage(null)} className="p-5 bg-white text-rose-500 rounded-full hover:scale-110 transition-transform shadow-2xl">
                    <Trash2 size={28} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;