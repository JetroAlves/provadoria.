
import React, { useState, useMemo } from 'react';
import { 
  Tags, 
  Plus, 
  Trash2, 
  Edit3, 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  X, 
  Globe, 
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Category } from '../../types';

const Categories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useSettings();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');

  const filteredCategories = useMemo(() => {
    return [...categories]
      .sort((a, b) => a.order - b.order)
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleNameChange = (val: string) => {
    setCategoryName(val);
    setCategorySlug(generateSlug(val));
  };

  const handleSave = async () => {
    if (!categoryName.trim()) return;
    
    setIsLoading(true);
    // Simulate API Delay
    await new Promise(r => setTimeout(r, 600));

    if (editingId) {
      updateCategory(editingId, { name: categoryName, slug: categorySlug });
      setFeedback({ type: 'success', message: 'Categoria atualizada com sucesso!' });
    } else {
      addCategory({ name: categoryName, slug: categorySlug, status: 'active' });
      setFeedback({ type: 'success', message: 'Categoria criada com sucesso!' });
    }

    setIsLoading(false);
    resetForm();
    setTimeout(() => setFeedback(null), 3000);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setCategoryName('');
    setCategorySlug('');
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setIsAdding(true);
  };

  const toggleStatus = (cat: Category) => {
    updateCategory(cat.id, { status: cat.status === 'active' ? 'inactive' : 'active' });
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...filteredCategories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    reorderCategories(newOrder);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Categorias</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Estruture a navegação da sua vitrine inteligente.</p>
        </div>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-95"
          >
            <Plus size={20} /> Nova Categoria
          </button>
        )}
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
          {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <p className="text-xs font-black uppercase tracking-widest">{feedback.message}</p>
        </div>
      )}

      {/* Adding / Editing Panel */}
      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {editingId ? 'Editar Categoria' : 'Criar Nova Categoria'}
            </h2>
            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nome da Categoria</label>
              <input 
                type="text" 
                autoFocus
                value={categoryName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Primavera/Verão"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-black/5 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Slug (URL amigável)</label>
              <div className="flex items-center bg-slate-100 rounded-2xl overflow-hidden px-4">
                <Globe size={16} className="text-slate-400" />
                <input 
                  type="text" 
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(generateSlug(e.target.value))}
                  className="w-full p-4 bg-transparent border-none text-sm font-bold outline-none text-slate-500"
                  placeholder="slug-automatico"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={resetForm}
              className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={isLoading || !categoryName.trim()}
              className="px-10 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              {editingId ? 'Atualizar Categoria' : 'Salvar Categoria'}
            </button>
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="relative group max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-black/5 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5 w-16">Ordem</th>
                <th className="px-8 py-5">Nome</th>
                <th className="px-8 py-5">Slug</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat, index) => (
                  <tr key={cat.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-1">
                        <button 
                          onClick={() => moveOrder(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-slate-200 rounded disabled:opacity-20 text-slate-400 hover:text-black transition-all"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <span className="text-xs font-black text-slate-900">{cat.order + 1}</span>
                        <button 
                          onClick={() => moveOrder(index, 'down')}
                          disabled={index === filteredCategories.length - 1}
                          className="p-1 hover:bg-slate-200 rounded disabled:opacity-20 text-slate-400 hover:text-black transition-all"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase">
                           {cat.name.charAt(0)}
                         </div>
                         <span className="font-black text-slate-900 text-sm">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <code className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
                         /{cat.slug}
                       </code>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleStatus(cat)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          cat.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                        }`}
                      >
                        {cat.status === 'active' ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(cat)}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-black hover:border-black transition-all shadow-sm"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Excluir esta categoria? Isso não removerá os produtos vinculados.')) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center space-y-4">
                    <Tags className="mx-auto text-slate-100" size={80} strokeWidth={1} />
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Nenhuma categoria encontrada</h3>
                      <p className="text-slate-400 text-sm font-medium italic mt-1">Clique em "Nova Categoria" para começar.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
