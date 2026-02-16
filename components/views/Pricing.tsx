
import React from 'react';
import { Check, Sparkles, Zap, Crown, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useSettings } from '../../context/SettingsContext';

// Fallback local plans em caso de erro no fetch
const DEFAULT_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    credits: 150,
    description: 'Para marcas iniciantes explorando o poder da IA.',
    features: [
      '150 Créditos Mensais',
      'Geração de Texto (Marketing)',
      'Geração de Imagens (Estúdio)',
      'Acesso à Galeria Básica',
      'Suporte via Email'
    ],
    highlight: false,
    tag: '',
    cta: 'Começar Agora'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 129,
    credits: 500,
    description: 'O favorito de marcas em crescimento e estilistas.',
    features: [
      '500 Créditos Mensais',
      'Tudo do plano Starter',
      'Criação de Avatar da Marca',
      'Provador Virtual (Try-On)',
      'Até 2 Vídeos Cinemáticos/mês',
      'Qualidade 8K Habilitada'
    ],
    highlight: true,
    tag: 'MAIS POPULAR',
    cta: 'Assinar Pro'
  },
  {
    id: 'business',
    name: 'Business',
    price: 299,
    credits: 1500,
    description: 'Potência máxima para operações de alto volume.',
    features: [
      '1500 Créditos Mensais',
      'Tudo do plano Pro',
      'Até 10 Vídeos Cinemáticos/mês',
      'Fila de Processamento Prioritária',
      'Gerente de Conta Dedicado',
      'API Access (Beta)'
    ],
    highlight: false,
    tag: '',
    cta: 'Começar Agora'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob Consulta',
    credits: 'Personalizado',
    description: 'Plano Personalizado para alto volume.',
    features: [
      'Créditos sob Demanda',
      'Desconto por Volume',
      'Prioridade Total',
      'Suporte Dedicado',
      'Integrações Custom'
    ],
    highlight: false,
    tag: '',
    cta: 'Falar com Vendas'
  }
];

const CREDIT_COSTS = [
  { action: 'Texto / Legenda', cost: '1 crédito' },
  { action: 'Imagem Estúdio', cost: '5 créditos' },
  { action: 'Provador Virtual', cost: '8 créditos' },
  { action: 'Avatar Personalizado', cost: '10 créditos' },
  { action: 'Vídeo (Reels)', cost: '40 créditos' },
];

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [plans, setPlans] = React.useState<any[]>(DEFAULT_PLANS);
  const [currentPlanId, setCurrentPlanId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPlansAndSub = async () => {
      try {
        // 1. Buscar planos reais
        const { data: plansData } = await supabase
          .from('plans')
          .select('*')
          .order('monthly_price');

        if (plansData && plansData.length > 0) {
          const mappedPlans = plansData.map(p => ({
            id: p.id,
            name: p.name,
            price: p.monthly_price,
            credits: p.monthly_credits,
            description: p.description,
            features: p.features || [],
            highlight: p.id === 'pro',
            tag: p.id === 'pro' ? 'MAIS POPULAR' : '',
            cta: p.id === 'enterprise' ? 'Falar com Vendas' : 'Começar Agora'
          }));

          // Se o Enterprise não estiver no banco, adicionar o default
          if (!mappedPlans.find(p => p.id === 'enterprise')) {
            mappedPlans.push(DEFAULT_PLANS.find(p => p.id === 'enterprise')!);
          }

          setPlans(mappedPlans);
        }

        // 2. Buscar plano atual do usuário
        if (user) {
          const { data: sub } = await supabase
            .from('user_subscriptions')
            .select('plan_id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

          if (sub) {
            setCurrentPlanId(sub.plan_id);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados de cobrança:", err);
      }
    };

    fetchPlansAndSub();
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    if (!user) return;

    setLoadingPlan(planId);
    setError(null);

    try {
      // Obter sessão atual para o token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }

      // Redirecionar para o Stripe
      window.location.href = data.checkoutUrl;

    } catch (err: any) {
      console.error('Erro na assinatura:', err);
      setError(err.message || 'Erro ao processar assinatura. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 max-w-2xl mx-auto">
          <Info className="text-rose-500 shrink-0" size={18} />
          <p className="text-xs font-bold text-rose-800 uppercase tracking-tight">{error}</p>
        </div>
      )}

      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Escolha sua Evolução</h2>
        <p className="text-slate-500 text-lg font-medium">Desbloqueie o potencial criativo da sua marca com planos flexíveis baseados em uso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-[2.5rem] p-8 flex flex-col h-full transition-all duration-300 ${plan.highlight
                ? 'border-2 border-black shadow-2xl scale-105 z-10'
                : 'border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
                }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E11D48] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <Sparkles size={12} /> {plan.tag}
                </div>
              )}

              <div className="mb-6 space-y-2">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">
                    {typeof plan.price === 'number' ? `R$ ${plan.price}` : plan.price}
                  </span>
                  {typeof plan.price === 'number' && <span className="text-slate-400 font-bold">/mês</span>}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed min-h-[40px]">{plan.description}</p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Check size={10} strokeWidth={4} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={isCurrent || isLoading}
                onClick={() => (plan.id === 'enterprise' || plan.cta === 'Falar com Vendas') ? window.open('https://wa.me/5511995579930', '_blank') : handleSubscribe(plan.id)}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isCurrent
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  : plan.highlight
                    ? 'bg-[#E11D48] text-white hover:bg-rose-700 hover:shadow-rose-200'
                    : 'bg-black text-white hover:bg-slate-800'
                  }`}
              >
                {isLoading && <Loader2 className="animate-spin" size={16} />}
                {isCurrent ? 'Seu Plano Atual' : (isLoading ? 'Processando...' : plan.cta)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Tabela de Consumo de Créditos */}
      <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 mt-12">
        <div className="flex items-center gap-3 mb-6">
          <Info size={20} className="text-slate-400" />
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Entenda o Consumo de Créditos</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {CREDIT_COSTS.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{item.action}</p>
              <p className="text-sm font-black text-slate-900">{item.cost}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-6 font-medium italic">
          Os créditos são renovados mensalmente e não são cumulativos. Vídeos consomem mais créditos devido ao alto processamento computacional.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
