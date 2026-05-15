'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/lib/settings-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

interface Stats {
  totalGuru: number;
  totalSiswa: number;
  totalPosyandu: number;
  totalRelawan: number;
}

// Logo component with fallback
function LogoImage({ src, size = 'large' }: { src?: string; size?: 'large' | 'small' }) {
  const [error, setError] = useState(false);
  
  const sizeClasses = size === 'large' 
    ? 'w-24 h-24 rounded-2xl' 
    : 'w-16 h-16 rounded-xl';
  
  const iconSize = size === 'large' ? 'w-12 h-12' : 'w-8 h-8';
  
  if (!src || error) {
    return (
      <div className={`${sizeClasses} bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl`}>
        <Database className={`${iconSize} text-white`} />
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses} bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl overflow-hidden`}>
      <img 
        key={src}
        src={src} 
        alt="Logo" 
        className="w-full h-full object-contain p-2"
        onError={() => setError(true)}
      />
    </div>
  );
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { login } = useAuth();
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalGuru: 0,
    totalSiswa: 0,
    totalPosyandu: 0,
    totalRelawan: 0,
  });

  // Fetch stats from database
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (data.success) {
          setStats({
            totalGuru: data.stats.totalGuru,
            totalSiswa: data.stats.totalSiswa,
            totalPosyandu: data.stats.totalPosyandu,
            totalRelawan: data.stats.totalRelawan,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      onLogin();
    } else {
      setError(result.error || 'Login gagal');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <LogoImage src={settings.logoUrl} size="large" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center mb-3"
          >
            {settings.siteName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-white/80 text-center max-w-md"
          >
            {settings.siteSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 grid grid-cols-3 gap-6"
          >
            <div className="text-center">
              <div className="text-xl font-bold">{stats.totalGuru.toLocaleString()}</div>
              <div className="text-xs text-white/60">Guru</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.totalSiswa.toLocaleString()}</div>
              <div className="text-xs text-white/60">Siswa</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.totalPosyandu.toLocaleString()}</div>
              <div className="text-xs text-white/60">Posyandu</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg overflow-hidden">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              {!settings.logoUrl && <Database className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-base font-bold text-slate-800 dark:text-white">
              {settings.siteName}
            </h1>
          </div>

          <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg font-bold text-center">
                Selamat Datang
              </CardTitle>
              <CardDescription className="text-center">
                Masuk ke akun Anda untuk melanjutkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="animate-shake">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@tolandona.go.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </Button>

                <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Demo: admin@tolandona.go.id / admin123
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
