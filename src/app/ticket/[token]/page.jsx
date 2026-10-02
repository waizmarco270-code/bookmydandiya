"use client";

import React, { useEffect, useState, useRef, use } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, Download, Share2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

export default function TicketPage({ params }) {
  const { token } = use(params);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ticketRef = useRef(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const q = query(collection(db, 'bookings'), where('secureToken', '==', token));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setError('Ticket not found or invalid token.');
          setLoading(false);
          return;
        }

        const data = snapshot.docs[0].data();
        if (data.status !== 'CONFIRMED') {
          setError('Ticket is not yet confirmed. Please wait for payment verification.');
          setLoading(false);
          return;
        }

        setBooking(data);
      } catch (err) {
        console.error(err);
        setError('Error fetching ticket data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [token]);

  const handleShare = async () => {
    if (!ticketRef.current) return;
    
    try {
      if (navigator.share) {
        const loadingToast = toast.loading("Preparing ticket to share...");
        try {
          const canvas = await html2canvas(ticketRef.current, { scale: 2, useCORS: true, allowTaint: true });
          canvas.toBlob(async (blob) => {
            const file = new File([blob], `Dandiya_Ticket_${booking.bookingRef}.jpg`, { type: 'image/jpeg' });
            
            toast.dismiss(loadingToast);
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'My Dandiya Ticket',
                text: `Here is my VIP ticket for Grand Dandiya Raas!`,
                files: [file],
              });
            } else {
              // Fallback to URL
              await navigator.share({
                title: 'My Dandiya Ticket',
                text: `Here is my VIP ticket for Grand Dandiya Raas!`,
                url: window.location.href,
              });
            }
          }, 'image/jpeg', 0.9);
        } catch (e) {
          toast.dismiss(loadingToast);
          await navigator.share({ url: window.location.href });
        }
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Ticket link copied to clipboard!");
      }
    } catch (err) {
      console.log('Error sharing', err);
    }
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    const loadingToast = toast.loading("Generating HD Ticket...");
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 4, // Ultra HD Resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1a0f0f' // Match body bg so rounded corners look good
      });
      
      const image = canvas.toDataURL("image/jpeg", 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `SarnGroup_Dandiya_Ticket_${booking?.bookingRef}.jpg`;
      link.click();
      
      toast.success("Ticket Saved Successfully in HD!", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate ticket image.", { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-gold w-12 h-12 mb-4" />
        <p className="text-brand-gold font-display text-xl">Verifying Secure Ticket...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 max-w-md">
          <p className="text-red-400 font-display text-2xl font-bold mb-2">🔴 Invalid Ticket</p>
          <p className="text-red-200/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0f0f] py-12 px-4 md:px-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-4xl w-full">
        
        {/* Ticket Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-brand-gold font-display text-2xl md:text-3xl font-bold tracking-wider">
            YOUR E-TICKET
          </h1>
          <div className="flex gap-3">
            <Button onClick={handleShare} variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark px-4 py-2 flex items-center gap-2">
              <Share2 size={18} /> <span className="hidden sm:inline">Share</span>
            </Button>
            <Button onClick={handleDownload} className="bg-brand-gold text-brand-dark hover:bg-white px-4 py-2 flex items-center gap-2">
              <Download size={18} /> <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>

        {/* The Holographic Ticket Container */}
        <div 
          ref={ticketRef}
          className="relative w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-brand-gold/30 bg-black group"
          style={{ aspectRatio: '1.5' }} // Typical physical ticket ratio
        >
          {/* Holographic Sweep Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer z-30 pointer-events-none mix-blend-overlay"></div>

          {/* Ticket Template Background */}
          <img 
            src="/images/ticket_template.jpg" 
            alt="Ticket Template" 
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          />

          {/* Dynamic Content Overlay (Transparent, blends with original template) */}
          <div className="absolute top-[31%] right-[3.5%] w-[25.5%] h-[40%] flex flex-col items-center justify-between z-10 py-[1%]">
            
            {/* Top Text: Pass Type & Price */}
            <div className="text-center w-full mt-1">
              <p className="font-display font-bold text-brand-maroon text-[8px] sm:text-[10px] md:text-xs xl:text-[15px] uppercase tracking-widest leading-none mb-1">
                {booking.selectedPass.name}
              </p>
              <p className="font-sans font-extrabold text-brand-maroon text-[9px] sm:text-[12px] md:text-sm xl:text-lg leading-none">
                ₹{booking.totalAmount}
              </p>
            </div>

            {/* QR Code (Has solid cream background to hide the placeholder text behind it) */}
            <div className="w-[65%] aspect-square flex items-center justify-center bg-[#fdf8ec] p-1.5 shadow-sm rounded-sm">
              <QRCodeSVG 
                value={booking.secureToken} 
                size={256}
                className="w-full h-full"
                level="M"
                bgColor="transparent"
                fgColor="#5A0B1A"
              />
            </div>
            
            {/* Bottom Text: Ref & Entries */}
            <div className="text-center w-full mb-1">
              <p className="font-display font-bold text-brand-maroon text-[6px] sm:text-[8px] md:text-[9px] xl:text-xs uppercase tracking-wider leading-none mb-1">
                {booking.entriesAllowed} Entries
              </p>
              <p className="text-brand-maroon/70 font-mono text-[5px] sm:text-[6px] md:text-[8px] leading-none">
                {booking.bookingRef}
              </p>
            </div>
          </div>
          
          {/* Live Status Indicator (Top Left) */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-500/30">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
            <span className="text-green-400 font-medium text-xs tracking-wider uppercase">Live: Valid</span>
          </div>

        </div>
        
        {/* Important Instructions */}
        <div className="mt-8 bg-[#2a1a1a]/50 border border-brand-gold/10 p-6 rounded-xl">
          <h3 className="text-brand-gold font-display text-lg mb-2">Important Instructions</h3>
          <ul className="list-disc list-inside text-brand-sand/70 text-sm space-y-2">
            <li>Please keep this digital ticket ready at the entry gate.</li>
            <li>Do not share this QR code with anyone else, it can only be scanned {booking.entriesAllowed} times.</li>
            <li>This ticket allows partial entry for groups. You can enter together or separately.</li>
            <li>The live indicator on the top-left proves the authenticity of this ticket. Screenshots may be rejected.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
