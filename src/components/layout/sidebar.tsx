'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  PieChart,
  Settings,
  GraduationCap,
  Users,
  Baby,
  UserCog,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'data', label: 'Data', icon: Database, gradient: 'from-cyan-500 to-blue-600' },
  { id: 'rekapitulasi', label: 'Rekapitulasi', icon: BarChart3, gradient: 'from-purple-500 to-pink-600' },
  { id: 'distribusi', label: 'Distribusi', icon: PieChart, gradient: 'from-orange-500 to-red-600' },
  { id: 'users', label: 'Pengguna', icon: UserCog, gradient: 'from-violet-500 to-purple-600' },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings, gradient: 'from-gray-500 to-slate-600' },
];

const dataSubmenu = [
  { id: 'guru', label: 'Data Guru', icon: GraduationCap, color: 'text-emerald-500' },
  { id: 'siswa', label: 'Data Siswa', icon: Users, color: 'text-cyan-500' },
  { id: 'posyandu', label: 'Data Posyandu', icon: Baby, color: 'text-pink-500' },
];

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  const isDataSubmenu = ['guru', 'siswa', 'posyandu'].includes(currentPage);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed lg:static left-0 top-0 z-50 h-full w-72',
          'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
          'shadow-2xl shadow-emerald-500/10',
          'flex flex-col'
        )}
      >
        {/* Logo section */}
        <div className="p-6 border-b border-white/10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SIDATA</h1>
              <p className="text-xs text-slate-400">Kec. Tolandona</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => {
                  onNavigate(item.id === 'data' ? 'guru' : item.id);
                  onClose();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                  'hover:bg-white/10 group relative overflow-hidden',
                  (item.id === 'data' && isDataSubmenu) || currentPage === item.id
                    ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
                    : 'text-slate-300'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.id === currentPage && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-2 h-2 rounded-full bg-white"
                  />
                )}
              </button>

              {/* Data submenu */}
              {item.id === 'data' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="ml-4 mt-2 space-y-1"
                >
                  {dataSubmenu.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        onNavigate(subItem.id);
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                        'hover:bg-white/5',
                        currentPage === subItem.id
                          ? 'bg-white/10 text-white'
                          : 'text-slate-400'
                      )}
                    >
                      <subItem.icon className={cn('w-4 h-4', subItem.color)} />
                      <span className="text-sm">{subItem.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">TL</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Tolandona</p>
              <p className="text-xs text-slate-400">Buton Tengah</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
