'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:scale-[0.98] active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-netflix-red text-netflix-white hover:bg-netflix-redHover hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] shadow-lg shadow-netflix-red/30',
      secondary: 'bg-netflix-card text-netflix-white hover:bg-netflix-cardHover hover:shadow-card-hover border border-netflix-gray/20',
      ghost: 'bg-transparent text-netflix-white hover:bg-netflix-gray/20',
      icon: 'bg-transparent text-netflix-white hover:bg-netflix-gray/20 p-2',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-6 py-2.5 text-base gap-2',
      lg: 'px-8 py-3 text-lg gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';