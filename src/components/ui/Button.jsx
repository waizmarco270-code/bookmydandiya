import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  children, 
  ...props 
}, ref) => {
  
  const variants = {
    primary: "bg-brand-gold text-brand-dark hover:bg-brand-gold-light shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] border border-brand-gold-light",
    secondary: "bg-brand-burgundy text-white hover:bg-brand-red border border-brand-red/50 shadow-lg",
    outline: "bg-transparent text-brand-gold border-2 border-brand-gold hover:bg-brand-gold/10",
    ghost: "bg-transparent text-brand-sand hover:text-brand-gold hover:bg-white/5",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base font-semibold",
    lg: "px-8 py-4 text-lg font-semibold",
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors duration-300",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";
