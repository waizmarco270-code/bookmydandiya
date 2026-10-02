"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Search, Filter, Eye, CheckCircle, XCircle, ArrowLeft, Image as ImageIcon, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function BookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [passFilter, setPassFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  
  // Detail view state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = [];
      snapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() });
      });
      setBookings(bookingsData);
      setLoading(false);
      
      // Update selected booking if it's currently open
      if (selectedBooking) {
        const updated = bookingsData.find(b => b.id === selectedBooking.id);
        if (updated) setSelectedBooking(updated);
      }
    });

    return () => unsubscribe();
  }, [selectedBooking?.id]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.primaryDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.primaryDetails?.phone?.includes(searchTerm);
      
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter || b.paymentStatus === statusFilter;
    const matchesPass = passFilter === 'ALL' || b.selectedPass?.name?.toUpperCase().includes(passFilter);
    
    return matchesSearch && matchesStatus && matchesPass;
  }).sort((a, b) => {
    if (sortBy === 'AMOUNT_DESC') {
      return (b.totalAmount || 0) - (a.totalAmount || 0);
    }
    if (sortBy === 'AMOUNT_ASC') {
      return (a.totalAmount || 0) - (b.totalAmount || 0);
    }
    return 0; // NEWEST is default
  });

  const exportBookingsToCSV = () => {
    if (filteredBookings.length === 0) return;
    const headers = ['Date, Booking Ref, Name, Phone, Pass Type, Amount, Status, UTR Number'];
    const rows = filteredBookings.map(b => {
      const date = b.createdAt ? b.createdAt.toDate().toLocaleDateString() : 'N/A';
      return `${date}, ${b.bookingRef}, "${b.primaryDetails?.name || ''}", ${b.primaryDetails?.phone || ''}, "${b.selectedPass?.name || ''}", ${b.totalAmount}, ${b.status}, ${b.utrNumber || 'N/A'}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dandiya_Bookings_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerifyPayment = async (status) => {
    if (!selectedBooking) return;
    setIsVerifying(true);
    try {
      const bookingRef = doc(db, 'bookings', selectedBooking.id);
      const updates = {
        paymentStatus: status === 'VERIFY' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
        status: status === 'VERIFY' ? 'CONFIRMED' : 'REJECTED'
      };
      
      await updateDoc(bookingRef, updates);
      toast.success("Payment status updated!");
      // Optionally trigger ticket generation cloud function here later
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment status.");
    } finally {
      setIsVerifying(false);
    }
  };

  const StatusBadge = ({ status }) => {
    let color = 'bg-gray-100 text-gray-700';
    if (status === 'CONFIRMED' || status === 'PAYMENT_VERIFIED') color = 'bg-green-100 text-green-700';
    if (status === 'PENDING' || status === 'PAYMENT_PENDING' || status === 'PAYMENT_SUBMITTED') color = 'bg-orange-100 text-orange-700';
    if (status === 'REJECTED' || status === 'PAYMENT_REJECTED') color = 'bg-red-100 text-red-700';
    
    return <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${color}`}>{status}</span>;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;
  }

  // BOOKING DETAIL VIEW (STEP 8: Verification)
  if (selectedBooking) {
    return (
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => setSelectedBooking(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-dark mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Bookings</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-dark">{selectedBooking.bookingRef}</h2>
              <p className="text-gray-500 text-sm mt-1">
                Created on {selectedBooking.createdAt?.toDate ? selectedBooking.createdAt.toDate().toLocaleString() : 'Just now'}
              </p>
            </div>
            <StatusBadge status={selectedBooking.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left Col */}
            <div className="p-6 border-r border-gray-100">
              <h3 className="font-bold text-brand-dark mb-4 border-b pb-2">Customer Details</h3>
              <div className="space-y-3 mb-8">
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="font-medium text-gray-800">{selectedBooking.primaryDetails?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-medium text-gray-800">{selectedBooking.primaryDetails?.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="font-medium text-gray-800">{selectedBooking.primaryDetails?.address}</p>
                </div>
              </div>

              <h3 className="font-bold text-brand-dark mb-4 border-b pb-2">Pass & Attendees</h3>
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-brand-dark">{selectedBooking.selectedPass?.name} PASS</span>
                  <span className="font-bold text-brand-maroon">₹{selectedBooking.selectedPass?.price}</span>
                </div>
                <p className="text-xs text-gray-500">Base Capacity: {selectedBooking.selectedPass?.capacity}</p>
              </div>
              
              <div className="space-y-3">
                {selectedBooking.attendees?.map((a, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-medium text-gray-800">{a.name || 'Unnamed'}</span>
                      <span className="text-xs text-gray-500 ml-2">({a.age}y, {a.gender})</span>
                    </div>
                    <span className="text-xs font-medium text-brand-maroon bg-brand-maroon/10 px-2 py-1 rounded">
                      {a.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col */}
            <div className="p-6 bg-gray-50/50">
              <h3 className="font-bold text-brand-dark mb-4 border-b pb-2">Payment Verification</h3>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Total Amount</span>
                  <span className="font-display font-bold text-2xl text-brand-dark">₹{selectedBooking.totalAmount}</span>
                </div>
                
                <div>
                  <span className="text-gray-500 text-sm block mb-1">UTR / Transaction ID</span>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-sm break-all font-bold text-gray-800">
                    {selectedBooking.utrNumber || 'Not provided'}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-sm block mb-2">Payment Screenshot</span>
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
                    <div className="text-center">
                      <ImageIcon className="mx-auto mb-2 opacity-50" size={24} />
                      <span className="text-xs">No screenshot uploaded</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.status === 'PENDING' && (
                <div className="space-y-3">
                  <button 
                    onClick={() => handleVerifyPayment('VERIFY')}
                    disabled={isVerifying}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={20} />
                    {isVerifying ? 'Processing...' : 'Verify & Confirm'}
                  </button>
                  <button 
                    onClick={() => handleVerifyPayment('REJECT')}
                    disabled={isVerifying}
                    className="w-full flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle size={20} />
                    Reject Payment
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    Verifying will confirm the booking and generate ticket tokens.
                  </p>
                </div>
              )}
              
              {selectedBooking.status === 'CONFIRMED' && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-green-700 text-sm flex items-start gap-3">
                  <CheckCircle className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-bold">Payment Verified</p>
                    <p className="opacity-90">This booking is confirmed. Tickets have been generated for the attendees.</p>
                  </div>
                </div>
              )}
              
              {selectedBooking.status === 'REJECTED' && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-sm flex items-start gap-3">
                  <XCircle className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-bold">Payment Rejected</p>
                    <p className="opacity-90">This booking was rejected. Customer must initiate a new booking.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW (STEP 7)
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-dark">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and verify event bookings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, Name, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon text-sm"
            />
          </div>
          
          <Button onClick={exportBookingsToCSV} variant="outline" className="flex items-center gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 h-[38px]">
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Filters:</span>
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-maroon text-gray-700 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Verification</option>
          <option value="CONFIRMED">Verified / Confirmed</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select 
          value={passFilter}
          onChange={(e) => setPassFilter(e.target.value)}
          className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-maroon text-gray-700 cursor-pointer"
        >
          <option value="ALL">All Passes</option>
          <option value="SINGLE">Single</option>
          <option value="COUPLE">Couple</option>
          <option value="GROUP">Group</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-maroon text-gray-700 cursor-pointer"
          >
            <option value="NEWEST">Date (Newest)</option>
            <option value="AMOUNT_DESC">Amount (High-Low)</option>
            <option value="AMOUNT_ASC">Amount (Low-High)</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-500 font-medium mb-4">
        Showing {filteredBookings.length} bookings

      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-medium">Booking ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium hidden md:table-cell">Pass Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No bookings found</td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 font-mono text-sm font-medium text-brand-dark">
                      {booking.bookingRef}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900 text-sm">{booking.primaryDetails?.name}</p>
                      <p className="text-xs text-gray-500">{booking.primaryDetails?.phone}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm font-medium">{booking.selectedPass?.name}</p>
                      <p className="text-xs text-gray-500">{booking.attendees?.length || 0} People</p>
                    </td>
                    <td className="p-4 font-medium text-gray-900 text-sm">
                      ₹{booking.totalAmount}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 text-gray-400 hover:text-brand-maroon hover:bg-brand-maroon/10 rounded-lg transition-colors inline-flex items-center"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
