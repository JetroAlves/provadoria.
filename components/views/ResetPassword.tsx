import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Lock,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppRoute } from '../../types';
import { supabase } from '../../lib/supabase';

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const { updateUserPassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Verificar se temos uma sessão ativa antes de tentar atualizar
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                throw new Error('Sessão de recuperação não encontrada ou expirada. Por favor, solicite um novo link.');
            }

            await updateUserPassword(password);
            setSuccess(true);
            setTimeout(() => navigate(AppRoute.LOGIN), 3000);
        } catch (err: any) {
            console.error('Update password error:', err);
            setError(err.message || 'Falha ao atualizar senha. O link pode ter expirado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 font-['Inter']">
            <div className="max-w-md w-full space-y-12">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-xl hover:rotate-3 transition-transform">
                        <span className="text-white font-black text-2xl tracking-tighter">P</span>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Nova Senha.</h3>
                        <p className="text-slate-400 font-medium italic">Defina sua nova senha de acesso.</p>
                    </div>
                </div>

                {success ? (
                    <div className="p-8 bg-black text-white rounded-[2.5rem] space-y-6 text-center animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-[#E11D48] rounded-3xl flex items-center justify-center mx-auto text-white">
                            <CheckCircle2 size={32} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-black uppercase tracking-tight">Senha Atualizada!</h4>
                            <p className="text-white/60 text-sm font-medium">Sua senha foi alterada com sucesso. Redirecionando para o login...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            {/* Password Input */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nova Senha</label>
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

                            {/* Confirm Password Input */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Confirmar Nova Senha</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={22} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="••••••••"
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
                            className="w-full py-6 bg-black text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 active:scale-[0.98] group"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <Sparkles size={20} />
                            )}
                            {isSubmitting ? 'Atualizando...' : 'Redefinir Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
