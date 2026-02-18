
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Camera,
  Monitor,
  Zap,
  Play,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Check,
  Instagram
} from 'lucide-react';
import { AppRoute } from '../../types';
import { useAuth } from '../../context/AuthContext';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    credits: 150,
    description: 'Ideal para marcas iniciando sua jornada digital.',
    features: ['150 Créditos Mensais', 'Geração de Texto', 'Imagens de Estúdio', 'Suporte Básico'],
    highlight: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 129,
    credits: 500,
    description: 'Para marcas que precisam de volume e consistência.',
    features: ['500 Créditos Mensais', 'Tudo do Starter', 'Provador Virtual', 'Avatar da Marca', 'Vídeos Curtos (2/mês)'],
    highlight: true,
    tag: 'MAIS ESCOLHIDO'
  },
  {
    id: 'business',
    name: 'Business',
    price: 299,
    credits: 1500,
    description: 'Potência máxima para operações de escala.',
    features: ['1500 Créditos Mensais', 'Tudo do Pro', '10 Vídeos/mês', 'Prioridade na Fila', 'API Access'],
    highlight: false
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob Consulta',
    credits: 'Personalizado',
    description: 'Plano Personalizado para alto volume.',
    features: ['Créditos sob Demanda', 'Desconto por Volume', 'Prioridade Total', 'Suporte Dedicado', 'Integrações Custom'],
    highlight: false,
    customAction: true
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      title: 'Estúdio de Imagem 8K',
      desc: 'Sessões de fotos editoriais em segundos. Escolha cenários globais e biotipos reais.',
      icon: Camera,
      tag: 'CRIATIVIDADE'
    },
    {
      title: 'Provador Virtual Pro',
      desc: 'Fidelidade têxtil absoluta. Permita que seus clientes provem looks em modelos reais.',
      icon: Monitor,
      tag: 'CONVERSÃO'
    },
    {
      title: 'Vídeo Studio AI',
      desc: 'Transforme fotos estáticas em Reels cinematográficos com movimento orgânico.',
      icon: Play,
      tag: 'ENGAJAMENTO'
    },
    {
      title: 'Marketing Estratégico',
      desc: 'Legendas e roteiros otimizados para o tom de voz da sua marca e SEO.',
      icon: Zap,
      tag: 'ESCALA'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-['Inter'] selection:bg-[#E11D48] selection:text-white overflow-x-hidden text-black">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 md:px-16 flex items-center justify-between bg-white/80 backdrop-blur-2xl border-b border-slate-50 transition-all duration-500">
        <div className="flex items-center gap-3 group cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shrink-0">
            <span className="text-white font-black text-lg tracking-tighter">P</span>
          </div>
          {/* Nome completo visível em todas as telas */}
          <span className="font-black text-xl tracking-tighter uppercase">Provadoria<span className="text-[#E11D48]">.</span></span>
        </div>

        <div className="hidden lg:flex items-center gap-12">
          <button onClick={() => scrollToSection('features')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-black transition-all hover:translate-y-[-1px]">Recursos</button>
          <button onClick={() => scrollToSection('pricing')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-black transition-all hover:translate-y-[-1px]">Preços</button>
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-black transition-all hover:translate-y-[-1px]">Empresa</button>
        </div>

        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {user ? (
            <button
              onClick={() => navigate(AppRoute.DASHBOARD)}
              className="px-5 md:px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2 group"
            >
              <span className="hidden md:inline">Painel de Controle</span>
              <span className="md:hidden">Painel</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate(AppRoute.LOGIN)}
                className="text-[10px] font-black uppercase tracking-widest text-black hover:opacity-60 transition-all px-4 py-2 bg-slate-100 rounded-full md:bg-transparent md:p-0"
              >
                Entrar
              </button>
              {/* Botão de cadastro visível apenas em telas médias e maiores */}
              <button
                onClick={() => navigate(AppRoute.REGISTER)}
                className="hidden md:block px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all active:scale-95 shadow-xl whitespace-nowrap"
              >
                Criar Minha Marca
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 md:pt-64 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full mb-12 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-1.5 h-1.5 bg-[#E11D48] rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Inteligência Visual para o Varejo B2B</span>
          </div>

          <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase mb-14 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Moda além do <br /> <span className="text-transparent" style={{ WebkitTextStroke: '2px #000' }}>Tangível.</span>
          </h1>

          <p className="max-w-2xl text-slate-400 text-lg md:text-2xl font-medium italic leading-relaxed mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            A plataforma definitiva de IA para lojistas. Gere ensaios fotográficos de luxo e provadores virtuais em segundos, reduzindo custos em até 90%.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <button
              onClick={() => navigate(user ? AppRoute.DASHBOARD : AppRoute.REGISTER)}
              className="px-16 py-7 bg-black text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex items-center gap-4 active:scale-95 justify-center"
            >
              {user ? 'Acessar Meu Painel' : 'Começar Produção'} <ArrowRight size={20} />
            </button>
            <button className="px-16 py-7 bg-white border border-slate-200 text-black rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
              Agendar Demo
            </button>
          </div>
        </div>
      </section>

      {/* Product Bento Grid */}
      <section id="features" className="py-40 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-slate-100 pb-12">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none italic">
                O Futuro <br /><span className="text-slate-300">Integrado.</span>
              </h2>
              <p className="text-slate-400 font-medium text-lg max-w-md">Tudo o que sua marca precisa para dominar o digital, em um único ecossistema inteligente.</p>
            </div>
            <div className="flex items-center gap-12">
              <div className="text-center">
                <p className="text-4xl font-black tracking-tighter">8K</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Resolução Máxima</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black tracking-tighter">99%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Fidelidade Têxtil</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-12 bg-white border border-slate-100 rounded-[3rem] hover:border-black transition-all duration-700 hover:shadow-2xl flex flex-col justify-between min-h-[420px]">
                <div className="space-y-8">
                  <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center group-hover:bg-[#E11D48] transition-colors duration-500 shadow-xl">
                    <f.icon size={26} />
                  </div>
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-[#E11D48] uppercase tracking-[0.4em]">{f.tag}</span>
                    <h3 className="text-3xl font-black text-black tracking-tight leading-none uppercase">{f.title}</h3>
                  </div>
                </div>
                <p className="text-slate-400 text-base font-medium leading-relaxed italic mt-10">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Impact Showcase */}
      <section className="bg-black py-40 px-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <Sparkles size={500} />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-16">
            <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85]">
              Realismo <br /> <span className="text-[#E11D48] italic">Matemático.</span>
            </h2>
            <div className="space-y-10">
              <div className="flex gap-8 items-start">
                <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center shrink-0 text-[#E11D48] font-black text-sm">01</div>
                <p className="text-white/60 font-medium text-xl leading-relaxed">Nossa IA proprietária preserva a trama exata do seu tecido, garantindo que o cliente veja exatamente o que irá receber.</p>
              </div>
              <div className="flex gap-8 items-start">
                <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center shrink-0 text-[#E11D48] font-black text-sm">02</div>
                <p className="text-white/60 font-medium text-xl leading-relaxed">Acabe com a logística complexa de sessões de fotos. Tenha um ensaio em Paris sem sair do seu escritório.</p>
              </div>
            </div>
            <button onClick={() => navigate(user ? AppRoute.DASHBOARD : AppRoute.REGISTER)} className="px-14 py-6 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#E11D48] hover:text-white transition-all shadow-2xl active:scale-95">
              Experimentar Agora
            </button>
          </div>

          <div className="relative group">
            <div className="aspect-[4/5] bg-zinc-900 rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_0_120px_rgba(225,29,72,0.15)] transition-all group-hover:scale-[1.02] duration-1000">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000"
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
                alt="AI Fashion Editorial"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="p-6 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 animate-in zoom-in-95">
                  <div className="flex items-center gap-4 mb-6">
                    <Loader2 className="animate-spin text-[#E11D48]" size={24} />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">Rendering Texture DNA...</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-64 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E11D48] w-3/4 animate-pulse" />
                    </div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Fidelidade Têxtil Ativa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Numbers */}
      <section className="py-32 px-6 border-b border-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-16">
          {[
            { val: '+250', label: 'Marcas Ativas' },
            { val: '1M+', label: 'Fotos Geradas' },
            { val: '-85%', label: 'Custo de Produção' },
            { val: '3.4x', label: 'Conversão Média' }
          ].map((s, i) => (
            <div key={i} className="text-center space-y-3">
              <p className="text-5xl md:text-6xl font-black tracking-tighter">{s.val}</p>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-40 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Planos Flexíveis
            </h2>
            <p className="text-slate-400 font-medium text-lg italic">
              Comece pequeno e escale conforme sua marca cresce. Sem contratos de fidelidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-[2.5rem] p-8 md:p-10 flex flex-col h-full transition-all duration-300 ${plan.highlight
                  ? 'border-2 border-black shadow-2xl scale-105 z-10'
                  : 'border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E11D48] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                    <Sparkles size={12} /> {plan.tag}
                  </div>
                )}

                <div className="mb-8 space-y-3">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-black text-slate-900 tracking-tighter ${typeof plan.price === 'string' ? 'text-3xl' : 'text-5xl'}`}>
                      {typeof plan.price === 'number' ? `R$ ${plan.price}` : plan.price}
                    </span>
                    {typeof plan.price === 'number' && <span className="text-slate-400 font-bold">/mês</span>}
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed min-h-[48px] pt-2">{plan.description}</p>
                </div>

                <div className="flex-1 space-y-5 mb-10">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if ((plan as any).customAction) {
                      window.open('mailto:enterprise@provadoria.ai', '_blank');
                    } else {
                      navigate(`/signup?plan=${(plan as any).id}`);
                    }
                  }}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${plan.highlight
                    ? 'bg-[#E11D48] text-white hover:bg-rose-700 hover:shadow-rose-200'
                    : 'bg-black text-white hover:bg-slate-800'
                    }`}
                >
                  {(plan as any).customAction ? 'Falar com Vendas' : 'Criar Conta'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credits Explanation Section */}
      <section className="py-32 px-6 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none text-slate-900">
              O que você faz com <br /><span className="text-[#E11D48]">Seus Créditos.</span>
            </h2>
            <p className="text-slate-400 font-medium text-lg italic">
              Entenda o custo-benefício. Você tem total liberdade para distribuir sua cota mensal entre as ferramentas.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Imagem */}
            <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-black group-hover:text-[#E11D48]">
                <Camera size={36} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Estúdio de Imagem</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">Crie editoriais de moda em 8K com modelos e cenários IA ilimitados.</p>
              </div>
              <div className="mt-auto pt-8 border-t border-slate-200 w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Custo por Geração</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-[#E11D48] transition-colors">5 <span className="text-base font-bold text-slate-400">créditos</span></p>
              </div>
            </div>

            {/* Card 2: Provador */}
            <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative z-10">
              <div className="absolute -top-6 bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Alta Demanda</div>
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-black group-hover:text-[#E11D48]">
                <Monitor size={36} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Provador Virtual</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">Aplique suas peças em fotos de clientes reais com fidelidade têxtil.</p>
              </div>
              <div className="mt-auto pt-8 border-t border-slate-200 w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Custo por Geração</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-[#E11D48] transition-colors">8 <span className="text-base font-bold text-slate-400">créditos</span></p>
              </div>
            </div>

            {/* Card 3: Vídeo */}
            <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-black group-hover:text-[#E11D48]">
                <Play size={36} className="ml-1" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Estúdio de Vídeo</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">Transforme fotos estáticas em vídeos cinematográficos para Reels.</p>
              </div>
              <div className="mt-auto pt-8 border-t border-slate-200 w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Custo por Geração</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-[#E11D48] transition-colors">40 <span className="text-base font-bold text-slate-400">créditos</span></p>
              </div>
            </div>
          </div>

          {/* Example Banner */}
          <div className="bg-black rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
              <Zap size={300} />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="space-y-6 text-center lg:text-left max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                  <Sparkles size={14} className="text-[#E11D48]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Simulação Real</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
                  Com o Plano Starter <br /> <span className="text-[#E11D48]">(150 Créditos)</span>
                </h3>
                <p className="text-white/60 font-medium text-base md:text-lg leading-relaxed">
                  Exemplo de produção mensal possível com o plano de entrada:
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="flex-1 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <p className="text-5xl font-black text-white tracking-tighter">30</p>
                  <p className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.2em] mt-2">Fotos de Estúdio</p>
                </div>
                <div className="flex items-center justify-center text-white/20 font-black text-xs uppercase tracking-widest py-4 sm:py-0">OU</div>
                <div className="flex-1 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <p className="text-5xl font-black text-white tracking-tighter">18</p>
                  <p className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.2em] mt-2">Provadores Virtuais</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Conversion Section */}
      <section className="py-48 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85]">
            Sua vitrine, <br /><span className="text-[#E11D48] italic">Infinita.</span>
          </h2>
          <p className="text-slate-400 text-xl md:text-2xl font-medium italic max-w-xl mx-auto leading-relaxed">
            Elimine as barreiras entre a sua coleção e a venda. Junte-se à nova era da moda digital.
          </p>
          <div className="flex flex-col items-center gap-8">
            <button onClick={() => navigate(user ? AppRoute.DASHBOARD : AppRoute.REGISTER)} className="px-20 py-8 bg-black text-white rounded-full font-black text-lg uppercase tracking-[0.2em] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:bg-slate-800 transition-all flex items-center gap-4 group active:scale-95">
              {user ? 'Acessar Meu Ecossistema' : 'Criar Minha Marca'} <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 size={16} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Créditos de teste gratuitos inclusos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="py-24 px-6 border-t border-slate-50 bg-slate-50/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">P</span>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">Provadoria.</span>
          </div>

          <div className="flex flex-wrap justify-center gap-12">
            <button
              onClick={() => navigate(AppRoute.TERMS)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
            >
              Termos
            </button>
            <button
              onClick={() => navigate(AppRoute.PRIVACY)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
            >
              Privacidade
            </button>
            <button
              onClick={() => window.open('https://instagram.com/provadoria', '_blank')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
            >
              <Instagram size={14} /> Instagram
            </button>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">© 2026 Provadoria.</p>
            <p className="text-[8px] font-bold text-slate-200 uppercase tracking-widest mt-1">Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
