import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { eventConfig } from '../data/config';
import { Button } from './ui/Button';

export const VenueSection = () => {
  return (
    <section id="venue" className="py-20 md:py-32 bg-brand-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-brand-dark mb-4">
              The Venue
            </h2>
            <div className="w-20 h-1 bg-brand-maroon rounded-full mb-8"></div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-brand-maroon/10 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-brand-maroon/10 flex items-center justify-center shrink-0 text-brand-maroon mt-1">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-brand-dark mb-1">{eventConfig.venue.name}</h3>
                  <p className="text-brand-dark/70 text-lg mb-6">{eventConfig.venue.sub}</p>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(eventConfig.venue.mapLink, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Navigation size={18} />
                    GET DIRECTIONS
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 h-[400px] md:h-[500px] bg-gray-200 rounded-3xl overflow-hidden relative shadow-2xl border-4 border-white"
          >
            <iframe 
              src={eventConfig.venue.embedLink} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
              className="absolute inset-0"
            ></iframe>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};
