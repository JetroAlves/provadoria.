
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SIDEBAR_ITEMS, getIcon } from '../constants';
import { ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isDesktopOpen: boolean;
  setIsDesktopOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isDesktopOpen, 
  setIsDesktopOpen,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Helper para determinar se mostramos o texto (Desktop Expandido OU Mobile Aberto)
  // No mobile, se o menu está aberto, ele é sempre "largo" (w-64)
  const showLabels = isMobileOpen || isDesktopOpen;

  return (
    <aside 
      className={`
        fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 
        transition-all duration-300 ease-in-out flex flex-col
        /* Mobile: Width fixa 64, Transform controla visibilidade */
        w-64 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        /* Desktop: Transform resetado, Width dinâmica */
        lg:translate-x-0 lg:${isDesktopOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100 relative justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          {/* Mostra titulo no mobile ou se desktop estiver expandido */}
          <span className={`font-bold text-xl tracking-tight text-slate-800 transition-opacity duration-300 ${showLabels ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
            Provadoria
          </span>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 text-slate-400 hover:text-black transition-colors"
        >
          <X size={20} />
        </button>

        {/* Desktop Toggle Button */}
        <button 
          onClick={() => setIsDesktopOpen(!isDesktopOpen)}
          className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 md:flex hidden"
        >
          {isDesktopOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)} // Fecha menu ao clicar no link (mobile)
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group
              ${isActive 
                ? 'bg-black text-white shadow-lg' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <div className="shrink-0">
                {getIcon(item.icon, `w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`)}
              </div>
              <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${showLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden lg:opacity-0'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Profile / Logout Section */}
      <div className="p-4 border-t border-slate-100 mt-auto">
        <div className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all group ${!showLabels ? 'justify-center p-2' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
              <img 
                src={user?.avatarUrl || "https://picsum.photos/seed/user/100"} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${showLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
              <span className="text-xs font-black text-slate-900 truncate">
                {user?.storeName || 'Mariana Silva'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Proprietária</span>
            </div>
          </div>
          
          {showLabels && (
            <button 
              onClick={() => logout()}
              title="Sair da plataforma"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
            >
              <LogOut size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
        
        {!showLabels && (
          <button 
            onClick={() => logout()}
            className="w-full mt-2 flex justify-center p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
