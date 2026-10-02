"use client";

import React, { useEffect, useState } from 'react';
import { db, firebaseConfig } from '../../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { Users, Shield, ShieldAlert, User, Trash2, CheckCircle2, UserPlus, X, KeyRound } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import toast from 'react-hot-toast';

export default function DevAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create User State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'GUARD' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = [];
      snapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) {
      toast.error('Email and password are required.');
      return;
    }
    
    setCreating(true);
    try {
      // Create a secondary app instance to avoid signing out the current DEV
      const secondaryAppName = 'SecondaryAuthApp_' + Date.now();
      const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password);
      const newUid = userCredential.user.uid;
      
      // Add the user to Firestore
      await setDoc(doc(db, 'users', newUid), {
        email: newUser.email,
        role: newUser.role,
        provider: 'Firebase',
        createdAt: new Date().toISOString()
      });
      
      // Sign out and delete the secondary app instance
      await signOut(secondaryAuth);
      
      toast.success(`${newUser.role} account created successfully!`);
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', role: 'GUARD' });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handlePasswordReset = async (email) => {
    if (!email) return;
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success(`Password reset link sent to ${email}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reset link');
    }
  };

  const roleColors = {
    DEV: 'text-red-500 bg-red-500/10 border-red-500/20',
    ADMIN: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    GUARD: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    USER: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="mb-8 border-b border-zinc-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <Users className="text-red-500" /> Identity Access Management (IAM)
          </h1>
          <p className="text-zinc-500 mt-1 font-mono text-sm">Manage staff roles, permissions, and security guards.</p>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-mono font-bold px-4 py-2 rounded transition-colors text-sm"
        >
          <UserPlus size={16} /> ADD NEW STAFF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-red-500">ROOT DEVS</p>
            <ShieldAlert size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{users.filter(u => u.role === 'DEV').length}</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-yellow-500">ADMINS</p>
            <Shield size={16} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{users.filter(u => u.role === 'ADMIN').length}</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-blue-500">GUARDS</p>
            <CheckCircle2 size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{users.filter(u => u.role === 'GUARD').length}</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-zinc-500">USERS</p>
            <User size={16} className="text-zinc-500" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{users.filter(u => u.role === 'USER' || !u.role).length}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50">
                <th className="p-4 text-xs font-bold font-mono text-zinc-500 tracking-wider">USER INFO</th>
                <th className="p-4 text-xs font-bold font-mono text-zinc-500 tracking-wider">UID</th>
                <th className="p-4 text-xs font-bold font-mono text-zinc-500 tracking-wider">ACCESS LEVEL</th>
                <th className="p-4 text-xs font-bold font-mono text-zinc-500 tracking-wider">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-zinc-500 font-mono animate-pulse">
                    Querying IAM Database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-zinc-500 font-mono">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-zinc-100">{user.email || 'N/A'}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-1">Provider: {user.provider || 'Firebase'}</div>
                    </td>
                    <td className="p-4 font-mono text-xs text-zinc-600">
                      {user.id}
                    </td>
                    <td className="p-4">
                      <select 
                        value={user.role || 'USER'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`bg-zinc-950 border text-xs font-bold font-mono px-3 py-2 rounded outline-none transition-colors ${roleColors[user.role || 'USER']}`}
                      >
                        <option value="USER" className="text-zinc-500 bg-zinc-900">Level 0: USER</option>
                        <option value="GUARD" className="text-blue-500 bg-zinc-900">Level 1: GUARD</option>
                        <option value="ADMIN" className="text-yellow-500 bg-zinc-900">Level 2: ADMIN</option>
                        <option value="DEV" className="text-red-500 bg-zinc-900">Level 3: DEV</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handlePasswordReset(user.email)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                        title="Send Password Reset Email"
                      >
                        <KeyRound size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mt-6">
        <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2"><ShieldAlert size={16} /> Access Control Rules</h4>
        <ul className="text-zinc-400 text-xs font-mono space-y-1 list-disc pl-4">
          <li><strong>GUARDS:</strong> Directed to `/admin` but only allowed to view `Scanner` and `Attendees` navigation tabs.</li>
          <li><strong>ADMINS:</strong> Full access to `/admin` dashboard including Bookings, Payments, and Stats. No access to `/dev`.</li>
          <li><strong>DEVS:</strong> Root access to both `/dev` architecture and `/admin` panel.</li>
        </ul>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900">
              <h3 className="font-bold font-mono text-zinc-100 flex items-center gap-2">
                <UserPlus size={18} className="text-red-500" /> PROVISION NEW IDENTITY
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 mb-1">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-zinc-100 font-mono text-sm focus:border-red-500 focus:outline-none"
                  placeholder="e.g. guard1@sarn.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 mb-1">TEMPORARY PASSWORD</label>
                <input 
                  type="text" 
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-zinc-100 font-mono text-sm focus:border-red-500 focus:outline-none"
                  placeholder="e.g. guard123"
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 mb-1">ASSIGNED ROLE</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-zinc-100 font-mono text-sm focus:border-red-500 focus:outline-none"
                >
                  <option value="GUARD">GUARD (Scanner Access)</option>
                  <option value="ADMIN">ADMIN (Full Panel)</option>
                  <option value="DEV">DEV (Root Access)</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-100 font-mono text-sm"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="bg-red-500 hover:bg-red-600 text-white font-mono font-bold px-6 py-2 rounded transition-colors text-sm disabled:opacity-50"
                >
                  {creating ? 'PROVISIONING...' : 'CREATE ACCOUNT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
