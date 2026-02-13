
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, Search, X, Sparkles, Layers, UserCircle, Camera, Video, ArrowRight, Menu } from 'lucide-react';
import { AppRoute } from '../types';
import { useSettings } from '../context/SettingsContext';

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuClick }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const tools = [
    { label: 'Showcase IA', route: AppRoute.PRODUCT_SHOWCASE, icon: Layers, color: 'bg-emerald-500', desc: 'Isolar produto' },
    { label: 'Stylist IA', route: AppRoute.STYLIST_AI, icon: Sparkles, color: 'bg-indigo-500', desc: 'Gerar looks' },
    { label: 'Provador Virtual', route: AppRoute.VIRTUAL_TRYON, icon: UserCircle, color: 'bg-rose-500', desc: 'Simular caimento' },
    { label: 'Estúdio Imagem', route: AppRoute.CREATIVE_STUDIO, icon: Camera, color: 'bg-amber-500', desc: 'Sessão de fotos' },
    { label: 'Estúdio Vídeo', route: AppRoute.VIDEO_STUDIO, icon: Video, color: 'bg-blue-500', desc: 'Gerar Reels' },
  ];

  const handleCreateContent = (route: AppRoute) => {
    navigate(route);
    setIsCreateModalOpen(false);
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between transition-all">
      {/* Left Section: Mobile Menu & Search/Info */}
      <div className="flex items-center gap-4 md:gap-8">
        {/* Mobile Hamburger Button */}
        <button 
          onClick={onMobileMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:text-black lg:hidden active:scale-95 transition-transform"
        >
          <Menu size={24} />
        </button>

        <div className="hidden lg:flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loja Ativa</span>
          <span className="text-sm font-black text-slate-900 tracking-tight">{settings.storeName}</span>
        </div>
        
        {/* Branding Mobile (Optional fallback if user scrolls past Sidebar header) */}
        <div className="lg:hidden flex flex-col">
           <span className="text-sm font-black text-slate-900 tracking-tight">{settings.storeName}</span>
        </div>
        
        <div className="relative group md:block hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por produtos ou tendências..." 
            className="pl-12 pr-6 py-2.5 bg-slate-100 border-none rounded-full text-sm font-medium w-64 xl:w-96 focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Actions (Right) */}
      <div className="flex items-center gap-3 md:gap-5">
        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
          <Bell size={22} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
        </button>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2.5 bg-black text-white px-4 md:px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          <span className="hidden sm:inline">Criar Conteúdo</span>
        </button>
      </div>

      {/* Create Content Modal - Using Portal to avoid clipping */}
      {isCreateModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
          {/* Overlay com scroll para garantir acessibilidade em telas pequenas */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" 
            onClick={() => setIsCreateModalOpen(false)}
          />
          
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] p-8 md:p-12 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-start justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">Criar com IA</h2>
                <p className="text-slate-500 text-sm md:text-base mt-2">Selecione uma ferramenta para começar.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-500 hover:text-black shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tools.map(tool => (
                <button
                  key={tool.label}
                  onClick={() => handleCreateContent(tool.route)}
                  className="group flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 hover:bg-white border-2 border-transparent hover:border-black transition-all hover:shadow-2xl hover:-translate-y-1 text-left"
                >
                  <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                    <tool.icon size={26} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-black text-slate-900 tracking-tight text-lg">{tool.label}</p>
                    <p className="text-xs text-slate-500 font-medium truncate">{tool.desc}</p>
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-black transition-colors" />
                </button>
              ))}
            </div>

            <div className="mt-12 p-6 bg-slate-900 rounded-[2.5rem] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                    <Sparkles className="text-amber-400" size={24} />
                 </div>
                 <div className="text-center sm:text-left">
                    <p className="text-xs font-black uppercase tracking-widest text-white/50">Dica da Provadoria</p>
                    <p className="text-sm text-white font-medium">Novos cenários de Paris disponíveis hoje.</p>
                 </div>
               </div>
               <button 
                onClick={() => handleCreateContent(AppRoute.CREATIVE_STUDIO)}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 shadow-xl transition-all active:scale-95"
              >
                Explorar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default Header;
