
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, BrandAvatar } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface StoreSettings {
  storeName: string;
  description: string;
  targetAudience: string;
  brandStyle: string;
  brandTone: string;
  keywordsToUse: string;
  keywordsToAvoid: string;
  language: string;
  aiModelPreferences: {
    female: boolean;
    male: boolean;
    diversity: boolean;
  };
  virtualTryOnActive: boolean;
  saveClientImages: boolean;
  standardHashtags: string;
  standardCTA: string;
  publicStoreSlug: string;
  publicStoreActive: boolean;
  publicStoreDescription: string;
  seoTitle: string;
  seoDescription: string;
  logoUrl?: string;
  bannerDeskUrl?: string;
  bannerMobileUrl?: string;
}

interface SettingsContextType {
  settings: StoreSettings;
  products: Product[];
  categories: Category[];
  avatars: BrandAvatar[];
  savedLooks: any[];
  aiDrafts: any[];
  isLoading: boolean;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'order'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categories: Category[]) => Promise<void>;
  saveLook: (look: any) => Promise<void>;
  deleteLook: (id: string) => Promise<void>;
  addDraft: (imageUrl: string) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  addAvatar: (avatar: Omit<BrandAvatar, 'id' | 'created_at'>) => Promise<void>;
  deleteAvatar: (id: string) => Promise<void>;
  setDefaultAvatar: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Carregando...',
  description: '',
  targetAudience: '',
  brandStyle: 'Minimalista',
  brandTone: 'Luxo',
  keywordsToUse: '',
  keywordsToAvoid: '',
  language: 'Português (Brasil)',
  aiModelPreferences: { female: true, male: true, diversity: true },
  virtualTryOnActive: true,
  saveClientImages: false,
  standardHashtags: '',
  standardCTA: '',
  publicStoreSlug: '',
  publicStoreActive: true,
  publicStoreDescription: '',
  seoTitle: '',
  seoDescription: '',
  logoUrl: '',
  bannerDeskUrl: '',
  bannerMobileUrl: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [avatars, setAvatars] = useState<BrandAvatar[]>([]);
  const [savedLooks, setSavedLooks] = useState<any[]>([]);
  const [aiDrafts, setAiDrafts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [pRes, cRes, prRes, lRes, dRes, aRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('categories').select('*').eq('user_id', user.id).order('display_order'),
        supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('saved_looks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('ai_drafts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('avatars').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      setSettings({
        ...DEFAULT_SETTINGS,
        storeName: pRes.data?.store_name || user.storeName || '',
        description: pRes.data?.description || '',
        brandStyle: pRes.data?.brand_style || 'Minimalista',
        brandTone: pRes.data?.brand_tone || 'Luxo',
        targetAudience: pRes.data?.target_audience || '',
        publicStoreSlug: pRes.data?.store_slug || '',
        publicStoreActive: pRes.data?.public_store_active ?? true,
        standardHashtags: pRes.data?.standard_hashtags || '',
        standardCTA: pRes.data?.standard_cta || '',
        virtualTryOnActive: pRes.data?.virtual_tryon_active ?? true,
        seoTitle: pRes.data?.seo_title || '',
        seoDescription: pRes.data?.seo_description || '',
        logoUrl: pRes.data?.logo_url || '',
        bannerDeskUrl: pRes.data?.banner_desk_url || '',
        bannerMobileUrl: pRes.data?.banner_mobile_url || '',
      });

      if (cRes.data) {
        setCategories(cRes.data.map(c => ({
          id: c.id, name: c.name, slug: c.slug, status: c.status, order: c.display_order
        })));
      }

      if (prRes.data) {
        setProducts(prRes.data.map(p => ({
          id: p.id, name: p.name, category: p.category || 'Geral',
          price: Number(p.price), stock: p.stock, image: p.image_url,
          status: p.status, description: p.description, lastGenerated: p.last_generated_at,
          gender: p.gender || 'Feminino',
          wearableType: p.wearable_type || undefined
        })));
      }

      if (lRes.data) setSavedLooks(lRes.data);
      if (dRes.data) setAiDrafts(dRes.data);
      if (aRes.data) setAvatars(aRes.data);

    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      store_name: newSettings.storeName,
      store_slug: newSettings.publicStoreSlug,
      brand_style: newSettings.brandStyle,
      brand_tone: newSettings.brandTone,
      target_audience: newSettings.targetAudience,
      description: newSettings.description,
      standard_hashtags: newSettings.standardHashtags,
      standard_cta: newSettings.standardCTA,
      public_store_active: newSettings.publicStoreActive,
      virtual_tryon_active: newSettings.virtualTryOnActive,
      seo_title: newSettings.seoTitle,
      seo_description: newSettings.seoDescription,
      logo_url: newSettings.logoUrl,
      banner_desk_url: newSettings.bannerDeskUrl,
      banner_mobile_url: newSettings.bannerMobileUrl,
    });

    if (error) throw error;
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('products').insert({
      user_id: user.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image_url: product.image,
      status: product.status,
      description: product.description,
      category: product.category,
      gender: product.gender,
      wearable_type: product.wearableType
    }).select().single();

    if (error) throw error;
    if (data) {
      setProducts(prev => [{
        id: data.id,
        name: data.name,
        category: data.category || 'Geral',
        price: Number(data.price),
        stock: data.stock,
        image: data.image_url,
        status: data.status,
        description: data.description,
        lastGenerated: data.last_generated_at,
        gender: data.gender,
        wearableType: data.wearable_type
      }, ...prev]);
    }
  };

  const updateProduct = async (id: string, productUpdate: Partial<Product>) => {
    const { error } = await supabase.from('products').update({
      name: productUpdate.name,
      price: productUpdate.price,
      stock: productUpdate.stock,
      image_url: productUpdate.image,
      status: productUpdate.status,
      description: productUpdate.description,
      category: productUpdate.category,
      gender: productUpdate.gender,
      wearable_type: productUpdate.wearableType
    }).eq('id', id);

    if (error) throw error;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productUpdate } : p));
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = async (category: Omit<Category, 'id' | 'order'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('categories').insert({
      user_id: user.id, name: category.name, slug: category.slug, status: category.status,
      display_order: categories.length
    }).select().single();

    if (error) throw error;
    if (data) setCategories(prev => [...prev, { ...category, id: data.id, order: data.display_order }]);
  };

  const updateCategory = async (id: string, categoryUpdate: Partial<Category>) => {
    const { error } = await supabase.from('categories').update({
      name: categoryUpdate.name, slug: categoryUpdate.slug, status: categoryUpdate.status
    }).eq('id', id);

    if (error) throw error;
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...categoryUpdate } : c));
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const reorderCategories = async (newOrder: Category[]) => {
    const updates = newOrder.map((cat, index) =>
      supabase.from('categories').update({ display_order: index }).eq('id', cat.id)
    );
    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);
    if (hasError) throw new Error("Falha ao reordenar categorias.");

    setCategories(newOrder.map((c, i) => ({ ...c, order: i })));
  };

  const saveLook = async (look: any) => {
    if (!user) return;
    const { data, error } = await supabase.from('saved_looks').insert({
      user_id: user.id, occasion: look.occasion, style: look.style,
      ai_result: look.result, image_url: look.image
    }).select().single();

    if (error) throw error;
    if (data) setSavedLooks(prev => [data, ...prev]);
  };

  const deleteLook = async (id: string) => {
    const { error } = await supabase.from('saved_looks').delete().eq('id', id);
    if (error) throw error;
    setSavedLooks(prev => prev.filter(l => l.id !== id));
  };

  const addDraft = async (imageUrl: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('ai_drafts').insert({
      user_id: user.id, image_url: imageUrl
    }).select().single();

    if (error) throw error;
    if (data) setAiDrafts(prev => [data, ...prev]);
  };

  const deleteDraft = async (id: string) => {
    const { error } = await supabase.from('ai_drafts').delete().eq('id', id);
    if (error) throw error;
    setAiDrafts(prev => prev.filter(d => d.id !== id));
  };

  const addAvatar = async (avatar: Omit<BrandAvatar, 'id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('avatars').insert({
      user_id: user.id,
      name: avatar.name,
      is_default: avatar.is_default,
      config: avatar.config,
      image_url: avatar.image_url
    }).select().single();

    if (error) throw error;
    if (data) setAvatars(prev => [data, ...prev]);
  };

  const deleteAvatar = async (id: string) => {
    const { error } = await supabase.from('avatars').delete().eq('id', id);
    if (error) throw error;
    setAvatars(prev => prev.filter(a => a.id !== id));
  };

  const setDefaultAvatar = async (id: string) => {
    if (!user) return;
    await supabase.from('avatars').update({ is_default: false }).eq('user_id', user.id);
    const { error } = await supabase.from('avatars').update({ is_default: true }).eq('id', id);
    if (error) throw error;
    setAvatars(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
  };

  return (
    <SettingsContext.Provider value={{
      settings, products, categories, savedLooks, aiDrafts, avatars, isLoading,
      updateSettings, addProduct, updateProduct, deleteProduct,
      addCategory, updateCategory, deleteCategory, reorderCategories,
      saveLook, deleteLook, addDraft, deleteDraft,
      addAvatar, deleteAvatar, setDefaultAvatar, refreshData: fetchData
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};