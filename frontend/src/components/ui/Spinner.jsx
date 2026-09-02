import React from 'react';
import { LoaderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className, size = 'md', ...props }) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn('animate-spin text-[#121316]', sizeClasses[size] || 'w-4 h-4', className)}
      {...props}
    />
  );
}

export function SpinnerCustom({ className }) {
  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      <Spinner />
    </div>
  );
}