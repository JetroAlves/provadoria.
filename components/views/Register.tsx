
import React, { useState, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Store,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { AppRoute } from '../../types';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'free';

  // Form State
  const [formData, setFormData] = useState({
    brandName: '',
    fullName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pass = formData.password;
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passwordStrength < 50) {
      setError('Por favor, crie uma senha mais forte para proteger sua marca.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData.email, formData.password, formData.brandName, formData.fullName);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não foi possível iniciar sessão após o cadastro.");

      // Se o plano NÃO for free, tenta iniciar checkout
      if (planId !== 'free') {
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ planId })
          });

          const data = await response.json();
          if (data.success && data.checkoutUrl) {
            // REDIRECIONAR E ENCERRAR
            window.location.href = data.checkoutUrl;
            return;
          }
          console.warn("Falha ao criar sessão de checkout, caindo para plano free:", data.error);
        } catch (checkoutErr) {
          console.error("Erro na comunicação com a API de checkout:", checkoutErr);
        }
      }

      // Se for plano free OU se a criação da sessão de checkout falhou
      // Cria a assinatura 'free' como fallback garantido
      await supabase.from('user_subscriptions').upsert({
        user_id: session.user.id,
        plan_id: 'free',
        status: 'active',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      setSuccess(true);
      setTimeout(() => navigate(AppRoute.DASHBOARD), 1500);
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(err.message || 'Houve um erro no cadastro. Tente outro e-mail.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-['Inter'] selection:bg-black selection:text-white overflow-x-hidden">
      {/* Visual Side (Fashion & Brand) */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-slate-900 relative">
        <img
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200"
          alt="Modern Fashion"
          className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black/80" />

        <div className="relative z-10 p-16 lg:p-24 flex flex-col h-full">
          {/* Logo transformado em Botão de Voltar para Home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group w-fit transition-transform active:scale-95"
            title="Voltar para a Página Inicial"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transition-all group-hover:rotate-6 shadow-xl">
              <span className="text-black font-black text-xl tracking-tighter">P</span>
            </div>
            <h1 className="text-white text-xl font-black tracking-tight uppercase group-hover:text-[#E11D48] transition-colors">Provadoria AI</h1>
          </button>

          <div className="mt-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
                Sua marca <br /> sem limites.
              </h2>
              <p className="text-white/60 text-lg max-w-sm font-medium">
                Dê o próximo passo na evolução do seu e-commerce com fotografia editorial e provador virtual via IA.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-white font-black text-2xl tracking-tight">8K</p>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Resolução IA</p>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-white font-black text-2xl tracking-tight">24/7</p>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Provador Ativo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Register Form Side */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 bg-white overflow-y-auto scrollbar-hide">
        <div className="max-w-md w-full mx-auto space-y-10">

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Inicie seu teste grátis</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none uppercase">Criar sua Conta.</h3>
            <p className="text-slate-500 font-medium">Junte-se a centenas de marcas que usam IA.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nome da Marca</label>
                <div className="relative">
                  <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    name="brandName"
                    required
                    value={formData.brandName}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Ex: Provadoria Boutique"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Seu Nome</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Ex: Maria Silva"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">E-mail corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={20} />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-300"
                  placeholder="parceria@marca.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Crie sua senha</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={20} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-300"
                  placeholder="Min. 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Strength Meter */}
              {formData.password && (
                <div className="space-y-2 px-2 pt-1 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Segurança da Senha</span>
                    <span className={passwordStrength < 50 ? 'text-rose-500' : passwordStrength < 100 ? 'text-amber-500' : 'text-emerald-500'}>
                      {passwordStrength < 50 ? 'Fraca' : passwordStrength < 100 ? 'Média' : 'Forte'}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${passwordStrength < 50 ? 'bg-rose-500' : passwordStrength < 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                <AlertCircle className="text-rose-500 shrink-0" size={18} />
                <p className="text-xs font-bold text-rose-800 uppercase tracking-tight leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || success}
              className={`w-full py-5 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] group ${success ? 'bg-emerald-500' : 'bg-black hover:bg-slate-800 disabled:opacity-50'
                }`}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : success ? (
                <Check size={20} />
              ) : (
                <CheckCircle2 className="group-hover:scale-110 transition-transform" size={18} />
              )}
              {isSubmitting ? 'Gerando Credenciais...' : success ? 'Bem-vindo ao Futuro!' : 'Criar Minha Marca IA'}
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              <span className="bg-white px-4">Já possui cadastro?</span>
            </div>
          </div>

          <Link
            to={AppRoute.LOGIN}
            className="w-full py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
          >
            Fazer Login na Plataforma
          </Link>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Ao se cadastrar, você concorda com nossos <br />
            <Link to="#" className="text-black hover:underline">Termos de Uso</Link> e <Link to="#" className="text-black hover:underline">Política de Privacidade</Link>.
          </p>
        </div>

        {/* Support Section */}
        <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
          <span>Provadoria Fashion AI - Onboarding de Parceiros.</span>
          <div className="flex gap-6">
            <span>Dúvidas? Fale conosco</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;