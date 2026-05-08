'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/lib/settings-context';
import { useTheme } from '@/components/layout/theme-provider';
import { toast } from 'sonner';
import {
  Settings, Palette, Type, Image as ImageIcon, FileText, Moon, Sun,
  Save, RotateCcw, Check
} from 'lucide-react';

const colorPresets = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

export function PengaturanPage() {
  const { settings, loading, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: settings.siteName,
    siteSubtitle: settings.siteSubtitle,
    primaryColor: settings.primaryColor,
    logoUrl: settings.logoUrl,
    footerText: settings.footerText,
  });

  React.useEffect(() => {
    setFormData({
      siteName: settings.siteName,
      siteSubtitle: settings.siteSubtitle,
      primaryColor: settings.primaryColor,
      logoUrl: settings.logoUrl,
      footerText: settings.footerText,
    });
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSettings(formData);
    setSaving(false);

    if (result.success) {
      toast.success('Pengaturan berhasil disimpan!', {
        icon: <Check className="w-4 h-4" />,
      });
    } else {
      toast.error(result.error || 'Gagal menyimpan pengaturan');
    }
  };

  const handleReset = () => {
    setFormData({
      siteName: 'Sistem Informasi Data Kecamatan Tolandona',
      siteSubtitle: 'Dashboard Rekapitulasi & Distribusi Data',
      primaryColor: '#10b981',
      logoUrl: '',
      footerText: '© 2025 Kecamatan Tolandona - Kabupaten Buton Tengah',
    });
    toast.info('Pengaturan direset ke nilai default');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pengaturan</h1>
            <p className="text-sm text-slate-500">Kustomisasi tampilan dan pengaturan sistem</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Identity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5 text-emerald-500" />
              Identitas Situs
            </CardTitle>
            <CardDescription>Pengaturan nama dan deskripsi situs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nama Situs</Label>
              <Input
                id="siteName"
                value={formData.siteName}
                onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                placeholder="Nama situs..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteSubtitle">Subtitle</Label>
              <Input
                id="siteSubtitle"
                value={formData.siteSubtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, siteSubtitle: e.target.value }))}
                placeholder="Subtitle situs..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL Logo</Label>
              <div className="flex gap-2">
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="flex-1"
                />
                <ImageIcon className="w-4 h-4 self-center text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">Masukkan URL gambar logo (kosongkan untuk menggunakan default)</p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-500" />
              Tampilan
            </CardTitle>
            <CardDescription>Pengaturan warna dan tema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-400" />
                )}
                <div>
                  <p className="font-medium">Mode Tema</p>
                  <p className="text-sm text-slate-500">
                    {theme === 'light' ? 'Mode Terang' : 'Mode Gelap'}
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Warna Utama</Label>
              <div className="grid grid-cols-4 gap-2">
                {colorPresets.map((color) => (
                  <motion.button
                    key={color.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData(prev => ({ ...prev, primaryColor: color.value }))}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      formData.primaryColor === color.value
                        ? 'border-slate-800 dark:border-white ring-2 ring-offset-2'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="customColor" className="text-sm">Custom:</Label>
                <Input
                  id="customColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-12 h-8 p-0 border-0"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1"
                  placeholder="#10b981"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Settings */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Footer
            </CardTitle>
            <CardDescription>Pengaturan teks footer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="footerText">Teks Footer</Label>
              <Textarea
                id="footerText"
                value={formData.footerText}
                onChange={(e) => setFormData(prev => ({ ...prev, footerText: e.target.value }))}
                placeholder="© 2025 Nama Organisasi"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-500" />
              Preview
            </CardTitle>
            <CardDescription>Pratinjau pengaturan saat ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header Preview */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      TL
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">{formData.siteName}</h3>
                    <p className="text-sm text-slate-500">{formData.siteSubtitle}</p>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    style={{ backgroundColor: formData.primaryColor }}
                    className="text-white"
                  >
                    Button Primary
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ borderColor: formData.primaryColor, color: formData.primaryColor }}
                  >
                    Button Secondary
                  </Button>
                </div>
                <div className="flex gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Badge
                  </span>
                </div>
              </div>

              {/* Footer Preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 text-center">{formData.footerText}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
