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
