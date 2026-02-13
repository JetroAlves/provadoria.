
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { galleryService } from '../services/galleryService';

interface GalleryContextType {
  gallery: GalleryItem[];
  addToGallery: (imageUrl: string, metadata: GalleryItem['metadata']) => void;
  removeFromGallery: (id: string) => void;
  refreshGallery: () => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    refreshGallery();
  }, []);

  const refreshGallery = () => {
    const items = galleryService.getImages();
    setGallery(items);
  };

  const addToGallery = (imageUrl: string, metadata: GalleryItem['metadata']) => {
    galleryService.saveImage({ imageUrl, metadata });
    refreshGallery();
  };

  const removeFromGallery = (id: string) => {
    galleryService.deleteImage(id);
    refreshGallery();
  };

  return (
    <GalleryContext.Provider value={{ gallery, addToGallery, removeFromGallery, refreshGallery }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) throw new Error('useGallery must be used within a GalleryProvider');
  return context;
};
