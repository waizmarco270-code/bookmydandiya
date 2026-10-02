"use client";

import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Search, Ticket, QrCode, Copy, Send, Activity, UserX, CheckCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TicketsAdminPage() {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, ACTIVE, EXHAUSTED

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'CONFIRMED' && data.secureToken) {
          ticketsData.push({ id: doc.id, ...data });
        }
      });
      setTickets(ticketsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = {
    total: tickets.length,
    active: tickets.filter(t => t.entriesRemaining > 0).length,
    exhausted: tickets.filter(t => t.entriesRemaining === 0).length
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.primaryDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.primaryDetails?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.secureToken?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const isActive = t.entriesRemaining > 0;
    const matchesTab = activeTab === 'ALL' || (activeTab === 'ACTIVE' && isActive) || (activeTab === 'EXHAUSTED' && !isActive);
    
    return matchesSearch && matchesTab;
  });

  const handleCopyLink = (token) => {
    const url = `${window.location.origin}/ticket/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Ticket link copied to clipboard!');
  };

  const handleSendWhatsApp = (ticket) => {
    const url = `${window.location.origin}/ticket/${ticket.secureToken}`;
    const message = `Hi ${ticket.primaryDetails?.name},\n\nYour payment for the Grand Dandiya Raas is Verified!\n\nHere is your E-Ticket link. Please show the QR code at the entry gate:\n${url}\n\nThank you!`;
    const whatsappUrl = `https://wa.me/${ticket.primaryDetails?.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="text-brand-maroon" /> Tickets Control Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage, view, and distribute confirmed event tickets.</p>
        </div>
        
        <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            All <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{stats.total}</span>
          </button>
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'ACTIVE' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Active <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">{stats.active}</span>
          </button>
          <button 
            onClick={() => setActiveTab('EXHAUSTED')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'EXHAUSTED' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Exhausted <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{stats.exhausted}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <Card className="bg-white border-l-4 border-gray-800 p-4 md:p-6 shadow-sm">
          <p className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Issued</p>
          <div className="flex justify-between items-end">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900">{stats.total}</h3>
            <Ticket className="text-gray-400 mb-1 w-5 h-5 md:w-6 md:h-6" />
          </div>
        </Card>
        
        <Card className="bg-white border-l-4 border-green-500 p-4 md:p-6 shadow-sm">
          <p className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Active / Valid</p>
          <div className="flex justify-between items-end">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900">{stats.active}</h3>
            <Activity className="text-green-500 mb-1 w-5 h-5 md:w-6 md:h-6" />
          </div>
        </Card>
        
        <Card className="bg-white border-l-4 border-red-500 p-4 md:p-6 shadow-sm col-span-2 md:col-span-1">
          <p className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Exhausted</p>
          <div className="flex justify-between items-end">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900">{stats.exhausted}</h3>
            <UserX className="text-red-500 mb-1 w-5 h-5 md:w-6 md:h-6" />
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden bg-white shadow-sm border border-gray-100">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-sm">Ticket Registry</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Name, Phone, Ref..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Booking Ref</th>
                <th className="p-4 font-semibold">Attendee Details</th>
                <th className="p-4 font-semibold">Pass Info</th>
                <th className="p-4 font-semibold text-center">Usage</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500">
                    <div className="animate-pulse">Loading tickets registry...</div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 font-mono text-sm font-bold text-gray-700">{ticket.bookingRef}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{ticket.primaryDetails?.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        {ticket.primaryDetails?.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-brand-maroon">{ticket.selectedPass?.name}</div>
                      <div className="text-xs text-gray-400">{ticket.attendees?.length || 1} Person(s)</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-sm inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
                        <span className="font-bold text-gray-900">{ticket.entriesUsed || 0}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600 font-bold">{ticket.entriesAllowed}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {ticket.entriesRemaining === 0 ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold">
                          <UserX size={12} /> Exhausted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-xs font-bold">
                          <CheckCircle size={12} /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleSendWhatsApp(ticket)}
                          title="Send to WhatsApp"
                          className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-md transition-colors"
                        >
                          <Send size={16} />
                        </button>
                        <button 
                          onClick={() => handleCopyLink(ticket.secureToken)}
                          title="Copy Link"
                          className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Copy size={16} />
                        </button>
                        <Link 
                          href={`/ticket/${ticket.secureToken}`} 
                          target="_blank"
                          title="View Ticket"
                          className="flex items-center gap-1 px-3 py-2 bg-brand-maroon/10 text-brand-maroon hover:bg-brand-maroon/20 rounded-md text-xs font-bold transition-colors"
                        >
                          <QrCode size={14} /> Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
