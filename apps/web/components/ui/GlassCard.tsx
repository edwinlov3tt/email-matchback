'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function GlassCard({ children, className = '', hover = false, gradient = false }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={`
        relative rounded-2xl p-6
        backdrop-blur-xl bg-white/10
        border border-white/20
        shadow-[0_8px_32px_rgba(31,38,135,0.15)]
        ${gradient ? 'bg-gradient-to-br from-white/20 to-white/5' : ''}
        before:absolute before:inset-0 before:rounded-2xl
        before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50
        before:pointer-events-none
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
