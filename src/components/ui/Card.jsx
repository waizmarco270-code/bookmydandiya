import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export const Card = React.forwardRef(({ className, children, hover = false, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -5 } : {}}
      className={cn(
        "glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Decorative border corners could go here */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-gold/30 rounded-tl-xl m-2 opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-gold/30 rounded-tr-xl m-2 opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-gold/30 rounded-bl-xl m-2 opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-gold/30 rounded-br-xl m-2 opacity-50 pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
});

Card.displayName = "Card";
