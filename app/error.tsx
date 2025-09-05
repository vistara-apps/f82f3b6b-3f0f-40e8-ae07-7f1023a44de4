'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-lg text-center max-w-md w-full"
      >
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Something went wrong!
        </h2>
        
        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
          We encountered an error while loading Right Guard. This might be a temporary issue.
        </p>
        
        <button
          onClick={reset}
          className="btn-primary flex items-center justify-center space-x-2 w-full"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        
        <p className="text-xs text-text-secondary mt-4">
          If the problem persists, please contact support.
        </p>
      </motion.div>
    </div>
  );
}
