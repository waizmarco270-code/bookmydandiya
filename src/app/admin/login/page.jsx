"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function AdminLogin() {
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
      router.push('/admin');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-3xl text-brand-dark mb-2">SARN GROUP</h1>
            <p className="text-brand-dark/60">Secure Admin Portal</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                placeholder="admin@sarngroup.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-dark hover:bg-brand-maroon text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-70 mt-4"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <p className="text-center text-xs text-brand-dark/40 mt-8">
            Restricted Access. Authorized personnel only.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
