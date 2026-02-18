import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail,
    Loader2,
    AlertCircle,
    ArrowLeft,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppRoute } from '../../types';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const { resetPasswordForEmail } = useAuth();

    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await resetPasswordForEmail(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Falha ao solicitar recuperação. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 font-['Inter']">
            <div className="max-w-md w-full space-y-12">
                <div className="flex flex-col items-center text-center space-y-6">
                    <button
                        onClick={() => navigate(AppRoute.LOGIN)}
                        className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-xl hover:rotate-3 transition-transform"
                    >
                        <span className="text-white font-black text-2xl tracking-tighter">P</span>
                    </button>
                    <div className="space-y-3">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Recuperar Senha.</h3>
                        <p className="text-slate-400 font-medium italic">Enviaremos um link de acesso para seu e-mail.</p>
                    </div>
                </div>

                {success ? (
                    <div className="p-8 bg-black text-white rounded-[2.5rem] space-y-6 text-center animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-[#E11D48]">
                            <CheckCircle2 size={32} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-black uppercase tracking-tight">E-mail enviado!</h4>
                            <p className="text-white/60 text-sm font-medium">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
                        </div>
                        <button
                            onClick={() => navigate(AppRoute.LOGIN)}
                            className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                        >
                            Voltar para Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
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
                            className="w-full py-6 bg-black text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                'Enviar Link de Recuperação'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(AppRoute.LOGIN)}
                            className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={14} /> Voltar para Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
