import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { eventConfig } from '../data/config';
import { Card } from './ui/Card';

export const ContactSection = () => {
  const contactTypes = [
    { title: 'Booking Enquiries', desc: 'Assistance with passes & payments', icon: Phone },
    { title: 'Event Support', desc: 'Queries regarding venue & timing', icon: MessageCircle },
    { title: 'General Enquiries', desc: 'Sponsorships & partnerships', icon: Mail },
  ];

  return (
    <section id="contact" className="py-20 md:py-32 bg-brand-dark text-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-maroon/20 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-brand-gold mb-4"
          >
            Need Help With Your Booking?
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
            Our team is ready to assist you. Reach out to us through any of the numbers below.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {eventConfig.contacts.map((number, index) => {
            const type = contactTypes[index % contactTypes.length];
            const Icon = type.icon;
            
            return (
              <motion.a
                href={`tel:+91${number}`}
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="block group"
              >
                <Card className="h-full bg-white/5 border-brand-gold/20 group-hover:border-brand-gold/50 transition-colors text-center cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-gold group-hover:text-brand-dark transition-colors duration-300 text-brand-gold">
                    <Icon size={32} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 text-white">{type.title}</h3>
                  <p className="text-brand-sand/60 text-sm mb-4">{type.desc}</p>
                  <p className="text-2xl font-bold text-brand-gold group-hover:scale-105 transition-transform">
                    {number}
                  </p>
                </Card>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
