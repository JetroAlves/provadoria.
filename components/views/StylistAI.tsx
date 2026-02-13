
import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Image as ImageIcon, 
  RefreshCw,
  ShoppingBag,
  Info,
  Save,
  Trash2,
  Download,
  Share2,
  X,
  AlertCircle
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { apiService } from '../../services/api';

interface LookResult {
  explanation: string;
  suggestedItems: string[];
}

const OCCASIONS = ['Casual', 'Trabalho/Executivo', 'Festa/Gala', 'Encontro Romântico', 'Praia/Resort', 'Streetwear'];
const STYLES = ['Minimalista', 'Audacioso/Moderno', 'Romântico', 'Vintage/Retrô', 'Boho Chic', 'Clássico'];

const StylistAI: React.FC = () => {
  const { settings, savedLooks, saveLook, deleteLook } = useSettings();
  
  const [formData, setFormData] = useState({
    occasion: '', style: settings.brandStyle, bodyType: 'Padrão', colorPreference: 'Tons Neutros'
  });

  const [step, setStep] = useState<'form' | 'result'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookResult, setLookResult] = useState<LookResult | null>(null);
  const [generatedLookImage, setGeneratedLookImage] = useState<string | null>(null);
  const [viewingLook, setViewingLook] = useState<any | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.occasion !== '' && formData.style !== '';

  const generateLook = async () => {
    if (!isFormValid || isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.generateText({
        prompt: `Gere um look completo para: Ocasião: ${formData.occasion}, Estilo: ${formData.style}.`,
        systemInstruction: `Você é um Stylist de Moda Premium para a marca "${settings.storeName}". 
          ESTILO DA MARCA: ${settings.brandStyle}. Retorne um JSON com 'explanation' e 'suggestedItems' (array).`,
        jsonMode: true
      });
      setLookResult(JSON.parse(response.text || '{}'));
      setStep('result');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao consultar o Stylist IA. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateLookImage = async () => {
    if (!lookResult || isGeneratingImage) return;
    
    setIsGeneratingImage(true);
    setError(null);
    try {
      const prompt = `Full body high-fashion editorial photo of a person wearing: ${lookResult.suggestedItems.join(', ')}. Style: ${formData.style}, ${formData.occasion} setting. Elegant lighting.`;
      const response = await apiService.generateImage({
        prompt,
        aspectRatio: "3:4"
      });
      
      if (response.image) {
        setGeneratedLookImage(response.image);
      }
    } catch (err: any) {
      console.error(err);
      setError('Falha na renderização visual do look.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = async () => {
    if (!lookResult) return;
    await saveLook({
      occasion: formData.occasion,
      style: formData.style,
      result: lookResult,
      image: generatedLookImage
    });
    alert('Look salvo no inventário de curadoria!');
  };

  const resetForm = () => {
    setStep('form');
    setLookResult(null);
    setGeneratedLookImage(null);
    setError(null);
  };

  // ... (UI remains identical)
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-2xl shadow-lg shadow-slate-200"><Sparkles className="text-white" size={24} /></div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Stylist IA</h1>
            <p className="text-slate-500 text-sm font-medium">Consultoria conectada à sua loja.</p>
          </div>
        </div>
        {step === 'result' && (
          <button onClick={resetForm} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
            Nova Proposta
          </button>
        )}
      </div>

      {step === 'form' ? (
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-12 space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Sparkles size={120} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">1. Ocasião</label>
              <div className="flex flex-wrap gap-3">
                {OCCASIONS.map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => handleInputChange('occasion', opt)} 
                    className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      formData.occasion === opt ? 'bg-black text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">2. Estilo Desejado</label>
              <div className="flex flex-wrap gap-3">
                {STYLES.map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => handleInputChange('style', opt)} 
                    className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      formData.style === opt ? 'bg-black text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-start gap-4 animate-in shake duration-500">
              <AlertCircle className="text-rose-500 shrink-0" size={20} />
              <p className="text-[11px] font-bold text-rose-800 uppercase leading-tight tracking-tight">{error}</p>
            </div>
          )}

          <button 
            onClick={generateLook} 
            disabled={!isFormValid || isLoading} 
            className="w-full py-6 bg-black text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all hover:bg-slate-800 disabled:opacity-20"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />} 
            {isLoading ? 'Analisando Tendências...' : 'Gerar Proposta Estratégica'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10 animate-in slide-in-from-left duration-700">
            <div className="space-y-4">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Proposta do Especialista</span>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Look Curado</h2>
            </div>
            
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 italic text-slate-600 text-sm leading-relaxed shadow-inner">
              "{lookResult?.explanation}"
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Peças Recomendadas</label>
              {lookResult?.suggestedItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{item}</span>
                  <ShoppingBag size={18} className="text-slate-300 group-hover:text-black transition-colors" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                onClick={generateLookImage} 
                disabled={isGeneratingImage || !!generatedLookImage} 
                className="py-5 rounded-2xl border-4 border-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-30"
              >
                {isGeneratingImage ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />} 
                Visualizar Editorial
              </button>
              <button 
                onClick={handleSave} 
                className="py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-95"
              >
                <Save size={18} /> Salvar Look
              </button>
            </div>
            
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-[9px] font-black uppercase text-center border border-rose-100">
                {error}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 aspect-[3/4] rounded-[3.5rem] overflow-hidden bg-slate-100 border-8 border-white shadow-2xl flex items-center justify-center relative group">
            {isGeneratingImage && (
              <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                 <Loader2 className="animate-spin" size={48} />
                 <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Renderizando Visão 8K...</p>
              </div>
            )}
            
            {generatedLookImage ? (
              <img src={generatedLookImage} className="w-full h-full object-cover animate-in zoom-in-95 duration-1000" alt="Generated Look" />
            ) : (
              <div className="text-center opacity-10 flex flex-col items-center gap-6">
                <ImageIcon size={100} strokeWidth={0.5} />
                <p className="text-xl font-black uppercase tracking-[0.4em]">Editorial IA</p>
              </div>
            )}

            {generatedLookImage && (
              <div className="absolute bottom-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-transform"><Download size={20} /></button>
                 <button className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-transform"><Share2 size={20} /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Histórico Section & Modal remains the same */}
      <div className="pt-20 border-t border-slate-200 space-y-12">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 italic uppercase">Histórico de Curadoria <span className="text-slate-300 font-medium normal-case">({savedLooks.length})</span></h2>
        </div>
        
        {savedLooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {savedLooks.map((look) => (
              <div 
                key={look.id} 
                onClick={() => setViewingLook(look)} 
                className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
              >
                <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden flex items-center justify-center">
                  {look.image_url ? (
                    <img src={look.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Look" />
                  ) : (
                    <Sparkles className="text-slate-200" size={40} />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-6 text-center">
                    <button onClick={(e) => { e.stopPropagation(); deleteLook(look.id); }} className="p-3 bg-white/20 hover:bg-rose-500 text-white rounded-full transition-colors"><Trash2 size={18} /></button>
                    <p className="text-white text-[9px] font-black uppercase tracking-widest">Ver Detalhes</p>
                  </div>
                </div>
                <div className="p-5 border-t border-slate-50 bg-white">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate">{look.ai_result?.suggestedItems?.[0] || 'Novo Look'}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{look.occasion}</p>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6"><ShoppingBag size={40} /></div>
             <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Nenhum look salvo no histórico</p>
          </div>
        )}
      </div>

      {viewingLook && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-in fade-in" onClick={() => setViewingLook(null)} />
          <div className="relative bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] animate-in zoom-in-95 duration-500">
            <div className="w-full md:w-1/2 bg-slate-50 flex items-center justify-center p-12 overflow-hidden relative">
              {viewingLook.image_url ? (
                <img src={viewingLook.image_url} className="w-full h-full object-cover rounded-[2rem] shadow-2xl" alt="Look Detail" />
              ) : (
                <Sparkles size={120} className="opacity-5" />
              )}
              <div className="absolute top-8 left-8 bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-black uppercase tracking-widest">{viewingLook.occasion}</p>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 p-12 md:p-20 space-y-12 overflow-y-auto scrollbar-hide">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] italic">Análise de <br /> Estilo</h2>
                  <p className="text-slate-400 text-xs mt-6 font-bold uppercase tracking-widest">Data: {new Date(viewingLook.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setViewingLook(null)} className="p-4 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-500">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] italic text-slate-600 text-sm leading-relaxed border border-slate-100 shadow-inner">
                "{viewingLook.ai_result?.explanation}"
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-4">Outfit Composition</label>
                <div className="grid grid-cols-1 gap-3">
                  {viewingLook.ai_result?.suggestedItems.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 font-black text-[11px] uppercase text-slate-800 tracking-tight shadow-sm">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex-1 py-5 bg-black text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                  <Share2 size={16} /> Compartilhar com Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StylistAI;