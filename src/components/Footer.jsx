import React from 'react';
import { eventConfig } from '../data/config';

export const Footer = () => {
  return (
    <footer className="bg-brand-dark pt-16 pb-8 border-t border-brand-gold/20 relative">
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12 border-b border-brand-sand/10 pb-12">
          
          <div className="text-center md:text-left">
            <span className="text-brand-gold text-xs tracking-[0.2em] font-bold uppercase mb-2 block">
              {eventConfig.presenter}
            </span>
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              {eventConfig.name}
            </h2>
            <p className="text-brand-sand/60 italic font-display">
              {eventConfig.tagline}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 text-center md:text-left">
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Event</h4>
              <ul className="space-y-2 text-brand-sand/70 text-sm">
                <li>{eventConfig.displayDate}</li>
                <li>{eventConfig.venue.name}</li>
                <li>{eventConfig.venue.sub}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
              <ul className="space-y-2 text-brand-sand/70 text-sm">
                <li><a href="#home" className="hover:text-brand-gold transition-colors">Home</a></li>
                <li><a href="#experience" className="hover:text-brand-gold transition-colors">Experience</a></li>
                <li><a href="#passes" className="hover:text-brand-gold transition-colors">Passes</a></li>
                <li><a href="#contact" className="hover:text-brand-gold transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-sand/50">
          <p>&copy; {new Date().getFullYear()} SARN Group. All rights reserved.</p>
          <p className="italic font-display text-brand-sand/70 text-sm">"Celebrating music, culture & togetherness."</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
