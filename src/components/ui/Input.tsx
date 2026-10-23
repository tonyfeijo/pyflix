'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-netflix-lightGray mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 bg-netflix-card border rounded-lg text-netflix-white placeholder-netflix-gray',
            'focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/20 focus:outline-none',
            'transition-all duration-200',
            error && 'border-netflix-red focus:border-netflix-red',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-netflix-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';