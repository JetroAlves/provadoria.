
import React, { useState } from 'react';
import { Megaphone, Sparkles, Copy, Check, Loader2, Instagram, Zap, Video as VideoIcon, Type as TypeIcon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { apiService } from '../../services/api';

const CONTENT_TYPES = [
  { id: 'instagram-post', name: 'Post Instagram', icon: Instagram },
  { id: 'reel-script', name: 'Roteiro de Reel', icon: VideoIcon },
  { id: 'ad-copy', name: 'Anúncio (Ads)', icon: Zap }
];

const Marketing: React.FC = () => {
  const { settings, products } = useSettings();
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [contentType, setContentType] = useState(CONTENT_TYPES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent(null);
    try {
      const product = products.find(p => p.id === selectedProductId);
      const type = CONTENT_TYPES.find(t => t.id === contentType);
      const prompt = `Gere um ${type?.name} para o produto "${product?.name}".`;
      const systemInstruction = `Copywriter sênior para a marca "${settings.storeName}". Tom: ${settings.brandTone}. CTA: ${settings.standardCTA}.`;

      const response = await apiService.generateText({ prompt, systemInstruction });
      setGeneratedContent(response.text || "Sem conteúdo gerado.");
    } catch (err) {
      alert('Erro ao gerar copy.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-200"><Megaphone className="text-white" size={24} /></div>
        <div><h1 className="text-3xl font-black text-slate-900">Estúdio de Marketing</h1><p className="text-slate-500 text-sm">Escrita estratégica baseada no seu catálogo.</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase text-slate-400">1. Selecionar Produto do Estoque</label>
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none">
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black uppercase text-slate-400">2. Tipo de Copy</label>
            <div className="grid grid-cols-1 gap-2">
              {CONTENT_TYPES.map(t => (
                <button key={t.id} onClick={() => setContentType(t.id)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${contentType === t.id ? 'bg-rose-50 border-rose-600' : 'bg-slate-50 border-transparent'}`}>
                  <div className={`p-2 rounded-xl ${contentType === t.id ? 'bg-rose-600 text-white' : 'bg-white text-slate-400'}`}><t.icon size={18} /></div>
                  <p className={`text-sm font-black ${contentType === t.id ? 'text-rose-900' : 'text-slate-800'}`}>{t.name}</p>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={isGenerating || !selectedProductId} className="w-full py-5 bg-black text-white rounded-3xl font-black text-lg shadow-2xl flex items-center justify-center gap-3">
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />} {isGenerating ? 'Escrevendo...' : 'Gerar Texto IA'}
          </button>
        </div>
        <div className="lg:col-span-7 bg-slate-900 rounded-[2.5rem] p-8 min-h-[500px] border-8 border-white shadow-2xl flex flex-col relative overflow-hidden">
          {isGenerating ? <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-pulse"><Loader2 size={48} className="animate-spin text-rose-500" /><p className="text-rose-500 font-black">Otimizando copy...</p></div> : generatedContent ? <div className="flex-1 flex flex-col h-full"><div className="flex justify-between mb-8"><span className="bg-rose-600 px-4 py-1 rounded-full text-white text-[10px] font-black uppercase">Conteúdo Sugerido</span><button onClick={() => { navigator.clipboard.writeText(generatedContent); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-white/60 hover:text-white flex items-center gap-2 text-xs font-bold">{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado!' : 'Copiar'}</button></div><div className="flex-1 bg-white/5 rounded-3xl p-8 overflow-y-auto text-slate-300 whitespace-pre-wrap leading-relaxed">{generatedContent}</div></div> : <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30"><TypeIcon size={48} className="text-white" /><p className="text-white font-black mt-4">Sua copy estratégica aparecerá aqui</p></div>}
        </div>
      </div>
    </div>
  );
};

export default Marketing;