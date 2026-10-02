"use client";

import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Users, Ticket, FileText, IndianRupee, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    bookings: { total: 0, confirmed: 0, pending: 0, rejected: 0 },
    attendees: { total: 0, confirmed: 0 },
    revenue: { totalExpected: 0, confirmed: 0 },
    tickets: { generated: 0, used: 0, unused: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic implementation to fetch counts.
    // For production with massive data, aggregation queries or cloud functions should maintain these stats.
    const fetchStats = async () => {
      try {
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        
        const newStats = {
          bookings: { total: 0, confirmed: 0, pending: 0, rejected: 0 },
          attendees: { total: 0, confirmed: 0 },
          revenue: { totalExpected: 0, confirmed: 0 },
          tickets: { generated: 0, used: 0, unused: 0 }
        };

        bookingsSnapshot.forEach((doc) => {
          const data = doc.data();
          newStats.bookings.total++;
          newStats.revenue.totalExpected += data.totalAmount || 0;
          
          const attendeeCount = data.attendees?.length || 0;
          newStats.attendees.total += attendeeCount;

          if (data.status === 'CONFIRMED' || data.paymentStatus === 'PAYMENT_VERIFIED') {
            newStats.bookings.confirmed++;
            newStats.revenue.confirmed += data.totalAmount || 0;
            newStats.attendees.confirmed += attendeeCount;
          } else if (data.status === 'REJECTED' || data.paymentStatus === 'PAYMENT_REJECTED') {
            newStats.bookings.rejected++;
          } else {
            newStats.bookings.pending++;
          }
        });

        // Real ticket stats based on entries
        newStats.tickets = {
          generated: newStats.bookings.confirmed,
          totalEntriesAllowed: 0,
          usedEntries: 0,
          insideNow: 0
        };

        bookingsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'CONFIRMED' || data.paymentStatus === 'PAYMENT_VERIFIED') {
            newStats.tickets.totalEntriesAllowed += (data.entriesAllowed || 0);
            newStats.tickets.usedEntries += (data.entriesUsed || 0);
          }
        });
        
        newStats.tickets.insideNow = newStats.tickets.usedEntries; // Simple mapping

        setStats(newStats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse flex flex-col gap-4">
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
      </div>
    </div>;
  }

  const StatCard = ({ title, value, subtext, icon, colorClass }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <h4 className="text-3xl font-display font-bold text-gray-900">{value}</h4>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-dark">Event Dashboard</h1>
        <p className="text-gray-500">Live metrics for Grand Dandiya Raas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.revenue.confirmed.toLocaleString()}`} 
          subtext={`Expected: ₹${stats.revenue.totalExpected.toLocaleString()}`}
          icon={<IndianRupee size={24} />} 
          colorClass="bg-green-100 text-green-700" 
        />
        <StatCard 
          title="Total Bookings" 
          value={stats.bookings.total} 
          subtext={`${stats.bookings.confirmed} Confirmed`}
          icon={<FileText size={24} />} 
          colorClass="bg-blue-100 text-blue-700" 
        />
        <StatCard 
          title="Attendees" 
          value={stats.attendees.confirmed} 
          subtext={`Expected Total: ${stats.attendees.total}`}
          icon={<Users size={24} />} 
          colorClass="bg-purple-100 text-purple-700" 
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats.bookings.pending} 
          subtext={`${stats.bookings.rejected} Rejected`}
          icon={<AlertCircle size={24} />} 
          colorClass="bg-orange-100 text-orange-700" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bookings Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-brand-dark border-b pb-2">Booking Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Confirmed</span>
              <span className="font-bold text-lg">{stats.bookings.confirmed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2"><AlertCircle size={16} className="text-orange-500"/> Pending Verification</span>
              <span className="font-bold text-lg">{stats.bookings.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2"><AlertCircle size={16} className="text-red-500"/> Rejected</span>
              <span className="font-bold text-lg">{stats.bookings.rejected}</span>
            </div>
          </div>
        </div>

        {/* Tickets Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-brand-dark border-b pb-2">Tickets (Gate Entry)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2"><Ticket size={16} className="text-blue-500"/> Generated</span>
              <span className="font-bold text-lg">{stats.tickets.generated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Used (Entered)</span>
              <span className="font-bold text-lg">{stats.tickets.used}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2"><AlertCircle size={16} className="text-gray-400"/> Unused</span>
              <span className="font-bold text-lg">{stats.tickets.unused}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
