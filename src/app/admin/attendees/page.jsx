"use client";

import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Users, Search, UserCheck, UserX, UserMinus, Download } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function AttendeesAdminPage() {
  const [bookings, setBookings] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, INSIDE, PENDING
  
  const [stats, setStats] = useState({
    totalExpected: 0,
    insideNow: 0,
    pending: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attendeesList = [];
      let expected = 0;
      let inside = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'CONFIRMED' || data.paymentStatus === 'PAYMENT_VERIFIED') {
          
          const allowed = data.entriesAllowed || 1;
          const used = data.entriesUsed || 0;
          
          expected += allowed;
          inside += used;

          // Add primary booker
          attendeesList.push({
            id: `${doc.id}_primary`,
            bookingId: doc.id,
            bookingRef: data.bookingRef,
            name: data.primaryDetails?.name || 'Unknown',
            phone: data.primaryDetails?.phone || 'N/A',
            passType: data.selectedPass?.name,
            role: 'Primary Booker',
            entriesUsed: used,
            entriesAllowed: allowed
          });

          // Add additional attendees if they have names attached
          if (data.attendees && data.attendees.length > 1) {
            data.attendees.slice(1).forEach((att, idx) => {
              attendeesList.push({
                id: `${doc.id}_${idx}`,
                bookingId: doc.id,
                bookingRef: data.bookingRef,
                name: att.name || `Guest ${idx + 1}`,
                phone: att.phone || 'N/A',
                passType: data.selectedPass?.name,
                role: 'Guest',
                entriesUsed: used,
                entriesAllowed: allowed
              });
            });
          }
        }
      });
      
      setAttendees(attendeesList);
      setStats({
        totalExpected: expected,
        insideNow: inside,
        pending: expected - inside
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredAttendees = attendees.filter(a => {
    // 1. Search Filter
    const matchesSearch = 
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone?.includes(searchTerm);
    
    // 2. Tab Filter
    let matchesTab = true;
    if (activeTab === 'INSIDE') {
      matchesTab = a.entriesUsed > 0;
    } else if (activeTab === 'PENDING') {
      matchesTab = a.entriesUsed === 0;
    }

    return matchesSearch && matchesTab;
  });

  const exportToCSV = () => {
    if (filteredAttendees.length === 0) return;
    const headers = ['Booking Ref, Name, Phone, Role, Pass Type, Group Entry Status'];
    const rows = filteredAttendees.map(a => {
      let statusText = 'Not Entered';
      if (a.entriesUsed >= a.entriesAllowed) statusText = 'Fully Entered';
      else if (a.entriesUsed > 0) statusText = `Partially Entered (${a.entriesUsed}/${a.entriesAllowed})`;
      
      return `${a.bookingRef}, "${a.name}", ${a.phone}, ${a.role}, "${a.passType}", "${statusText}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dandiya_Attendees_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (used, allowed) => {
    if (used >= allowed) {
      return (
        <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1.5 rounded-full text-xs font-bold w-max">
          <UserCheck size={14} /> {allowed > 1 ? 'All Entered' : 'Entered'}
        </span>
      );
    } else if (used > 0) {
      return (
        <span className="flex items-center gap-1 text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full text-xs font-bold w-max">
          <UserMinus size={14} /> Partial ({used}/{allowed})
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-bold w-max">
          <UserX size={14} /> Not Entered
        </span>
      );
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-brand-maroon" /> Real-time Entry Tracking
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor who has arrived at the venue.</p>
        </div>
        
        <Button onClick={exportToCSV} className="bg-brand-gold text-brand-dark hover:bg-yellow-500 font-bold px-4 py-2 flex items-center gap-2">
          <Download size={18} /> Export List
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <Card className="bg-white border-l-4 border-blue-500 p-4 md:p-6 shadow-sm">
          <p className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Expected</p>
          <div className="flex items-end gap-2 md:gap-3">
            <h3 className="text-2xl md:text-4xl font-display font-bold text-gray-900">{stats.totalExpected}</h3>
            <p className="text-[10px] md:text-sm text-gray-400 mb-1">People</p>
          </div>
        </Card>

        <Card className="bg-white border-l-4 border-green-500 p-4 md:p-6 shadow-sm">
          <p className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Inside Venue</p>
          <div className="flex items-end gap-2 md:gap-3">
            <h3 className="text-2xl md:text-4xl font-display font-bold text-green-600">{stats.insideNow}</h3>
            <p className="text-[10px] md:text-sm text-gray-400 mb-1">Entered</p>
          </div>
        </Card>
        
        <Card className="bg-white border-l-4 border-orange-500 p-4 md:p-6 shadow-sm col-span-2 md:col-span-1">
          <p className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Yet to Arrive</p>
          <div className="flex items-end gap-2 md:gap-3">
            <h3 className="text-2xl md:text-4xl font-display font-bold text-orange-500">{stats.pending}</h3>
            <p className="text-[10px] md:text-sm text-gray-400 mb-1">Pending</p>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden bg-white shadow-sm border border-gray-100 mt-6">
        {/* Tabs & Search Bar */}
        <div className="border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-gray-50/50">
          <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Attendees
            </button>
            <button 
              onClick={() => setActiveTab('INSIDE')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'INSIDE' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Inside Venue
            </button>
            <button 
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'PENDING' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Yet to Arrive
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search name, phone, ref..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon bg-white text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Attendee Name</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Pass Type</th>
                <th className="p-4 font-semibold">Booking Ref</th>
                <th className="p-4 font-semibold text-right">Entry Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <div className="animate-pulse">Loading live attendees data...</div>
                  </td>
                </tr>
              ) : filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    No attendees found in this category.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map(att => (
                  <tr key={att.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{att.name}</div>
                      <div className={`text-xs mt-0.5 ${att.role === 'Primary Booker' ? 'text-brand-maroon font-semibold' : 'text-gray-500'}`}>
                        {att.role}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium">{att.phone}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold uppercase">
                        {att.passType}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-500">{att.bookingRef}</td>
                    <td className="p-4 flex justify-end">
                      {getStatusBadge(att.entriesUsed, att.entriesAllowed)}
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
