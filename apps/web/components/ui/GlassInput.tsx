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
