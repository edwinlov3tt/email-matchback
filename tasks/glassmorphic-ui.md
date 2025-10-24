# Task: Glassmorphic UI Components

**Branch**: `feature/glassmorphic-ui`
**Priority**: MEDIUM
**Can Start**: Immediately (no dependencies)

## Overview

Create the complete glassmorphic design system for the frontend. This includes base UI components with frosted glass effects, animated gradients, and responsive layouts. Uses Framer Motion for animations and lucide-react for icons (no emojis).

## Prerequisites

```bash
git checkout feature/glassmorphic-ui
cd apps/web
npm install
```

## Design Specifications

**Theme**: Glassmorphism with dark gradient backgrounds
**Colors**: Purple/pink gradients (#667eea, #764ba2, #f093fb)
**Effects**: Backdrop blur, transparent backgrounds, subtle borders
**Animations**: Smooth transitions, animated gradient blobs

## Implementation Steps

### Step 1: Create GlassCard Component

**File**: `apps/web/components/ui/GlassCard.tsx`

```typescript
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
```

### Step 2: Create GlassButton Component

**File**: `apps/web/components/ui/GlassButton.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { ButtonHTMLAttributes } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
```

### Step 3: Create GlassInput Component

**File**: `apps/web/components/ui/GlassInput.tsx`

```typescript
'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="block text-sm font-medium text-white/80">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl
            backdrop-blur-xl bg-white/10
            border border-white/20
            text-white placeholder-white/40
            focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/50
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
```

### Step 4: Create GradientBackground Component

**File**: `apps/web/components/ui/GradientBackground.tsx`

```typescript
'use client';

export function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419]" />

      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 bg-[size:50px_50px]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `
        }}
      />
    </div>
  );
}
```

### Step 5: Create StatusBadge Component

**File**: `apps/web/components/ui/StatusBadge.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';

type Status = 'pending' | 'collecting' | 'matching' | 'analyzing' | 'complete' | 'error';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'from-gray-400 to-gray-500',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/30',
  },
  collecting: {
    label: 'Collecting Data',
    color: 'from-blue-400 to-blue-500',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
  },
  matching: {
    label: 'Matching',
    color: 'from-purple-400 to-purple-500',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
  },
  analyzing: {
    label: 'Analyzing',
    color: 'from-yellow-400 to-yellow-500',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
  },
  complete: {
    label: 'Complete',
    color: 'from-green-400 to-green-500',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
  },
  error: {
    label: 'Error',
    color: 'from-red-400 to-red-500',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const isAnimated = status === 'matching' || status === 'analyzing';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        backdrop-blur-xl border text-sm font-medium
        ${config.bg}
        ${config.border}
        ${className}
      `}
    >
      <motion.span
        animate={isAnimated ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.6, 1],
        } : {}}
        transition={isAnimated ? {
          duration: 2,
          repeat: Infinity,
        } : {}}
        className={`w-2 h-2 rounded-full bg-gradient-to-br ${config.color}`}
      />
      <span className="text-white">{config.label}</span>
    </motion.div>
  );
}
```

### Step 6: Create GlassModal Component

**File**: `apps/web/components/ui/GlassModal.tsx`

```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function GlassModal({ isOpen, onClose, title, children }: GlassModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="
                relative max-w-2xl w-full max-h-[90vh] overflow-auto
                backdrop-blur-xl bg-white/10
                border border-white/20
                rounded-2xl shadow-2xl
                p-6
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="text-white">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Step 7: Export Components

**File**: `apps/web/components/ui/index.ts`

```typescript
export { GlassCard } from './GlassCard';
export { GlassButton } from './GlassButton';
export { GlassInput } from './GlassInput';
export { GlassModal } from './GlassModal';
export { GradientBackground } from './GradientBackground';
export { StatusBadge } from './StatusBadge';
```

### Step 8: Update Root Layout

**File**: `apps/web/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GradientBackground } from '@/components/ui';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Matchback Platform',
  description: 'Enterprise matchback automation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GradientBackground />
        {children}
      </body>
    </html>
  );
}
```

### Step 9: Create Component Demo Page

**File**: `apps/web/app/components-demo/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassModal,
  StatusBadge
} from '@/components/ui';

export default function ComponentsDemo() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white">Component Demo</h1>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Glass Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard>
              <h3 className="text-white font-semibold mb-2">Basic Card</h3>
              <p className="text-white/70">Standard glassmorphic card</p>
            </GlassCard>
            <GlassCard hover>
              <h3 className="text-white font-semibold mb-2">Hover Card</h3>
              <p className="text-white/70">With hover animation</p>
            </GlassCard>
            <GlassCard gradient>
              <h3 className="text-white font-semibold mb-2">Gradient Card</h3>
              <p className="text-white/70">With gradient overlay</p>
            </GlassCard>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <GlassButton variant="primary">Primary</GlassButton>
            <GlassButton variant="secondary">Secondary</GlassButton>
            <GlassButton variant="ghost">Ghost</GlassButton>
            <GlassButton size="sm">Small</GlassButton>
            <GlassButton size="lg">Large</GlassButton>
            <GlassButton disabled>Disabled</GlassButton>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Inputs</h2>
          <div className="max-w-md space-y-4">
            <GlassInput label="Email" type="email" placeholder="your@email.com" />
            <GlassInput label="Password" type="password" placeholder="••••••••" required />
            <GlassInput label="Error State" error="This field is required" />
          </div>
        </section>

        {/* Status Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Status Badges</h2>
          <div className="flex flex-wrap gap-4">
            <StatusBadge status="pending" />
            <StatusBadge status="collecting" />
            <StatusBadge status="matching" />
            <StatusBadge status="analyzing" />
            <StatusBadge status="complete" />
            <StatusBadge status="error" />
          </div>
        </section>

        {/* Modal */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Modal</h2>
          <GlassButton onClick={() => setModalOpen(true)}>
            Open Modal
          </GlassButton>
          <GlassModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
          >
            <p className="text-white/80 mb-4">
              This is a glassmorphic modal with backdrop blur and animations.
            </p>
            <div className="flex gap-4">
              <GlassButton onClick={() => setModalOpen(false)}>
                Close
              </GlassButton>
              <GlassButton variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </GlassButton>
            </div>
          </GlassModal>
        </section>
      </div>
    </div>
  );
}
```

## Testing Requirements

1. **Visual Testing**: View `/components-demo` to verify all components render correctly
2. **Responsive Testing**: Test on mobile, tablet, desktop sizes
3. **Animation Testing**: Verify all Framer Motion animations are smooth
4. **Accessibility**: Verify keyboard navigation works

## Validation Checklist

- [ ] All components compile without errors
- [ ] No emojis used (lucide-react icons only)
- [ ] Glassmorphic effects display correctly
- [ ] Animations are smooth
- [ ] Components are responsive
- [ ] TypeScript types are correct
- [ ] Demo page shows all components

## Completion Summary Requirements

Provide summary with:

```markdown
# Glassmorphic UI - COMPLETE

## Files Created (8 files, ~450 lines)
- GlassCard.tsx - 35 lines
- GlassButton.tsx - 55 lines
- GlassInput.tsx - 50 lines
- GlassModal.tsx - 75 lines
- GradientBackground.tsx - 35 lines
- StatusBadge.tsx - 90 lines
- index.ts - 10 lines
- components-demo/page.tsx - 100 lines

## Components
- 6 reusable UI components
- All use Framer Motion for animations
- All follow glassmorphic design spec
- Icons from lucide-react (no emojis)

## Features Unlocked
✓ feature/dashboard-pages can now use these components

## Demo
Visit http://localhost:3000/components-demo to see all components
```
