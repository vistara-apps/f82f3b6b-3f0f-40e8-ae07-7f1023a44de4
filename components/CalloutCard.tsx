'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import { CalloutCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function CalloutCard({
  variant = 'default',
  title,
  description,
  children,
  className,
}: CalloutCardProps) {
  const Icon = variant === 'alert' ? AlertTriangle : Info;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'glass-card p-6',
        variant === 'alert' && 'border-red-400 border-opacity-50',
        className
      )}
    >
      <div className="flex items-start space-x-4">
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          variant === 'alert' ? 'bg-red-500 bg-opacity-20' : 'bg-blue-500 bg-opacity-20'
        )}>
          <Icon className={cn(
            'w-4 h-4',
            variant === 'alert' ? 'text-red-400' : 'text-blue-400'
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            {description}
          </p>
          {children}
        </div>
      </div>
    </motion.div>
  );
}
