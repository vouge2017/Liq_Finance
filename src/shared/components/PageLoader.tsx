import React from 'react';
import { Icons } from './Icons';

/**
 * Lightweight loading fallback for lazy-loaded page components
 * Minimal UI to reduce bundle size impact
 */
export const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] py-12">
      <div className="flex flex-col items-center gap-3">
        <Icons.Loader className="animate-spin text-primary" size={32} />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
};

