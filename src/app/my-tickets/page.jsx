"use client";

import React, { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Ticket, Loader2, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [adminPhone, setAdminPhone] = useState('9122729530');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const q = query(
            collection(db, 'bookings'), 
            where('uid', '==', currentUser.uid)
          );
          const snapshot = await getDocs(q);
          const userTickets = [];
          
          snapshot.forEach(doc => {
            userTickets.push({ id: doc.id, ...doc.data() });
          });
          
          // Sort by creation date client-side to avoid needing a composite index
          userTickets.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
          
          setTickets(userTickets);
        } catch (err) {
          console.error("Error fetching tickets:", err);
        }
        
        try {
          const configSnap = await getDoc(doc(db, 'systemConfig', 'payment'));
          if (configSnap.exists() && configSnap.data().whatsappAdminNumber) {
            setAdminPhone(configSnap.data().whatsappAdminNumber.replace(/[^0-9]/g, ''));
          }
        } catch (e) {
          console.error("Error fetching admin phone");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-gold w-12 h-12 mb-4" />
        <p className="text-brand-gold font-display text-xl">Finding your tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0f0f] pt-24 pb-12 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-brand-gold font-display text-3xl md:text-5xl font-bold tracking-wider mb-4">
            MY TICKETS
          </h1>
          <p className="text-brand-sand/70 text-lg">
            Your booking history and digital entry passes.
          </p>
        </div>

        {!user || tickets.length === 0 ? (
          <div className="bg-[#2a1a1a]/50 border border-brand-gold/10 p-12 rounded-3xl text-center">
            <Ticket className="w-16 h-16 text-brand-gold/30 mx-auto mb-6" />
            <h2 className="text-xl text-brand-sand mb-2 font-display">No Tickets Found</h2>
            <p className="text-brand-sand/50 mb-8 max-w-md mx-auto">
              You haven't made any bookings yet, or your previous bookings were made on a different device.
            </p>
            <Link href="/" className="inline-block bg-brand-gold text-brand-dark font-bold px-8 py-3 rounded-full hover:bg-white transition-colors">
              Book Passes Now
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {tickets.map(ticket => (
              <div 
                key={ticket.id} 
                className="bg-black border border-brand-gold/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-mono text-brand-gold/50 uppercase tracking-widest">{ticket.bookingRef}</span>
                      <h3 className="text-2xl font-display font-bold text-brand-sand mt-1">{ticket.selectedPass?.name}</h3>
                    </div>
                    {ticket.status === 'CONFIRMED' ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                        Active Ticket
                      </span>
                    ) : ticket.status === 'PENDING' ? (
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                        Pending Verification
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                        {ticket.status}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-widest">Amount</p>
                      <p className="font-bold text-brand-sand">₹{ticket.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-widest">Entries Left</p>
                      <p className="font-bold text-brand-sand">{ticket.entriesRemaining} / {ticket.entriesAllowed}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs text-white/40 uppercase tracking-widest">Date Booked</p>
                      <p className="text-brand-sand text-sm">{ticket.createdAt?.toDate().toLocaleDateString() || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-3 shrink-0 border-t md:border-t-0 md:border-l border-brand-gold/10 pt-6 md:pt-0 md:pl-6">
                  {ticket.status === 'CONFIRMED' ? (
                    <Link 
                      href={`/ticket/${ticket.secureToken}`}
                      className="flex items-center justify-center gap-2 bg-brand-gold hover:bg-white text-brand-dark px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors w-full"
                    >
                      <QrCode size={20} /> View E-Ticket
                    </Link>
                  ) : (
                    <button disabled className="bg-brand-maroon/50 text-white/30 px-8 py-3 rounded-xl font-bold uppercase tracking-wider w-full cursor-not-allowed">
                      View E-Ticket
                    </button>
                  )}
                  {ticket.status === 'PENDING' && (
                    <div className="flex flex-col gap-2 w-full">
                      <p className="text-[10px] text-orange-400/70 text-center uppercase tracking-wider">
                        Pending Verification
                      </p>
                      <a 
                        href={`https://wa.me/${adminPhone}?text=${encodeURIComponent(`Hi, I am following up on my payment of ₹${ticket.totalAmount} for the Grand Dandiya Raas.\n\n*Booking Ref:* ${ticket.bookingRef}\n*Pass:* ${ticket.selectedPass?.name}\n\nHere is my payment screenshot:`)}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/50 px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                        Send Screenshot
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
