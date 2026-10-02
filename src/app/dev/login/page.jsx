"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Terminal, ShieldAlert } from 'lucide-react';

export default function DevLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Further role verification (checking DEV claim) should happen here or in layout
      router.push('/dev');
    } catch (err) {
      console.error(err);
      setError('ACCESS DENIED. INVALID CREDENTIALS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-mono">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500"></div>
        
        <div className="relative z-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
              <ShieldAlert className="text-red-500" size={32} />
            </div>
            <h1 className="font-bold text-2xl text-zinc-100 mb-1 tracking-wider">DEV SYSTEM</h1>
            <p className="text-zinc-500 text-sm">ROOT AUTHENTICATION REQUIRED</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded text-sm mb-6 border border-red-500/20 flex items-start gap-2">
              <Terminal size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">DEV IDENTIFIER</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm"
                placeholder="dev@sarngroup.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">SECURE PASSPHRASE</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded transition-colors disabled:opacity-50 mt-4 tracking-widest text-sm"
            >
              {loading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
