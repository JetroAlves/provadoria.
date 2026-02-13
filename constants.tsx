
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Sparkles, 
  UserCircle, 
  Camera, 
  Video,
  Megaphone, 
  TrendingUp, 
  Settings,
  Layers,
  Tags,
  UserSquare2
} from 'lucide-react';
import { AppRoute, NavItem } from './types';

export const SIDEBAR_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: AppRoute.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Catálogo', path: AppRoute.CATALOG, icon: 'ShoppingBag' },
  { label: 'Categorias', path: AppRoute.CATEGORIES, icon: 'Tags' },
  { label: 'Avatar da Marca', path: AppRoute.BRAND_AVATAR, icon: 'UserSquare2' },
  { label: 'Showcase IA', path: AppRoute.PRODUCT_SHOWCASE, icon: 'Layers' },
  { label: 'Stylist IA', path: AppRoute.STYLIST_AI, icon: 'Sparkles' },
  { label: 'Provador Virtual', path: AppRoute.VIRTUAL_TRYON, icon: 'UserCircle' },
  { label: 'Estúdio Imagem', path: AppRoute.CREATIVE_STUDIO, icon: 'Camera' },
  { label: 'Estúdio Vídeo', path: AppRoute.VIDEO_STUDIO, icon: 'Video' },
  { label: 'Marketing', path: AppRoute.MARKETING, icon: 'Megaphone' },
  { label: 'Tendências', path: AppRoute.TRENDS, icon: 'TrendingUp' },
  { label: 'Configurações', path: AppRoute.SETTINGS, icon: 'Settings' },
];

export const getIcon = (iconName: string, className?: string) => {
  switch (iconName) {
    case 'LayoutDashboard': return <LayoutDashboard className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'UserCircle': return <UserCircle className={className} />;
    case 'Camera': return <Camera className={className} />;
    case 'Video': return <Video className={className} />;
    case 'Megaphone': return <Megaphone className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'Settings': return <Settings className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'Tags': return <Tags className={className} />;
    case 'UserSquare2': return <UserSquare2 className={className} />;
    default: return <LayoutDashboard className={className} />;
  }
};
