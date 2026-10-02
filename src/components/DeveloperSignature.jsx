import React, { useState } from 'react';
import { Code2, ExternalLink, Camera, Mail, MessageCircle, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { Card } from './ui/Card';

export function DeveloperSignature() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 text-sm text-brand-dark/50 hover:text-brand-gold transition-colors font-sans mt-4 md:mt-0"
      >
        <span>Engineered with <span className="text-red-500 animate-pulse">⚡</span> by</span>
        <span className="font-bold underline decoration-brand-dark/20 group-hover:decoration-brand-gold underline-offset-4 transition-all">
          Waiz Marco
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
          <div 
            className="absolute inset-0" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#1a1a1a] shadow-[0_0_50px_rgba(212,175,55,0.15)] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Top decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-70"></div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10 bg-black/50 rounded-full p-1"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Avatar */}
                <div className="relative shrink-0 group">
                  <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-xl group-hover:bg-brand-gold/40 transition-all duration-500"></div>
                  <img 
                    src="https://res.cloudinary.com/dnbbmvbcr/image/upload/v1790972906/my_og_dp_f8g8sm.png" 
                    alt="Waiz Marco" 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#1a1a1a] object-cover relative z-10 shadow-2xl"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#0a0a0a] z-20"></div>
                </div>

                {/* Info */}
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                    Waiz Marco <ShieldCheck className="text-blue-400" size={20} />
                  </h3>
                  <p className="text-brand-gold text-sm font-mono mt-1 tracking-wider">FULL-STACK ARCHITECT</p>
                  
                  <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                    I build high-performance, enterprise-grade web applications and booking engines. 
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a 
                  href="https://wa.me/919608597904?text=Hi%20Waiz,%20I%20saw%20your%20amazing%20work%20on%20the%20Dandiya%20Booking%20Website.%20I%20would%20like%20to%20discuss%20a%20project." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] py-3 px-4 rounded-xl text-sm font-bold transition-all hover:scale-105"
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
                
                <a 
                  href="https://instagram.com/waizmarco" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 py-3 px-4 rounded-xl text-sm font-bold transition-all hover:scale-105"
                >
                  <Camera size={18} /> Instagram
                </a>

                <a 
                  href="mailto:waizmarco270@gmail.com" 
                  className="flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 py-3 px-4 rounded-xl text-sm font-bold transition-all hover:scale-105"
                >
                  <Mail size={18} /> Email
                </a>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-zinc-600 bg-zinc-900/50 py-2 px-4 rounded-full border border-zinc-800">
                <Code2 size={14} />
                <span>Verified Creator of Dandiya Booking Engine v2.0</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
