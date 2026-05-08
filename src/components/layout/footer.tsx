'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/lib/settings-context';
import { Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  const { settings } = useSettings();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-auto py-4 px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700/50"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>{settings.footerText}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in Indonesia
          </span>
        </div>
      </div>
    </motion.footer>
  );
}
