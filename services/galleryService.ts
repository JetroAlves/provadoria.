
import { GalleryItem } from '../types';

const STORAGE_KEY = 'provadoria_gallery_v1';

export const galleryService = {
  saveImage: (item: Omit<GalleryItem, 'id' | 'createdAt'>): GalleryItem => {
    const newItem: GalleryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };

    const existingData = localStorage.getItem(STORAGE_KEY);
    const gallery: GalleryItem[] = existingData ? JSON.parse(existingData) : [];
    
    // Adiciona no início
    const updatedGallery = [newItem, ...gallery];
    
    // Limite de segurança (ex: 50 itens para não estourar localStorage se imagens forem base64)
    // Idealmente, as imagens devem ser URLs do Supabase, não base64 puro aqui.
    if (updatedGallery.length > 50) {
      updatedGallery.pop();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGallery));
    return newItem;
  },

  getImages: (): GalleryItem[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  deleteImage: (id: string): GalleryItem[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const gallery: GalleryItem[] = JSON.parse(data);
    const updatedGallery = gallery.filter(item => item.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGallery));
    return updatedGallery;
  }
};
