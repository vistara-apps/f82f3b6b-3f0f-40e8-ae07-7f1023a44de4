'use client';

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
      <div className="glass-card p-8 rounded-lg text-center max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Something went wrong!
        </h2>
        
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          We encountered an error while loading Right Guard. This might be a temporary issue.
        </p>
        
        <button
          onClick={reset}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 w-full"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        
        <p className="text-xs text-gray-400 mt-4">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
