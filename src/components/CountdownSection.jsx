import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventConfig } from '../data/config';

export const CountdownSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const targetDate = new Date(eventConfig.date).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isExpired) return null;

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds }
  ];

  return (
    <section className="py-16 md:py-24 relative z-20 -mt-16 md:-mt-32 px-4">
      {/* Mystical glowing background aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-brand-gold/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-[#0f0a0a]/80 backdrop-blur-3xl border border-brand-gold/30 rounded-3xl p-8 md:p-12 shadow-[0_0_80px_rgba(212,175,55,0.15)] overflow-hidden relative">
          
          {/* Corner gold accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-brand-gold/60 rounded-tl-3xl m-2 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-brand-gold/60 rounded-tr-3xl m-2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-brand-gold/60 rounded-bl-3xl m-2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-brand-gold/60 rounded-br-3xl m-2 pointer-events-none"></div>

          {/* Faint mystical particles inside card */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>

          <div className="text-center mb-10 relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-[#FFF2CD] to-brand-gold font-bold mb-4 drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]"
            >
              THE CELEBRATION BEGINS IN
            </motion.h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 relative z-10">
            {timeBlocks.map((block, index) => (
              <motion.div 
                key={block.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
                className="flex flex-col items-center group"
              >
                {/* Container for the flipping boxes */}
                <div className="w-full aspect-square relative mb-4" style={{ perspective: '1000px' }}>
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={block.value}
                      initial={{ rotateX: -90, opacity: 0, filter: "brightness(0.5)" }}
                      animate={{ rotateX: 0, opacity: 1, filter: "brightness(1)" }}
                      exit={{ rotateX: 90, opacity: 0, filter: "brightness(0.5)" }}
                      transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                      style={{ transformOrigin: "center", transformStyle: "preserve-3d" }}
                      className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#2a1111] to-[#120505] rounded-2xl flex items-center justify-center border border-brand-maroon/50 shadow-[inset_0_2px_20px_rgba(212,175,55,0.1),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden group-hover:border-brand-gold/50 transition-colors duration-500"
                    >
                      {/* Glossy top highlight */}
                      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl z-20"></div>
                      
                      <span className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f0e6d2] to-[#a09070] drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
                        {block.value.toString().padStart(2, '0')}
                      </span>
                      
                      {/* Horizontal line for flip-clock effect (This is the axis of rotation) */}
                      <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-[#0a0404] -translate-y-1/2 z-20 shadow-[0_1px_1px_rgba(255,255,255,0.1)] border-y border-black/50"></div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <span className="text-sm md:text-base text-brand-gold/80 uppercase tracking-[0.3em] font-semibold group-hover:text-brand-gold transition-colors duration-500">
                  {block.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
