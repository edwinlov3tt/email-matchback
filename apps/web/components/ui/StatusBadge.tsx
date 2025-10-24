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
