
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, brandName: string, fullName: string) => Promise<void>;
  completeOnboarding: (storeName: string, storeSlug: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Monitorar mudanças na sessão do Supabase
    // Se as chaves forem inválidas, isso simplesmente não retornará dados
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          storeName: session.user.user_metadata?.storeName,
          avatarUrl: session.user.user_metadata?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata?.fullName || 'User')}&background=000&color=fff`
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (supabase.auth.getSession === undefined) {
      throw new Error("Supabase não configurado. Verifique as variáveis de ambiente.");
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, pass: string, brandName: string, fullName: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          brandName,
          fullName,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=000&color=fff`
        }
      }
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const completeOnboarding = async (storeName: string, storeSlug: string) => {
    setIsLoading(true);

    const { error: authError } = await supabase.auth.updateUser({
      data: { storeName, storeSlug }
    });

    if (authError) {
      setIsLoading(false);
      throw authError;
    }

    const currentSettings = localStorage.getItem('provadoria_settings');
    const settings = currentSettings ? JSON.parse(currentSettings) : {};
    localStorage.setItem('provadoria_settings', JSON.stringify({
      ...settings,
      storeName,
      publicStoreSlug: storeSlug,
      publicStoreActive: true
    }));

    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Erro ao deslogar:", e);
    } finally {
      setUser(null);
      localStorage.removeItem('provadoria_auth_user');
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    setIsLoading(false);
    if (error) throw error;
  };

  const updateUserPassword = async (newPassword: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    setIsLoading(false);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      completeOnboarding,
      loginWithGoogle,
      logout,
      resetPasswordForEmail,
      updateUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};