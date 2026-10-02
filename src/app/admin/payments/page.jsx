"use client";

import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { IndianRupee, Search, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle, Download, FileText } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function PaymentsAdminPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, CONFIRMED, REJECTED
  
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    totalRejected: 0,
    countPending: 0
  });

  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsList = [];
      let collected = 0;
      let pending = 0;
      let rejected = 0;
      let countP = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        paymentsList.push({ id: doc.id, ...data });

        if (data.paymentStatus === 'PAYMENT_VERIFIED' || data.status === 'CONFIRMED') {
          collected += (data.totalAmount || 0);
        } else if (data.paymentStatus === 'PAYMENT_REJECTED' || data.status === 'REJECTED') {
          rejected += (data.totalAmount || 0);
        } else {
          pending += (data.totalAmount || 0);
          countP++;
        }
      });

      setPayments(paymentsList);
      setStats({ totalCollected: collected, totalPending: pending, totalRejected: rejected, countPending: countP });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleQuickVerify = async (bookingId, action) => {
    const isApprove = action === 'APPROVE';
    if (!window.confirm(`Are you sure you want to ${isApprove ? 'VERIFY this payment and generate a ticket' : 'REJECT this payment'}?`)) {
      return;
    }
    
    setVerifyingId(bookingId);
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const updates = {
        paymentStatus: action === 'APPROVE' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
        status: action === 'APPROVE' ? 'CONFIRMED' : 'REJECTED'
      };
      await updateDoc(bookingRef, updates);
      toast.success(action === 'APPROVE' ? "Payment Verified! Ticket Generated." : "Payment Rejected.");
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to process payment.");
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.utrNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.primaryDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    let matchesTab = true;
    if (activeTab === 'PENDING') {
      matchesTab = p.status === 'PENDING' || p.paymentStatus === 'PAYMENT_PENDING' || p.paymentStatus === 'PAYMENT_SUBMITTED';
    } else if (activeTab === 'CONFIRMED') {
      matchesTab = p.status === 'CONFIRMED' || p.paymentStatus === 'PAYMENT_VERIFIED';
    } else if (activeTab === 'REJECTED') {
      matchesTab = p.status === 'REJECTED' || p.paymentStatus === 'PAYMENT_REJECTED';
    }

    return matchesSearch && matchesTab;
  });

  const exportLedgerToCSV = () => {
    if (filteredPayments.length === 0) return;
    const headers = ['Date, Booking Ref, UTR Number, Name, Phone, Amount, Status'];
    const rows = filteredPayments.map(p => {
      const date = p.createdAt ? p.createdAt.toDate().toLocaleDateString() : 'N/A';
      return `${date}, ${p.bookingRef}, "${p.utrNumber || 'N/A'}", "${p.primaryDetails?.name || ''}", ${p.primaryDetails?.phone || ''}, ${p.totalAmount}, ${activeTab}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dandiya_Payment_Ledger_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <IndianRupee className="text-brand-maroon" /> Payment Verification
          </h1>
          <p className="text-gray-500 text-sm mt-1">Verify UTRs and manage revenue flow.</p>
        </div>
        
        <Button onClick={exportLedgerToCSV} variant="outline" className="flex items-center gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 h-[40px]">
          <Download size={16} /> Export Ledger
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-l-4 border-orange-500 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Pending Verification</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-display font-bold text-gray-900">₹{stats.totalPending.toLocaleString()}</h3>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-white bg-orange-500 px-2 py-1 rounded-full">{stats.countPending} Apps</span>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-l-4 border-green-500 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Collected Revenue</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-display font-bold text-gray-900">₹{stats.totalCollected.toLocaleString()}</h3>
            <TrendingUp className="text-green-500 mb-1" size={24} />
          </div>
        </Card>
        
        <Card className="bg-white border-l-4 border-red-500 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Rejected Payments</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-display font-bold text-gray-900">₹{stats.totalRejected.toLocaleString()}</h3>
            <AlertCircle className="text-red-500 mb-1" size={24} />
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden bg-white shadow-sm border border-gray-100 mt-6">
        
        {/* Tabs & Search */}
        <div className="border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-gray-50/50">
          <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'PENDING' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Clock size={16} /> New Applications
              {stats.countPending > 0 && (
                <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded-full">{stats.countPending}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('CONFIRMED')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'CONFIRMED' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <CheckCircle size={16} /> Confirmed
            </button>
            <button 
              onClick={() => setActiveTab('REJECTED')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'REJECTED' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <XCircle size={16} /> Rejected
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by UTR, Name or Ref..." 
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
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Booking Details</th>
                <th className="p-4 font-semibold">UTR Number</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold text-right">Action / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <div className="animate-pulse">Loading payment records...</div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                    <FileText className="text-gray-300 mb-2 mt-4" size={32} />
                    <p>No applications found in this category.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {payment.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-xs font-bold text-gray-500 mb-1">{payment.bookingRef}</div>
                      <div className="font-medium text-gray-900">{payment.primaryDetails?.name}</div>
                      <div className="text-xs text-gray-500">{payment.primaryDetails?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm font-bold text-brand-maroon bg-brand-maroon/5 px-3 py-1.5 rounded-lg inline-block border border-brand-maroon/10">
                        {payment.utrNumber || 'NOT PROVIDED'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900 text-lg">₹{payment.totalAmount}</div>
                      <div className="text-xs text-gray-500">{payment.selectedPass?.name}</div>
                    </td>
                    <td className="p-4 text-right">
                      {activeTab === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleQuickVerify(payment.id, 'APPROVE')}
                            disabled={verifyingId === payment.id}
                            className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={16} /> Verify
                          </button>
                          <button 
                            onClick={() => handleQuickVerify(payment.id, 'REJECT')}
                            disabled={verifyingId === payment.id}
                            className="flex items-center gap-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : activeTab === 'CONFIRMED' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <CheckCircle size={14} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                          <AlertCircle size={14} /> Rejected
                        </span>
                      )}
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
