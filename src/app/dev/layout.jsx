"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Settings, CreditCard, Users, Calendar, Flag, ShieldAlert, LogOut, Terminal } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DevLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (pathname !== '/dev/login') router.push('/dev/login');
        else setLoading(false);
      } else {
        if (pathname === '/dev/login') {
          router.push('/dev');
          return;
        }
        
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const role = userDoc.exists() ? userDoc.data().role : null;
          
          if (role === 'DEV') {
            setUser(currentUser);
            setLoading(false);
          } else {
            // Not a dev
            await signOut(auth);
            toast.error('ACCESS DENIED: DEV privileges required for this environment.');
            router.push('/dev/login');
          }
        } catch (error) {
          console.error("Auth Error:", error);
          await signOut(auth);
          router.push('/dev/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 text-green-500 flex items-center justify-center font-mono">Initializing Dev Kernel...</div>;
  }

  // Allow login page to render without the shell
  if (pathname === '/dev/login') {
    return <div className="font-sans">{children}</div>;
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navItems = [
    { name: 'System Overview', icon: <Terminal size={20} />, href: '/dev' },
    { name: 'Payment Control', icon: <CreditCard size={20} />, href: '/dev/payment' },
    { name: 'Event Config', icon: <Calendar size={20} />, href: '/dev/event' },
    { name: 'Pricing Engine', icon: <Settings size={20} />, href: '/dev/pricing' },
    { name: 'Admin Users', icon: <Users size={20} />, href: '/dev/admin-users' },
    { name: 'Feature Flags', icon: <Flag size={20} />, href: '/dev/features' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 font-sans flex flex-col md:flex-row text-zinc-300">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-zinc-900 border-r border-zinc-800 shrink-0 h-screen sticky top-0">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <ShieldAlert className="text-red-500" />
          <div>
            <h2 className="font-bold text-lg text-zinc-100">DEV CONTROL</h2>
            <p className="text-[10px] text-zinc-500 font-mono">ROOT PRIVILEGES ACTIVE</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-zinc-800 text-zinc-100 shadow-md' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-mono text-sm"
          >
            <LogOut size={18} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0 h-screen overflow-y-auto bg-zinc-950 relative selection:bg-red-500/30 selection:text-red-200">
        <header className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={20} />
            <h2 className="font-bold text-sm text-zinc-100">DEV CONTROL</h2>
          </div>
          <button onClick={handleLogout} className="text-zinc-400 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </header>
        
        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Scrollable) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-20 flex overflow-x-auto pb-safe scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] shrink-0 ${
                isActive ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`${isActive ? 'bg-zinc-800 p-1.5 rounded-lg' : 'p-1.5'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-1 font-medium text-center">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  );
}
