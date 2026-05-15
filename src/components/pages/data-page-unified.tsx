'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, Baby, HeartHandshake, Plus, Upload, Download, Trash2, Edit, Search, ChevronLeftCircle, ChevronRightCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { DataPage } from './data-pages';

interface TabItem {
  id: 'guru' | 'siswa' | 'posyandu' | 'relawan';
  label: string;
  icon: React.ElementType;
  gradient: string;
  description: string;
}

const tabs: TabItem[] = [
  { 
    id: 'guru', 
    label: 'Data Guru', 
    icon: GraduationCap, 
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Data guru dan tenaga pendidik'
  },
  { 
    id: 'siswa', 
    label: 'Data Siswa', 
    icon: Users, 
    gradient: 'from-cyan-500 to-blue-600',
    description: 'Data siswa sekolah'
  },
  { 
    id: 'posyandu', 
    label: 'Data Posyandu', 
    icon: Baby, 
    gradient: 'from-pink-500 to-rose-600',
    description: 'Data posyandu dan kesehatan'
  },
  { 
    id: 'relawan', 
    label: 'Data Relawan', 
    icon: HeartHandshake, 
    gradient: 'from-amber-500 to-orange-600',
    description: 'Data relawan dan gaji'
  },
];

export function DataPageUnified() {
  const [activeTab, setActiveTab] = useState<'guru' | 'siswa' | 'posyandu' | 'relawan'>('guru');

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentTab.gradient} flex items-center justify-center shadow-lg`}>
            <currentTab.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Data Kecamatan</h1>
            <p className="text-sm text-slate-500">{currentTab.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md`
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <DataPage type={activeTab} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
