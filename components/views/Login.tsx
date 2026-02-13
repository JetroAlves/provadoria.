
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppRoute } from '../../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(AppRoute.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar. Verifique seus dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-['Inter'] selection:bg-black selection:text-white">
      {/* Visual Side (Left) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-slate-900 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200" 
          alt="Fashion Editorial" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="relative z-10 p-16 lg:p-24 flex flex-col h-full">
          {/* Logo transformado em Botão de Voltar para Home */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group w-fit transition-transform active:scale-95"
            title="Voltar para a Página Inicial"
          >
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl transition-all group-hover:shadow-white/20 group-hover:rotate-3">
                <span className="text-black font-black text-2xl tracking-tighter">P</span>
             </div>
             <span className="text-white text-2xl font-black tracking-tight uppercase group-hover:text-[#E11D48] transition-colors">Provadoria AI</span>
          </button>

          <div className="mt-auto space-y-8">
            <h2 className="text-6xl lg:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase">
              A Inteligência <br /> da nova moda.
            </h2>
            <p className="text-white/60 text-xl max-w-lg font-medium italic leading-relaxed">
              "Sua vitrine inteligente, seu provador virtual, seu marketing automatizado. Tudo em uma única plataforma."
            </p>
          </div>
        </div>
      </div>

      {/* Login Form Side (Right) */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 bg-white">
        <div className="max-w-md w-full mx-auto space-y-12">
          
          <div className="space-y-3">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">Bem-vindo.</h3>
            <p className="text-slate-400 font-medium italic">Acesse seu dashboard de lojista.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Email Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">E-mail Corporativo</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={22} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-300"
                    placeholder="exemplo@sualoja.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sua Senha</label>
                  <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors">Esqueceu a senha?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={22} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-16 pr-16 py-6 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-2">
                <AlertCircle className="text-rose-500 shrink-0" size={24} />
                <p className="text-xs font-bold text-rose-800 uppercase tracking-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 bg-black text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 active:scale-[0.98] group"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Sparkles className="group-hover:rotate-12 transition-transform" size={20} />
              )}
              {isSubmitting ? 'Autenticando...' : 'Entrar na plataforma'}
            </button>
          </form>

          <div className="pt-8 text-center space-y-6">
            <p className="text-[11px] font-medium text-slate-400">
              Ainda não tem uma conta? {' '}
              <Link to={AppRoute.REGISTER} className="text-black font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                Criar minha marca
              </Link>
            </p>
          </div>

          <div className="pt-12 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
             <span>© 2025 Provadoria Fashion AI B2B.</span>
             <div className="flex gap-4">
                <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacidade</span>
                <span className="hover:text-slate-900 cursor-pointer transition-colors">Termos</span>
                <span className="hover:text-slate-900 cursor-pointer transition-colors">Ajuda</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;