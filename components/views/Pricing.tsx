
import React from 'react';
import { Check, Sparkles, Zap, Crown, Info } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const PLANS = [
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
  // Simulação do plano atual (no futuro virá do contexto/backend)
  const currentPlanId = 'starter'; 

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Escolha sua Evolução</h2>
        <p className="text-slate-500 text-lg font-medium">Desbloqueie o potencial criativo da sua marca com planos flexíveis baseados em uso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          
          return (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-[2.5rem] p-8 flex flex-col h-full transition-all duration-300 ${
                plan.highlight 
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
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ {plan.price}</span>
                  <span className="text-slate-400 font-bold">/mês</span>
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
                disabled={isCurrent}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                  isCurrent 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                    : plan.highlight 
                      ? 'bg-[#E11D48] text-white hover:bg-rose-700 hover:shadow-rose-200' 
                      : 'bg-black text-white hover:bg-slate-800'
                }`}
              >
                {isCurrent ? 'Seu Plano Atual' : plan.cta}
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
