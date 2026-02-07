import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const variants = {
    primary: 'bg-charcoal text-white hover:bg-gray-800 shadow-sm',
    secondary: 'bg-white text-charcoal border border-gray-200 hover:bg-gray-50 shadow-sm',
    ghost: 'text-charcoal hover:bg-gray-100',
    sage: 'bg-sage text-white hover:opacity-90 shadow-sm',
    terracotta: 'bg-terracotta text-white hover:opacity-90 shadow-sm'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2'
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Button.displayName = 'Button';