'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { SettingsProvider } from '@/lib/settings-context';
import { ThemeProvider, useTheme } from '@/components/layout/theme-provider';
import { LoginPage } from '@/components/pages/login-page';
import { DashboardPage } from '@/components/pages/dashboard-page';
import { DataPageUnified } from '@/components/pages/data-page-unified';
import { RekapitulasiPage } from '@/components/pages/rekapitulasi-page';
import { DistribusiPage } from '@/components/pages/distribusi-page';
import { PengaturanPage } from '@/components/pages/pengaturan-page';
import { UsersPage } from '@/components/pages/users-page';
import { PayrollPage } from '@/components/pages/payroll-page';
import { AhliGiziPage } from '@/components/pages/ahli-gizi-page';
import { BeritaAcaraPage } from '@/components/pages/berita-acara-page';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Loader2, ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Unauthorized Page Component
function UnauthorizedPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Akses Ditolak</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Button>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading, hasAccess, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!sidebarOpen || !isMobile) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, isMobile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  const handleNavigate = (page: string) => {
    // Check if user has access to the page
    if (!hasAccess(page)) {
      // Redirect to dashboard if no access
      setCurrentPage('dashboard');
      return;
    }
    setCurrentPage(page);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderPage = () => {
    // Check access before rendering page
    if (!hasAccess(currentPage)) {
      return <UnauthorizedPage />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'data':
        return <DataPageUnified />;
      case 'rekapitulasi':
        return <RekapitulasiPage />;
      case 'distribusi':
        return <DistribusiPage />;
      case 'payroll':
        return <PayrollPage />;
      case 'ahligizi':
        return <AhliGiziPage />;
      case 'beritaacara':
        return <BeritaAcaraPage />;
      case 'users':
        return <UsersPage />;
      case 'pengaturan':
        return <PengaturanPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdmin={isAdmin()}
      />

      {/* Main Content - with left margin on desktop for sidebar */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          onThemeToggle={toggleTheme}
        />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
