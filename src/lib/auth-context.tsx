'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Define page access by role
const PAGE_PERMISSIONS: Record<string, string[]> = {
  admin: ['dashboard', 'data', 'rekapitulasi', 'distribusi', 'badistribusi', 'gudang', 'payroll', 'ahligizi', 'beritaacara', 'users', 'pengaturan'],
  user: ['dashboard', 'rekapitulasi', 'distribusi', 'badistribusi', 'gudang', 'payroll', 'ahligizi', 'beritaacara'],
};

// Pages that require admin role
const ADMIN_ONLY_PAGES = ['data', 'users', 'pengaturan'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasAccess: (page: string) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: data.error || 'Login gagal' };
    } catch {
      return { success: false, error: 'Terjadi kesalahan saat login' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      sessionStorage.removeItem('user');
    }
  };

  const hasAccess = (page: string): boolean => {
    if (!user) return false;
    const allowedPages = PAGE_PERMISSIONS[user.role] || [];
    return allowedPages.includes(page);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasAccess, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
