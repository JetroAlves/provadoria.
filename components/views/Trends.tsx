
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  BarChart3, 
  Globe, 
  Instagram, 
  Search, 
  ChevronRight,
  Loader2,
  PieChart,
  Target,
  Layers,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { apiService } from '../../services/api';

const MOCK_GROWTH_DATA = [
  { name: 'Linho', growth: 85, color: '#10b981' },
  { name: 'Seda Pura', growth: 62, color: '#10b981' },
  { name: 'Veludo', growth: -15, color: '#f43f5e' },
  { name: 'Jeans Raw', growth: 48, color: '#10b981' },
  { name: 'Couro Vegano', growth: 74, color: '#10b981' },
  { name: 'Neon', growth: -42, color: '#f43f5e' },
];

const TRENDING_COLORS = [
  { name: 'Butter Yellow', hex: '#FFF3A3', sentiment: 'Alta Demanda', description: 'O novo neutro da temporada.' },
  { name: 'Deep Cherry', hex: '#580000', sentiment: 'Crescente', description: 'Elegância e profundidade em acessórios.' },
  { name: 'Soft Sage', hex: '#B2C2A3', sentiment: 'Estável', description: 'Ideal para peças casuais e linho.' },
  { name: 'Cobalt Blue', hex: '#0047AB', sentiment: 'Alerta: Saturação', description: 'Reduza estoque no próximo trimestre.' },
];

const Trends: React.FC = () => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await apiService.generateText({
        prompt: "Gere um resumo estratégico de tendências de moda para o próximo trimestre no Brasil. Foque em: 1. Cores principais, 2. Silhuetas em ascensão, 3. Tecidos e 4. Um alerta de risco para lojistas (ex: o que não comprar agora). Seja conciso e profissional.",
        systemInstruction: "Você é um Analista de Tendências Sênior do Provadoria AI, especializado em Business of Fashion e Varejo de Luxo. Forneça insights práticos focados em aumentar a margem de lucro e reduzir o encalhe de estoque."
      });
      setAiAnalysis(response.text || "Sem análise disponível.");
    } catch (error) {
      console.error(error);
      setAiAnalysis("Erro ao carregar análise. No momento, o mercado está focado em minimalismo 'Quiet Luxury' e tons terrosos.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  // ... (UI remains identical)
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-2xl shadow-lg">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Previsão de Tendências</h1>
            <p className="text-slate-500 text-sm italic">Dados globais processados em tempo real pela Provadoria AI.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-100 rounded-full flex items-center gap-2">
            <Globe size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Global Insights</span>
          </div>
          <button 
            onClick={fetchAIAnalysis}
            disabled={isAnalyzing}
            className="p-2.5 bg-black text-white rounded-full hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Social Buzz */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Instagram className="text-indigo-600" size={20} />
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded">Volume Alto</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500">Mencões em Redes Sociais</h3>
            <p className="text-2xl font-black text-slate-900">+42% este mês</p>
          </div>
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 w-3/4"></div>
          </div>
        </div>

        {/* Search Intent */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Search className="text-emerald-600" size={20} />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded">Intenção de Compra</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500">Buscas Diretas (SEO)</h3>
            <p className="text-2xl font-black text-slate-900">8.2k diárias</p>
          </div>
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-1/2"></div>
          </div>
        </div>

        {/* Conversion Probability */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Target className="text-amber-600" size={20} />
            </div>
            <span className="text-[10px] font-black text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded">Eficiência</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500">Probabilidade de Conversão</h3>
            <p className="text-2xl font-black text-slate-900">68.4% de ROI</p>
          </div>
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-[68%]"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: AI Commentary & Chart */}
        <div className="lg:col-span-8 space-y-8">
          {/* AI Analysis Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <PieChart size={18} className="text-white" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/60">Análise Estratégica AI</h2>
              </div>

              {isAnalyzing ? (
                <div className="space-y-4 py-8">
                  <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded-full w-5/6 animate-pulse"></div>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed font-medium text-slate-200">
                    {aiAnalysis}
                  </div>
                </div>
              )}

              <div className="pt-6 flex gap-4">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-full hover:bg-slate-100 transition-all">
                  Gerar Relatório PDF <ChevronRight size={14} />
                </button>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/20 text-white px-4 py-2 rounded-full hover:bg-white/10 transition-all">
                  Compartilhar Equipe
                </button>
              </div>
            </div>
          </div>

          {/* Category Performance Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Crescimento por Categoria</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Últimos 30 dias de tração</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">
                  <TrendingUp size={12} /> Alta
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold">
                  <TrendingDown size={12} /> Baixa
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_GROWTH_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 12, fontWeight: 'bold'}}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="growth" radius={[0, 8, 8, 0]} barSize={32}>
                    {MOCK_GROWTH_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.growth > 0 ? '#10b981' : '#f43f5e'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Colors & Alerts */}
        <div className="lg:col-span-4 space-y-8">
          {/* Trending Colors */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <Layers className="text-slate-900" size={20} />
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Paleta da Estação</h3>
            </div>

            <div className="space-y-4">
              {TRENDING_COLORS.map(color => (
                <div key={color.name} className="group p-4 rounded-2xl border border-slate-50 hover:border-slate-200 transition-all flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl shadow-inner shrink-0 border border-slate-100" 
                    style={{ backgroundColor: color.hex }} 
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-black text-slate-800 truncate">{color.name}</p>
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${color.sentiment.includes('Alerta') ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {color.sentiment}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">
                      {color.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
              Ver Paleta Completa
            </button>
          </div>

          {/* Risk Alerts */}
          <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={20} />
              <h3 className="font-black uppercase tracking-widest text-xs">Alertas de Risco</h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1.5 bg-rose-500 rounded-full shrink-0" />
                <div>
                  <p className="text-xs font-black text-rose-900 uppercase tracking-tighter mb-1">Tecidos Sintéticos</p>
                  <p className="text-[10px] text-rose-600 font-medium leading-relaxed">
                    Queda de 30% no interesse por poliamida básica. Sustentabilidade agora é fator decisivo de compra.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1.5 bg-rose-500 rounded-full shrink-0" />
                <div>
                  <p className="text-xs font-black text-rose-900 uppercase tracking-tighter mb-1">Logomania</p>
                  <p className="text-[10px] text-rose-600 font-medium leading-relaxed">
                    Movimento em direção a logos ocultos. Evite peças com branding excessivamente visível.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-4 bg-white/60 rounded-2xl flex items-center gap-3">
                <Info size={16} className="text-rose-400" />
                <p className="text-[9px] text-rose-800 font-bold uppercase tracking-tight">
                  Sugestão: Redirecione orçamento para Linho e Fibras Naturais.
                </p>
              </div>
            </div>
          </div>
          
          {/* Ad Insight Mock */}
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl space-y-4">
            <h4 className="font-black text-sm">Pronto para Investir?</h4>
            <p className="text-xs text-white/80 leading-relaxed">
              Baseado nestas tendências, criamos 3 campanhas de alta performance para o seu Instagram Ads.
            </p>
            <button className="w-full py-3 bg-white text-emerald-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
              Ver Campanhas Recomendadas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;