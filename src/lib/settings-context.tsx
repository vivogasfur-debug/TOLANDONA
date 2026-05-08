'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface Settings {
  siteName: string;
  siteSubtitle: string;
  primaryColor: string;
  logoUrl: string;
  footerText: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<{ success: boolean; error?: string }>;
}

const defaultSettings: Settings = {
  siteName: 'Sistem Informasi Data Kecamatan Tolandona',
  siteSubtitle: 'Dashboard Rekapitulasi & Distribusi Data',
  primaryColor: '#10b981',
  logoUrl: '',
  footerText: '© 2025 Kecamatan Tolandona - Kabupaten Buton Tengah',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({
          siteName: data.settings.siteName || defaultSettings.siteName,
          siteSubtitle: data.settings.siteSubtitle || defaultSettings.siteSubtitle,
          primaryColor: data.settings.primaryColor || defaultSettings.primaryColor,
          logoUrl: data.settings.logoUrl || defaultSettings.logoUrl,
          footerText: data.settings.footerText || defaultSettings.footerText,
        });
      }
    } catch {
      console.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSettings(prev => ({ ...prev, ...newSettings }));
        return { success: true };
      }

      return { success: false, error: data.error || 'Gagal menyimpan pengaturan' };
    } catch {
      return { success: false, error: 'Terjadi kesalahan saat menyimpan' };
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
