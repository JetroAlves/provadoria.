
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './components/views/LandingPage';
import Dashboard from './components/views/Dashboard';
import StylistAI from './components/views/StylistAI';
import CreativeStudio from './components/views/CreativeStudio';
import VideoStudio from './components/views/VideoStudio';
import BrandAvatar from './components/views/BrandAvatar';
import Catalog from './components/views/Catalog';
import Categories from './components/views/Categories';
import ProductForm from './components/views/ProductForm';
import PublicStore from './components/views/PublicStore';
import PublicProduct from './components/views/PublicProduct';
import VirtualTryOn from './components/views/VirtualTryOn';
import Marketing from './components/views/Marketing';
import Trends from './components/views/Trends';
import Settings from './components/views/Settings';
import ProductShowcase from './components/views/ProductShowcase';
import Login from './components/views/Login';
import Register from './components/views/Register';
import Onboarding from './components/views/Onboarding';
import Terms from './components/views/Terms';
import Privacy from './components/views/Privacy';
import ForgotPassword from './components/views/ForgotPassword';
import ResetPassword from './components/views/ResetPassword';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GalleryProvider } from './context/GalleryContext';
import { CartProvider } from './context/CartContext';
import { AppRoute } from './types';

// Componente para rotas que só podem ser vistas se NÃO estiver logado (Login/Register)
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <AuthLoadingScreen />;
  if (user) return <Navigate to={user.storeName ? AppRoute.DASHBOARD : AppRoute.ONBOARDING} replace />;
  return <>{children}</>;
};

// Componente para proteger rotas internas
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to={AppRoute.LOGIN} state={{ from: location }} replace />;
  if (!user.storeName && location.pathname !== AppRoute.ONBOARDING) return <Navigate to={AppRoute.ONBOARDING} replace />;
  return <>{children}</>;
};

const AuthLoadingScreen = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
      <span className="text-white font-black text-3xl tracking-tighter">P</span>
    </div>
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-slate-100 border-t-[#E11D48] rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Provadoria Intelligence</p>
      </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* 1. HOME PÚBLICA (Landing Page) */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. AUTH FLOW */}
      <Route path={AppRoute.LOGIN} element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path={AppRoute.REGISTER} element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path={AppRoute.ONBOARDING} element={<AuthGuard><Onboarding /></AuthGuard>} />

      {/* 3. ÁREA DA PLATAFORMA (Dashboard & Ferramentas) */}
      <Route path={AppRoute.DASHBOARD} element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>} />
      <Route path={AppRoute.CATALOG} element={<AuthGuard><Layout><Catalog /></Layout></AuthGuard>} />
      <Route path={AppRoute.CATALOG_NEW} element={<AuthGuard><Layout><ProductForm /></Layout></AuthGuard>} />
      <Route path="/catalog/edit/:id" element={<AuthGuard><Layout><ProductForm /></Layout></AuthGuard>} />
      <Route path={AppRoute.CATEGORIES} element={<AuthGuard><Layout><Categories /></Layout></AuthGuard>} />
      <Route path={AppRoute.BRAND_AVATAR} element={<AuthGuard><Layout><BrandAvatar /></Layout></AuthGuard>} />
      <Route path={AppRoute.STYLIST_AI} element={<AuthGuard><Layout><StylistAI /></Layout></AuthGuard>} />
      <Route path={AppRoute.CREATIVE_STUDIO} element={<AuthGuard><Layout><CreativeStudio /></Layout></AuthGuard>} />
      <Route path={AppRoute.VIDEO_STUDIO} element={<AuthGuard><Layout><VideoStudio /></Layout></AuthGuard>} />
      <Route path={AppRoute.VIRTUAL_TRYON} element={<AuthGuard><Layout><VirtualTryOn /></Layout></AuthGuard>} />
      <Route path={AppRoute.MARKETING} element={<AuthGuard><Layout><Marketing /></Layout></AuthGuard>} />
      <Route path={AppRoute.TRENDS} element={<AuthGuard><Layout><Trends /></Layout></AuthGuard>} />
      <Route path={AppRoute.SETTINGS} element={<AuthGuard><Layout><Settings /></Layout></AuthGuard>} />
      <Route path={AppRoute.PRODUCT_SHOWCASE} element={<AuthGuard><Layout><ProductShowcase /></Layout></AuthGuard>} />

      {/* 4. VITRINES PÚBLICAS DAS LOJAS */}
      <Route path="/loja/:storeSlug" element={<PublicStore />} />
      <Route path="/loja/:storeSlug/produto/:productId" element={<PublicProduct />} />

      {/* 5. PÁGINAS LEGAIS */}
      <Route path={AppRoute.TERMS} element={<Terms />} />
      <Route path={AppRoute.PRIVACY} element={<Privacy />} />
      <Route path={AppRoute.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={AppRoute.RESET_PASSWORD} element={<ResetPassword />} />

      {/* Redirecionamento padrão para Home se rota não existir */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <GalleryProvider>
          <CartProvider>
            <HashRouter>
              <AppContent />
            </HashRouter>
          </CartProvider>
        </GalleryProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
