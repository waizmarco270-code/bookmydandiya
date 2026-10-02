import React from 'react';
import { motion } from 'framer-motion';

export const GallerySection = () => {
  const images = [
    { id: 1, src: '/images/gallery_1.png', title: 'Traditional Vibes', span: 'md:col-span-2 md:row-span-2' },
    { id: 2, src: '/images/gallery_2.png', title: 'Garba Circle', span: 'md:col-span-1 md:row-span-1' },
    { id: 3, src: '/images/gallery_3.png', title: 'DJ & Lights', span: 'md:col-span-1 md:row-span-1' },
  ];

  return (
    <section id="gallery" className="py-24 bg-brand-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-sand to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
          >
            A GLIMPSE OF <span className="gold-text-gradient">MAGIC</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-brand-sand/80 max-w-2xl mx-auto"
          >
            Experience the vibrant colors, energetic beats, and traditional essence of our past Dandiya nights.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[250px]">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className={`relative group rounded-2xl overflow-hidden cursor-pointer ${img.span}`}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500 z-10"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 translate-y-4 group-hover:translate-y-0">
                <h3 className="text-brand-gold font-display text-xl font-bold">{img.title}</h3>
              </div>

              <img 
                src={img.src} 
                alt={img.title} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Bottom Decor */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-sand to-transparent z-10 pointer-events-none"></div>
    </section>
  );
};
