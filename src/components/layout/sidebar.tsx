'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettings } from '@/lib/settings-context';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  PieChart,
  Settings,
  UserCog,
  X,
  Wallet,
  Salad,
  Package,
  Warehouse,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
  adminOnly?: boolean;
}

const allMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'data', label: 'Data', icon: Database, gradient: 'from-cyan-500 to-blue-600', adminOnly: true },
  { id: 'rekapitulasi', label: 'Rekapitulasi', icon: BarChart3, gradient: 'from-purple-500 to-pink-600' },
  { id: 'distribusi', label: 'Distribusi', icon: PieChart, gradient: 'from-orange-500 to-red-600' },
  { id: 'badistribusi', label: 'BA Distribusi', icon: Package, gradient: 'from-amber-500 to-orange-600' },
  { id: 'gudang', label: 'Gudang', icon: Warehouse, gradient: 'from-slate-500 to-gray-600' },
  { id: 'payroll', label: 'Payroll', icon: Wallet, gradient: 'from-teal-500 to-cyan-600' },
  { id: 'ahligizi', label: 'Ahli Gizi', icon: Salad, gradient: 'from-green-500 to-emerald-600' },
  { id: 'users', label: 'Pengguna', icon: UserCog, gradient: 'from-violet-500 to-purple-600', adminOnly: true },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings, gradient: 'from-gray-500 to-slate-600', adminOnly: true },
];

export function Sidebar({ currentPage, onNavigate, isOpen, onClose, isAdmin = false }: SidebarProps) {
  const { settings } = useSettings();
  const [isMobile, setIsMobile] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Filter menu items based on role
  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => !item.adminOnly || isAdmin);
  }, [isAdmin]);
  
  // Derive showLogo state from settings and error
  const showLogo = settings.logoUrl && !logoError;

  // Detect mobile screen - only run on client
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar when page changes
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
  }, [currentPage]);

  // Navigation items renderer
  const renderNavItems = (isMobileView: boolean) => (
    menuItems.map((item, index) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <button
          onClick={() => onNavigate(item.id)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-300',
            'hover:bg-white/10 group relative overflow-hidden',
            currentPage === item.id
              ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
              : 'text-slate-300'
          )}
        >
          <item.icon className="w-4 h-4" />
          <span className="font-medium text-sm">{item.label}</span>
        </button>
      </motion.div>
    ))
  );

  // Logo component
  const renderLogo = () => (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden">
        {showLogo ? (
          <img 
            key={settings.logoUrl}
            src={settings.logoUrl} 
            alt="Logo" 
            className="w-full h-full object-contain p-1"
            onError={() => setLogoError(true)}
          />
        ) : (
          <Database className="w-5 h-5 text-white" />
        )}
      </div>
      <div>
        <h1 className="text-base font-bold text-white">SIDATA</h1>
        <p className="text-[10px] text-slate-400">Kec. Tolandona</p>
      </div>
    </div>
  );

  // Footer component
  const renderFooter = () => (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
        <span className="text-xs font-bold text-white">TL</span>
      </div>
      <div>
        <p className="text-xs font-medium text-white">Tolandona</p>
        <p className="text-[10px] text-slate-400">Buton Tengah</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-full w-64 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-emerald-500/10">
        {/* Logo section */}
        <div className="p-4 border-b border-white/10">
          {renderLogo()}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {renderNavItems(false)}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          {renderFooter()}
        </div>
      </aside>

      {/* Mobile Sidebar - Slide in/out */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
              onClick={onClose}
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed lg:hidden left-0 top-0 z-[110] h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-emerald-500/10 flex flex-col"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors z-[120]"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Logo section */}
              <div className="p-4 border-b border-white/10 pt-12">
                {renderLogo()}
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                {renderNavItems(true)}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-white/10 pb-safe">
                {renderFooter()}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
