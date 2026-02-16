
import React, { useState } from 'react';
import {
  Store,
  MessageSquare,
  UserCircle,
  Monitor,
  Share2,
  CreditCard,
  ShieldCheck,
  Upload,
  Save,
  LogOut,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Globe,
  Layout,
  Search
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { supabase, uploadFile } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Pricing from './Pricing';

type TabId = 'profile' | 'branding' | 'public-store' | 'ai-models' | 'virtual-tryon' | 'marketing' | 'billing' | 'security';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Local state for form inputs before saving
  const [formData, setFormData] = useState(settings);

  // Sync local formData when settings are loaded from context
  React.useEffect(() => {
    if (settings.storeName !== 'Carregando...') {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerDeskUrl' | 'bannerMobileUrl') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(field);
    try {
      const fileName = `${user.id}/${field}_${Date.now()}.png`;
      const publicUrl = await uploadFile('avatars', fileName, file); // Reusing 'avatars' bucket or could use a 'stores' bucket
      handleInputChange(field, publicUrl);
    } catch (err) {
      console.error(`Erro no upload do ${field}:`, err);
    } finally {
      setIsUploading(null);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil da Loja', icon: Store },
    { id: 'branding', label: 'Branding & Voz', icon: MessageSquare },
    { id: 'public-store', label: 'Vitrine Pública', icon: Globe },
    { id: 'ai-models', label: 'Modelos IA', icon: UserCircle },
    { id: 'virtual-tryon', label: 'Provador Virtual', icon: Monitor },
    { id: 'marketing', label: 'Conteúdo & Marketing', icon: Share2 },
    { id: 'billing', label: 'Plano & Uso', icon: CreditCard },
    { id: 'security', label: 'Segurança', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Configurações</h1>
          <p className="text-slate-500 text-sm">Gerencie as preferências da sua loja e inteligência artificial.</p>
        </div>

        {activeTab !== 'billing' && activeTab !== 'security' && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 min-w-[160px]"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : saveSuccess ? <Check size={18} /> : <Save size={18} />}
            {isSaving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:w-72 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible no-scrollbar p-1 bg-white border border-slate-100 rounded-3xl lg:p-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === tab.id
                    ? 'bg-black text-white shadow-lg'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-400'} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-10">

            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900">Identidade da Loja</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nome da Loja</label>
                      <input
                        type="text"
                        value={formData.storeName}
                        onChange={(e) => handleInputChange('storeName', e.target.value)}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Público-alvo</label>
                      <input
                        type="text"
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        placeholder="Ex: Mulheres 25-45, Classe A/B"
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Logomarca da Loja</label>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Store className="text-slate-300" size={32} />
                        )}
                        {isUploading === 'logoUrl' && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <Loader2 className="animate-spin text-black" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                          <Upload size={14} />
                          Subir Logo
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                        </label>
                        <p className="text-[10px] text-slate-400 font-medium">Recomendado: SVG ou PNG (512x512px)</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Banner Desktop</label>
                      <div className="aspect-[21/9] w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
                        {formData.bannerDeskUrl ? (
                          <img src={formData.bannerDeskUrl} alt="Banner Desk" className="w-full h-full object-cover" />
                        ) : (
                          <Layout className="text-slate-300" size={32} />
                        )}
                        {isUploading === 'bannerDeskUrl' && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <Loader2 className="animate-spin text-black" size={20} />
                          </div>
                        )}
                        <label className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black text-white rounded-lg cursor-pointer transition-all backdrop-blur-sm">
                          <Upload size={14} />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bannerDeskUrl')} />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Banner Mobile</label>
                      <div className="aspect-[9/16] h-48 mx-auto bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
                        {formData.bannerMobileUrl ? (
                          <img src={formData.bannerMobileUrl} alt="Banner Mobile" className="w-full h-full object-cover" />
                        ) : (
                          <Monitor size={32} className="text-slate-300" />
                        )}
                        {isUploading === 'bannerMobileUrl' && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <Loader2 className="animate-spin text-black" size={20} />
                          </div>
                        )}
                        <label className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black text-white rounded-lg cursor-pointer transition-all backdrop-blur-sm">
                          <Upload size={14} />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bannerMobileUrl')} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Descrição Interna</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm min-h-[100px] resize-none focus:ring-2 focus:ring-black/5 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900">Estilo & Estética</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Minimalista', 'Luxo/Premium', 'Casual Chic', 'Streetwear', 'Boho', 'Romântico'].map(style => (
                      <button
                        key={style}
                        onClick={() => handleInputChange('brandStyle', style)}
                        className={`px-6 py-3 rounded-xl text-xs font-bold border-2 transition-all ${formData.brandStyle === style ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-slate-100 hover:border-slate-300 text-slate-500'
                          }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Public Store Section (NEW) */}
            {activeTab === 'public-store' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900">Publicação da Vitrine</h3>
                  <p className="text-sm text-slate-500 max-w-2xl">Gerencie como sua loja é exibida para os clientes finais.</p>

                  <div className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${formData.publicStoreActive ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.publicStoreActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-white'}`}>
                        <Globe size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Vitrine Online</p>
                        <p className={`text-xs ${formData.publicStoreActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {formData.publicStoreActive ? 'Sua loja está visível para o público.' : 'Sua loja está desativada para clientes.'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.publicStoreActive}
                        onChange={(e) => handleInputChange('publicStoreActive', e.target.checked)}
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {!formData.publicStoreActive && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="text-rose-500 shrink-0" size={18} />
                      <p className="text-[11px] text-rose-800 font-bold uppercase tracking-tight leading-relaxed">
                        Atenção: Ao desativar a vitrine, todos os links de produtos e categorias ficarão indisponíveis para seus clientes.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900">Personalização de URL</h3>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Slug da Loja</label>
                    <div className="flex bg-slate-50 rounded-2xl overflow-hidden p-1 border border-slate-100 focus-within:border-black transition-colors">
                      <div className="px-4 flex items-center bg-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">
                        provadoria.ai/loja/
                      </div>
                      <input
                        type="text"
                        value={formData.publicStoreSlug}
                        onChange={(e) => handleInputChange('publicStoreSlug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''))}
                        className="flex-1 p-4 bg-transparent border-none text-sm font-bold outline-none"
                        placeholder="minha-boutique"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Search className="text-slate-400" size={20} />
                    <h3 className="text-xl font-black text-slate-900">SEO & Visibilidade</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Meta Título (SEO)</label>
                      <input
                        type="text"
                        value={formData.seoTitle}
                        onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                        placeholder="Ex: Provadoria Boutique | Moda Exclusiva & Estilo IA"
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Meta Descrição (SEO)</label>
                      <textarea
                        value={formData.seoDescription}
                        onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                        placeholder="Ex: Descubra o futuro da moda com nossa curadoria premium..."
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm min-h-[100px] font-medium resize-none focus:ring-2 focus:ring-black/5 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Branding & Tone */}
            {activeTab === 'branding' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900">Personalidade da Voz (IA)</h3>
                  <p className="text-sm text-slate-500 max-w-2xl">Defina como nossa IA deve se comunicar para a <span className="font-bold text-black">{formData.storeName}</span>.</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {['Formal', 'Descontraído', 'Luxo', 'Jovem'].map(tone => (
                      <button
                        key={tone}
                        onClick={() => handleInputChange('brandTone', tone)}
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${formData.brandTone === tone ? 'bg-black text-white border-black shadow-lg' : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-600'
                          }`}
                      >
                        <p className="text-sm font-black">{tone}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Palavras-chave Desejadas</label>
                    <textarea
                      value={formData.keywordsToUse}
                      onChange={(e) => handleInputChange('keywordsToUse', e.target.value)}
                      placeholder="Ex: Exclusividade, Conforto, Sustentabilidade, Atemporal..."
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm min-h-[120px] resize-none focus:ring-2 focus:ring-black/5 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Palavras a Evitar</label>
                    <textarea
                      value={formData.keywordsToAvoid}
                      onChange={(e) => handleInputChange('keywordsToAvoid', e.target.value)}
                      placeholder="Ex: Barato, Promoção (use 'Oferta Especial'), Desconto..."
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm min-h-[120px] resize-none focus:ring-2 focus:ring-black/5 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: AI Models */}
            {activeTab === 'ai-models' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900">Preferências de Casting IA</h3>

                  <div className="space-y-4">
                    {[
                      { key: 'female', label: 'Modelo Feminino', desc: 'Ativar modelos mulheres adultas' },
                      { key: 'male', label: 'Modelo Masculino', desc: 'Ativar modelos homens adultos' },
                      { key: 'diversity', label: 'Diversidade de Biotipos', desc: 'Priorizar representação de corpos reais' }
                    ].map((pref) => (
                      <div key={pref.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div>
                          <p className="text-sm font-black text-slate-900">{pref.label}</p>
                          <p className="text-xs text-slate-500">{pref.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={(formData.aiModelPreferences as any)[pref.key]}
                            onChange={(e) => handleNestedChange('aiModelPreferences', pref.key, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Virtual Try-On */}
            {activeTab === 'virtual-tryon' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900">Integração E-commerce</h3>

                  <div className="flex items-center justify-between p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                        <Monitor size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-indigo-950">Ativar Provador na Loja Pública</p>
                        <p className="text-xs text-indigo-600/70">Exibir o botão de provador IA para seus clientes.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.virtualTryOnActive}
                        onChange={(e) => handleInputChange('virtualTryOnActive', e.target.checked)}
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Marketing */}
            {activeTab === 'marketing' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900">Padrões de Divulgação</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Hashtags Padrão</label>
                      <input
                        type="text"
                        value={formData.standardHashtags}
                        onChange={(e) => handleInputChange('standardHashtags', e.target.value)}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">CTA Preferido</label>
                      <input
                        type="text"
                        value={formData.standardCTA}
                        onChange={(e) => handleInputChange('standardCTA', e.target.value)}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Billing */}
            {activeTab === 'billing' && (
              <Pricing />
            )}

            {/* Tab: Security */}
            {activeTab === 'security' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900">Sua Conta</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <LogOut size={20} className="text-slate-400" />
                    </div>
                    <button className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Sair da Conta</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
