
import React from 'react';
import { TrendingUp, Users, ShoppingBag, ArrowUpRight, ArrowDownRight, Sparkles, Plus, CheckCircle2, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../../types';

// O gráfico agora simula dados baseados no volume atual de produtos
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { products, settings, savedLooks, aiDrafts } = useSettings();
  const navigate = useNavigate();
  const [subscription, setSubscription] = React.useState<any>(null);
  const [credits, setCredits] = React.useState<number>(0);
  const [isLoadingBilling, setIsLoadingBilling] = React.useState(true);

  React.useEffect(() => {
    const fetchBilling = async () => {
      if (!user) return;
      setIsLoadingBilling(true);
      try {
        const [subRes, credRes] = await Promise.all([
          supabase.from('user_subscriptions')
            .select('*, plans(name)')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle(),
          supabase.from('user_credits')
            .select('balance')
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        if (subRes.data) setSubscription(subRes.data);
        if (credRes.data) setCredits(credRes.data.balance);
      } catch (err) {
        console.error("Erro ao carregar créditos no dashboard:", err);
      } finally {
        setIsLoadingBilling(false);
      }
    };

    fetchBilling();
  }, [user]);

  const CreditsSummary = () => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-xl transition-all mb-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-black"><Sparkles size={120} /></div>
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white shadow-2xl">
          <Layers size={32} />
        </div>
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Status da Assinatura</h2>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{subscription?.plans?.name || 'Carregando...'}</p>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full">Ativa</span>
          </div>
        </div>
      </div>

      <div className="h-px w-full md:h-12 md:w-px bg-slate-100" />

      <div className="text-center md:text-left">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Saldo de Créditos</h2>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{credits} <span className="text-sm font-bold text-slate-300">disponíveis</span></p>
      </div>

      <button
        onClick={() => navigate(AppRoute.SETTINGS)}
        className="px-8 py-4 bg-slate-50 text-black hover:bg-black hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/btn"
      >
        Gerenciar Plano <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );

  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const activeProducts = products.filter(p => p.status === 'active').length;

  // Mock de gráfico proporcional ao crescimento real do catálogo
  const chartData = [
    { name: 'Seg', sales: 1200 + products.length * 10, reach: 2400 },
    { name: 'Ter', sales: 1500 + products.length * 15, reach: 1398 },
    { name: 'Qua', sales: 1800 + products.length * 20, reach: 9800 },
    { name: 'Qui', sales: 2200 + products.length * 12, reach: 3908 },
    { name: 'Sex', sales: 1900 + products.length * 18, reach: 4800 },
    { name: 'Sáb', sales: 2400 + products.length * 25, reach: 3800 },
    { name: 'Dom', sales: 3100 + products.length * 30, reach: 4300 },
  ];

  const StatCard = ({ title, value, change, trend, icon: Icon }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-colors">
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-black ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {change}%
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        </div>
      </div>
      <div>
        <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
        <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <CreditsSummary />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel de Controle</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Seu ecossistema de moda operando na <span className="text-black font-bold">{settings.storeName}</span>.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(AppRoute.CATALOG_NEW)}
            className="px-6 py-4 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> Novo Produto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Produtos no Catálogo" value={products.length} change="4.2" trend="up" icon={ShoppingBag} />
        <StatCard title="Itens Ativos" value={activeProducts} change="1.5" trend="up" icon={CheckCircle2} />
        <StatCard title="Total em Estoque" value={totalStock} change="2.1" trend="down" icon={Layers} />
        <StatCard title="Produções IA" value={savedLooks.length + aiDrafts.length} change="12.7" trend="up" icon={Sparkles} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-black text-2xl text-slate-900 tracking-tight">Performance Visual</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Engajamento de Conteúdo Gerado</p>
            </div>
          </div>
          <div className="h-[350px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#000" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="reach" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Sparkles size={160} /></div>
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl"><TrendingUp className="text-amber-400" size={24} /></div>
            <div>
              <h2 className="font-black text-xl tracking-tight">IA Insights</h2>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Recomendado Hoje</p>
            </div>
          </div>

          <div className="space-y-6 flex-1 relative z-10">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
              <p className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">🚀 Oportunidade: Catálogo</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Seu estoque está com {products.length} itens. Adicione mais {Math.max(0, 10 - products.length)} para melhorar o SEO da vitrine.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
              <p className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">📸 Produção Visual</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Você já salvou {savedLooks.length} looks. Gere novos roteiros no Marketing IA para viralizar.</p>
            </div>
          </div>

          <button onClick={() => navigate(AppRoute.TRENDS)} className="mt-10 w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl active:scale-95">
            Ver Tendências
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
