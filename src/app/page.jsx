"use client";

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { CountdownSection } from '../components/CountdownSection';
import { HighlightsSection } from '../components/HighlightsSection';
import { GallerySection } from '../components/GallerySection';
import { PassesSection } from '../components/PassesSection';
import { BookingModal } from '../components/BookingModal';
import { VenueSection } from '../components/VenueSection';
import { ContactSection } from '../components/ContactSection';
import { SponsorSection } from '../components/SponsorSection';
import { Footer } from '../components/Footer';

export default function Home() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPassForBooking, setSelectedPassForBooking] = useState(null);

  const handleBookClick = () => {
    setSelectedPassForBooking(null);
    setIsBookingModalOpen(true);
  };

  const handleBookSpecificPass = (pass) => {
    setSelectedPassForBooking(pass);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="bg-brand-sand min-h-screen text-brand-dark selection:bg-brand-gold selection:text-brand-dark font-sans">
      <Navbar onBookClick={handleBookClick} />
      
      <main>
        <Hero onBookClick={handleBookClick} />
        <CountdownSection />
        <HighlightsSection />
        <GallerySection />
        <PassesSection onBookPass={handleBookSpecificPass} />
        <VenueSection />
        <SponsorSection />
        <ContactSection />
      </main>

      <Footer />

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        initialPass={selectedPassForBooking}
      />
    </div>
  );
}
