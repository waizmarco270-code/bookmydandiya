import React from 'react';
import { motion } from 'framer-motion';
import { eventConfig } from '../data/config';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const PassesSection = ({ onBookPass }) => {
  return (
    <section id="passes" className="py-20 md:py-32 bg-brand-dark relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4"
          >
            Choose Your Experience
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"
          ></motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-brand-sand/80 max-w-2xl mx-auto"
          >
            Secure your passes for the most awaited event of the year.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          {eventConfig.passes.map((pass, index) => (
            <motion.div
              key={pass.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`h-full ${pass.highlight ? 'md:-translate-y-4' : ''}`}
            >
              <Card 
                className={`h-full flex flex-col justify-between ${
                  pass.highlight 
                    ? 'border-brand-gold shadow-[0_0_30px_rgba(212,175,55,0.15)] premium-gradient' 
                    : 'border-brand-sand/20 bg-white/5 backdrop-blur-md'
                }`}
              >
                {pass.highlight && (
                  <div className="absolute top-0 right-0 bg-brand-gold text-brand-dark text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className={`font-display text-2xl font-bold mb-2 ${pass.highlight ? 'text-brand-gold' : 'text-white'}`}>
                    {pass.name}
                  </h3>
                  <p className="text-brand-sand/70 text-sm uppercase tracking-widest mb-6">
                    {pass.description}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-medium text-white">₹</span>
                    <span className="text-5xl font-display font-bold text-white tracking-tight">{pass.price}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button 
                    className="w-full" 
                    variant={pass.highlight ? 'primary' : 'outline'}
                    onClick={() => onBookPass(pass)}
                  >
                    BOOK THIS PASS
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto bg-brand-burgundy/20 border border-brand-red/30 rounded-2xl p-6 md:p-8 text-center"
        >
          <h4 className="font-display text-2xl text-brand-gold mb-4">Kids Pricing</h4>
          <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-12">
            <div className="flex flex-col">
              <span className="text-brand-sand/80 text-sm uppercase tracking-wide">Ages 1 - 5</span>
              <span className="text-3xl font-bold text-white">FREE</span>
            </div>
            <div className="hidden sm:block w-px bg-brand-sand/20"></div>
            <div className="flex flex-col">
              <span className="text-brand-sand/80 text-sm uppercase tracking-wide">Ages 6 - 10</span>
              <span className="text-3xl font-bold text-white">₹100</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
