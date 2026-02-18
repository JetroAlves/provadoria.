
export enum AppRoute {
  LANDING = '/',
  DASHBOARD = '/dashboard',
  LOGIN = '/login',
  REGISTER = '/register',
  ONBOARDING = '/onboarding',
  CATALOG = '/catalog',
  CATALOG_NEW = '/catalog/new',
  CATALOG_EDIT = '/catalog/edit/:id',
  CATEGORIES = '/categories',
  STYLIST_AI = '/stylist-ai',
  VIRTUAL_TRYON = '/virtual-tryon',
  CREATIVE_STUDIO = '/creative-studio',
  VIDEO_STUDIO = '/video-studio',
  BRAND_AVATAR = '/brand-avatar',
  MARKETING = '/marketing',
  TRENDS = '/trends',
  SETTINGS = '/settings',
  PUBLIC_STORE = '/loja/:storeSlug',
  PUBLIC_PRODUCT = '/loja/:storeSlug/produto/:productId',
  PRODUCT_SHOWCASE = '/product-showcase',
  TERMS = '/termos',
  PRIVACY = '/privacidade'
}

export interface NavItem {
  label: string;
  path: AppRoute;
  icon: string;
}

export interface User {
  id: string;
  email: string;
  storeName?: string;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  order: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  description?: string;
  status: 'active' | 'inactive';
  lastGenerated?: string;
  // Novos campos para classificação precisa
  gender?: 'Feminino' | 'Masculino' | 'Unissex';
  wearableType?: 'top' | 'bottom' | 'fullbody' | 'shoes' | 'accessory';
}

export interface BrandAvatar {
  id: string;
  name: string;
  is_default: boolean;
  image_url: string;
  config: {
    modelCategory?: 'adult' | 'child'; // Novo campo discriminador
    gender: string;
    bodyType: string;
    height?: string; // Opcional para crianças (inferido pela idade)
    age: string; // Genérico ou Faixa Etária Específica
    skinTone: string;
    skinUndertone: string;
    skinTexture: string;
    expression: string;
    hairLength: string;
    hairTexture: string;
    hairColor: string;
    posture: string;
    bodyLanguage: string;
    brandStyle: string;
    // Campos opcionais específicos
    beardStyle?: string;
    mustacheStyle?: string;
    childHairStyle?: string; // Novo
  };
  created_at: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  createdAt: number;
  metadata: {
    avatarId?: string | null;
    productIds: string[];
    collectionId?: string;
    sceneId?: string;
    format?: string;
    prompt?: string;
  };
}
