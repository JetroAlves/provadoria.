import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms: React.FC = () => {
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
                        Termos de <span className="text-[#E11D48] italic">Uso.</span>
                    </h1>

                    <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed">
                        <section>
                            <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">1. Aceitação dos Termos</h2>
                            <p>Ao acessar e utilizar a plataforma Provadoria, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">2. Descrição do Serviço</h2>
                            <p>A Provadoria fornece uma plataforma baseada em inteligência artificial para geração de conteúdo visual, incluindo, mas não se limitando a, ensaios fotográficos virtuais, provadores virtuais e vídeos de marketing.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">3. Propriedade Intelectual</h2>
                            <p>Todo o conteúdo gerado pela plataforma é de propriedade do usuário que o gerou, observadas as licenças de terceiros e tecnologias utilizadas. A estrutura, design e algoritmos da plataforma são de propriedade exclusiva da Provadoria.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">4. Responsabilidades do Usuário</h2>
                            <p>O usuário é responsável por manter a confidencialidade de sua conta e senha, bem como por todas as atividades que ocorrem sob sua conta. O uso da plataforma para fins ilícitos é estritamente proibido.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4">5. Limitação de Responsabilidade</h2>
                            <p>A Provadoria não se responsabiliza por danos indiretos, incidentais ou consequentes resultantes do uso ou da incapacidade de usar o serviço.</p>
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

export default Terms;
