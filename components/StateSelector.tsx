'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin } from 'lucide-react';
import { StateSelectorProps } from '@/lib/types';
import { US_STATES } from '@/lib/types';
import { cn } from '@/lib/utils';

export function StateSelector({
  variant = 'dropdown',
  selectedState,
  onStateChange,
  className,
}: StateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStateSelect = (state: string) => {
    onStateChange(state);
    setIsOpen(false);
  };

  if (variant === 'modal') {
    // Modal implementation would go here
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="glass-card w-full px-4 py-3 rounded-lg flex items-center justify-between text-text-primary hover:bg-opacity-20 transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{selectedState}</span>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg shadow-card max-h-60 overflow-y-auto z-50"
          >
            {US_STATES.map((state) => (
              <button
                key={state}
                onClick={() => handleStateSelect(state)}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm hover:bg-white hover:bg-opacity-10 transition-colors duration-200',
                  state === selectedState && 'bg-white bg-opacity-10 text-accent'
                )}
              >
                {state}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
