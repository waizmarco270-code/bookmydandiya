"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LayoutDashboard, Ticket, Users, QrCode, LogOut, FileText, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (pathname !== '/admin/login') router.push('/admin/login');
        else setLoading(false);
      } else {
        if (pathname === '/admin/login') {
          router.push('/admin');
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const role = userDoc.exists() ? userDoc.data().role : null;
          
          if (role === 'ADMIN' || role === 'OWNER' || role === 'GUARD' || role === 'DEV') {
            setUserRole(role);
            setUser(currentUser);
            
            // Route restriction for GUARD
            if (role === 'GUARD') {
              if (pathname !== '/admin/scanner' && pathname !== '/admin/attendees' && pathname !== '/admin') {
                toast.error('Guards can only access Scanner and Attendees.');
                router.push('/admin/scanner');
                return;
              }
            }
            
            setLoading(false);
          } else {
            // Not authorized for Admin panel
            await signOut(auth);
            toast.error('Access Denied: You do not have STAFF privileges.');
            router.push('/admin/login');
          }
        } catch (error) {
          console.error("Auth Error:", error);
          await signOut(auth);
          router.push('/admin/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">Loading Secure Backend...</div>;
  }

  // Allow login page to render without the shell
  if (pathname === '/admin/login') {
    return <div className="font-sans">{children}</div>;
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const allNavItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin', roles: ['ADMIN', 'OWNER', 'DEV'] },
    { name: 'Bookings', icon: <FileText size={20} />, href: '/admin/bookings', roles: ['ADMIN', 'OWNER', 'DEV'] },
    { name: 'Payments', icon: <IndianRupee size={20} />, href: '/admin/payments', roles: ['ADMIN', 'OWNER', 'DEV'] },
    { name: 'Tickets', icon: <Ticket size={20} />, href: '/admin/tickets', roles: ['ADMIN', 'OWNER', 'DEV'] },
    { name: 'Attendees', icon: <Users size={20} />, href: '/admin/attendees', roles: ['ADMIN', 'OWNER', 'DEV', 'GUARD'] },
    { name: 'Scanner', icon: <QrCode size={20} />, href: '/admin/scanner', roles: ['ADMIN', 'OWNER', 'DEV', 'GUARD'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-dark text-white shrink-0 shadow-xl z-10 h-screen sticky top-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-display font-bold text-xl text-brand-gold">SARN GROUP</h2>
          <p className="text-xs text-white/50 tracking-wider mt-1">ADMIN PORTAL</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-brand-maroon text-white shadow-md font-medium' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-sm truncate opacity-80">
              {user?.email}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-brand-dark text-white p-4 sticky top-0 z-20 shadow-md flex justify-between items-center">
          <div>
            <h2 className="font-display font-bold text-lg text-brand-gold">SARN GROUP</h2>
          </div>
          <button onClick={handleLogout} className="p-2 text-white/70 hover:text-white">
            <LogOut size={20} />
          </button>
        </header>
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 flex justify-around p-2 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] ${
                isActive ? 'text-brand-maroon' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className={`${isActive ? 'bg-brand-maroon/10 p-1.5 rounded-xl' : 'p-1.5'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  );
}
