import React from 'react';
import { motion } from 'framer-motion';
import { Mic2, Music, Camera, Utensils, Wand2 } from 'lucide-react';
import { eventConfig } from '../data/config';
import { Card } from './ui/Card';

const iconMap = {
  Mic2: Mic2,
  Music: Music,
  Camera: Camera,
  Utensils: Utensils,
  Wand2: Wand2
};

export const HighlightsSection = () => {
  return (
    <section id="experience" className="py-20 md:py-32 bg-brand-sand relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-maroon/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-brand-dark mb-4"
          >
            What Awaits You
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-brand-maroon mx-auto rounded-full mb-6"
          ></motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-brand-dark/70 max-w-2xl mx-auto font-medium"
          >
            An unforgettable evening of culture, music, and celebration.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[220px]">
          {eventConfig.highlights.map((item, index) => {
            const Icon = iconMap[item.icon];
            
            // Bento Grid Logic
            let spanClass = "md:col-span-1 md:row-span-1";
            let colorClass = "bg-white/50 backdrop-blur-sm border-brand-maroon/10 hover:border-brand-maroon/30 text-brand-dark group";
            let iconBoxClass = "bg-brand-maroon/10 text-brand-maroon group-hover:bg-brand-maroon group-hover:text-white";
            let titleClass = "group-hover:text-brand-maroon";
            let pClass = "text-brand-dark/70";

            if (index === 1) { // Live DJ
              spanClass = "md:col-span-2 md:row-span-2";
              colorClass = "bg-brand-dark text-white border-brand-gold/20 hover:border-brand-gold/50 shadow-xl shadow-brand-dark/20 group overflow-hidden relative";
              iconBoxClass = "bg-brand-gold/20 text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-dark relative z-10";
              titleClass = "text-white group-hover:text-brand-gold relative z-10";
              pClass = "text-white/70 relative z-10 text-lg max-w-md";
            } else if (index === 3) { // Food
              spanClass = "md:col-span-2 md:row-span-1";
            }
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={spanClass}
              >
                <div 
                  className={`w-full h-full rounded-3xl p-6 md:p-8 border transition-all duration-500 ${colorClass} flex flex-col justify-end`}
                >
                  {/* Decorative background for the big DJ card */}
                  {index === 1 && (
                    <>
                      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-brand-maroon/40 to-transparent opacity-50 pointer-events-none"></div>
                      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-gold/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-brand-gold/40 transition-colors duration-700"></div>
                      {/* Optional: faint image overlay */}
                      <div className="absolute inset-0 bg-[url('/images/gallery_3.png')] bg-cover bg-center mix-blend-overlay opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none z-0"></div>
                    </>
                  )}

                  <div className="mt-auto">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${iconBoxClass}`}>
                      <Icon size={28} />
                    </div>
                    <h3 className={`font-display text-2xl md:text-3xl mb-3 font-bold transition-colors duration-500 ${titleClass}`}>
                      {item.title}
                    </h3>
                    <p className={`leading-relaxed ${pClass}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
