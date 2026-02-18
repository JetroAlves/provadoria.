import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-['Inter'] text-black">
            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 md:px-16 flex items-center justify-between bg-white/80 backdrop-blur-2xl border-b border-slate-50">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
                        <span className="text-white font-black text-lg tracking-tighter">P</span>
                    </div>
                    <span className="font-black text-xl tracking-tighter uppercase">Provadoria<span className="text-[#E11D48]">.</span></span>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                >
                    <ArrowLeft size={14} /> Voltar para Home
                </button>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-12">
                        Política de <span className="text-[#E11D48] italic">Privacidade.</span>
                    </h1>

                    <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed">
                        <section>
                            <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">1. Coleta de Informações</h2>
                            <p>Coletamos informações que você nos fornece diretamente ao criar uma conta, como nome, e-mail e informações da sua marca. Também coletamos os ativos visuais que você carrega na plataforma para processamento por IA.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">2. Uso das Informações</h2>
                            <p>Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, processar transações e comunicar novidades. Seus ativos carregados são usados estritamente para gerar o conteúdo solicitado por você.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">3. Proteção de Dados</h2>
                            <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">4. Compartilhamento de Informações</h2>
                            <p>Não vendemos nem alugamos suas informações pessoais a terceiros. Podemos compartilhar informações com provedores de serviços que nos auxiliam na operação da plataforma (como serviços de nuvem e processamento de IA), sob rígidos acordos de confidencialidade.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">5. Seus Direitos</h2>
                            <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento através das configurações da sua conta ou entrando em contato com nosso suporte.</p>
                        </section>

                        <section className="pt-8 border-t border-slate-100">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Última atualização: 18 de fevereiro de 2026</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
