import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { eventConfig } from '../data/config';

export const Hero = ({ onBookClick }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0 bg-brand-dark">
        {/* Cinematic Background Image */}
        <div className="absolute inset-0 bg-[url('/images/hero_bg.png')] bg-cover bg-center opacity-60 z-0"></div>
        
        {/* Subtle Overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-brand-dark z-10"></div>
        <div className="absolute inset-0 premium-gradient opacity-30 mix-blend-overlay z-10"></div>
      </div>

      {/* Animated Particles/Ornaments */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-brand-gold blur-[2px]"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4"
        >
          <span className="text-brand-gold tracking-[0.3em] text-sm md:text-base uppercase font-semibold">
            {eventConfig.presenter}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
        >
          GRAND <br className="md:hidden" />
          <span className="gold-text-gradient">DANDIYA RAAS</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl md:text-2xl text-brand-sand italic font-display mb-10 max-w-2xl mx-auto"
        >
          {eventConfig.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 text-brand-sand/90 mb-12"
        >
          <div className="flex items-center gap-2">
            <span className="text-brand-gold">🗓</span>
            <span className="font-medium tracking-wide">{eventConfig.displayDate}</span>
          </div>
          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-brand-gold/50"></div>
          <div className="flex items-center gap-2">
            <span className="text-brand-gold">📍</span>
            <span className="font-medium tracking-wide">{eventConfig.venue.name}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button size="lg" onClick={onBookClick} className="w-full sm:w-auto">
            BOOK YOUR PASSES
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto"
          >
            EXPLORE EVENT
          </Button>
        </motion.div>
      </div>

      {/* Bottom Decor */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-sand to-transparent z-10 pointer-events-none"></div>
    </section>
  );
};
