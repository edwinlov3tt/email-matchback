'use client';

import { motion } from 'framer-motion';
import { ComponentPropsWithoutRef } from 'react';

interface GlassButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-purple-500/30',
    secondary: 'backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20',
    ghost: 'text-white hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        rounded-xl font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
