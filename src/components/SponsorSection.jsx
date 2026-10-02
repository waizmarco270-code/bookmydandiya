import React from 'react';
import { motion } from 'framer-motion';
import { eventConfig } from '../data/config';

export const SponsorSection = () => {
  return (
    <section className="py-20 bg-[#0a0a0a] border-y border-brand-gold/10 overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-sm md:text-base tracking-[0.4em] text-brand-gold/60 uppercase font-bold mb-10"
        >
          POWERED BY
        </motion.h3>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center items-center group cursor-pointer"
        >
          <div className="relative">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-brand-gold/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <img 
              src="/images/unique_events_logo.png" 
              alt="Unique Events - SFX & Fireworks" 
              className="max-w-[280px] md:max-w-[400px] h-auto object-contain drop-shadow-2xl relative z-10 transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
