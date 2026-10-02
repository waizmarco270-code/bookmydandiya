import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { auth } from '../lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Ticket } from 'lucide-react';

export const Navbar = ({ onBookClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasTickets, setHasTickets] = useState(false);
  const router = useRouter();
  const clickCount = useRef(0);
  const clickTimeout = useRef(null);

  const handleLogoClick = () => {
    clickCount.current += 1;
    
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    
    clickTimeout.current = setTimeout(() => {
      if (clickCount.current === 3) {
        router.push('/admin/login');
      } else if (clickCount.current >= 6) {
        router.push('/dev/login');
      } else if (clickCount.current === 1) {
        window.scrollTo(0,0);
      }
      clickCount.current = 0;
    }, 500); // 500ms window after the last tap to evaluate total taps
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Anonymous Login
    signInAnonymously(auth).catch((error) => console.log('Anonymous login failed', error));
    
    // Check if user has tickets (we just show the button if they are logged in. 
    // They wouldn't be logged in if they clear cookies, but if they are, they can go to My Tickets)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setHasTickets(true);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Experience', href: '#experience' },
    { name: 'Passes', href: '#passes' },
    { name: 'Venue', href: '#venue' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-brand-dark/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleLogoClick}>
            <img 
              src="/logo.png" 
              alt="Event Logo" 
              className="w-12 h-12 rounded-full object-cover border-2 border-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
              onError={(e) => {
                // Fallback if logo.png is not yet placed
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback placeholder if image fails to load */}
            <div className="w-10 h-10 rounded-full bg-brand-gold hidden items-center justify-center text-brand-dark font-display font-bold text-xl">
              S
            </div>
            <span className="font-display font-bold text-xl md:text-2xl text-brand-sand hidden sm:block tracking-wide">
              SARN<span className="text-brand-gold">GROUP</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-brand-sand/80 hover:text-brand-gold transition-colors font-medium text-sm uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {hasTickets && (
              <button 
                onClick={() => router.push('/my-tickets')}
                className="text-brand-gold hover:text-brand-sand text-sm uppercase tracking-wider font-bold transition-colors flex items-center gap-1"
              >
                <Ticket size={16} /> My Tickets
              </button>
            )}
            <Button size="sm" onClick={onBookClick}>BOOK PASSES</Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-brand-sand p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-brand-dark pt-24 px-6 flex flex-col gap-6 md:hidden"
          >
            <nav className="flex flex-col gap-6 items-center text-center mt-10">
              {hasTickets && (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/my-tickets');
                  }}
                  className="text-2xl font-display text-brand-gold flex items-center gap-2 transition-colors mb-4"
                >
                  <Ticket size={24} /> MY TICKETS
                </button>
              )}
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-display text-brand-sand hover:text-brand-gold transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
            <div className="mt-8 flex justify-center">
              <Button 
                size="lg" 
                className="w-full max-w-sm" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBookClick();
                }}
              >
                BOOK PASSES
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
