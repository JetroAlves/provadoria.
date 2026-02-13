
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fechar menu mobile ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Fechar menu mobile ao mudar de rota (opcional, mas boa prática de UX)
  // Como as rotas estão dentro do children, o React Router cuida disso, 
  // mas se o menu persistir, podemos adicionar um useEffect no useLocation aqui.

  return (
    <div className="min-h-screen flex bg-slate-50 relative">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Handles both Mobile (Drawer) and Desktop (Fixed) states */}
      <Sidebar 
        isDesktopOpen={isDesktopOpen} 
        setIsDesktopOpen={setIsDesktopOpen}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      {/* Main Content Area */}
      {/* Mobile: ml-0 (content underneath drawer) */}
      {/* Desktop: Dynamic margin based on desktop sidebar state */}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full ml-0 ${isDesktopOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header onMobileMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
