'use client';

import { motion } from 'framer-motion';
import { ScriptButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ScriptButton({
  variant = 'primary',
  onClick,
  children,
  disabled = false,
  className,
}: ScriptButtonProps) {
  const baseClasses = 'px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    languages: 'glass-card text-text-primary hover:bg-opacity-20',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  );
}
