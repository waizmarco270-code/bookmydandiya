"use client";

import React, { useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Flag, AlertTriangle, ShieldAlert, Trash2, Shield, Fingerprint } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import toast from 'react-hot-toast';

export default function DevFeaturesPage() {
  const [step, setStep] = useState(0); // 0: Initial, 1: First Warning, 2: Second Warning, 3: Password Prompt
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteData = async () => {
    if (password !== 'waizdevreset') {
      toast.error('INCORRECT DESTRUCT SEQUENCE!');
      return;
    }

    setIsDeleting(true);
    toast.loading('Initiating Global Data Wipe...', { id: 'wipe' });

    try {
      // Fetch all bookings
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      let count = 0;
      
      // Delete them one by one (Since this is client side, batch deletion is limited to 500. A loop is safer for a full wipe)
      const deletePromises = [];
      bookingsSnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, 'bookings', document.id)));
        count++;
      });

      await Promise.all(deletePromises);
      
      toast.success(`WIPE COMPLETE: ${count} booking records annihilated.`, { id: 'wipe' });
      setStep(0);
      setPassword('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to wipe data.', { id: 'wipe' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
          <Flag className="text-red-500" /> Feature Flags & System Control
        </h1>
        <p className="text-zinc-500 mt-1 font-mono text-sm">Toggle beta features and execute root-level commands.</p>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-8 mt-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600"></div>
        
        <div className="flex items-start gap-4">
          <div className="p-4 bg-red-500/10 rounded-full shrink-0">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-red-500 font-mono flex items-center gap-2">
              DANGER ZONE: GLOBAL DATA WIPE
            </h2>
            <p className="text-zinc-400 text-sm mt-2 font-mono">
              Executing this command will irreversibly annihilate all `bookings`, `tickets`, and `revenue` data from the database. 
              This is used exclusively before client handover to clear mock/test data.
            </p>

            <div className="mt-8 bg-zinc-950 border border-zinc-800 rounded-lg p-6">
              {step === 0 && (
                <div className="text-center">
                  <ShieldAlert size={48} className="mx-auto text-zinc-600 mb-4" />
                  <h3 className="text-zinc-300 font-bold mb-4">RESTRICTED COMMAND</h3>
                  <button 
                    onClick={() => setStep(1)}
                    className="bg-zinc-800 hover:bg-red-900/40 text-red-400 hover:text-red-300 font-mono font-bold px-6 py-3 rounded transition-colors border border-red-500/20"
                  >
                    INITIATE DATA WIPE SEQUENCE
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                  <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
                  <h3 className="text-yellow-500 font-bold mb-2">STEP 1: ARE YOU ABSOLUTELY SURE?</h3>
                  <p className="text-zinc-400 text-sm mb-6">This action cannot be undone. All user bookings will be permanently lost.</p>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setStep(0)} className="px-4 py-2 text-zinc-500 hover:text-zinc-300 font-mono text-sm">CANCEL</button>
                    <button onClick={() => setStep(2)} className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 font-mono font-bold px-6 py-2 rounded transition-colors">
                      YES, PROCEED TO STEP 2
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                  <Shield size={48} className="mx-auto text-orange-500 mb-4" />
                  <h3 className="text-orange-500 font-bold mb-2">STEP 2: CONFIRM ROOT INTENT</h3>
                  <p className="text-zinc-400 text-sm mb-6">You are about to execute a destructive database operation. Acknowledge the risk.</p>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setStep(0)} className="px-4 py-2 text-zinc-500 hover:text-zinc-300 font-mono text-sm">ABORT</button>
                    <button onClick={() => setStep(3)} className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 font-mono font-bold px-6 py-2 rounded transition-colors">
                      I ACKNOWLEDGE THE RISK
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center animate-in fade-in zoom-in duration-300 max-w-sm mx-auto">
                  <Fingerprint size={48} className="mx-auto text-red-500 mb-4" />
                  <h3 className="text-red-500 font-bold mb-2">FINAL STEP: AUTHORIZATION</h3>
                  <p className="text-zinc-400 text-sm mb-4">Enter the Root Dev Override Password to execute.</p>
                  
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter destruct password..."
                    className="w-full bg-black border border-red-500/30 rounded p-3 text-red-500 font-mono text-center mb-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 tracking-widest"
                  />
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleDeleteData}
                      disabled={isDeleting || !password}
                      className="bg-red-600 hover:bg-red-500 text-white font-mono font-bold px-6 py-3 rounded transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                    >
                      <Trash2 size={18} />
                      {isDeleting ? 'ANNIHILATING...' : 'EXECUTE WIPE'}
                    </button>
                    <button onClick={() => { setStep(0); setPassword(''); }} className="px-4 py-2 text-zinc-500 hover:text-zinc-300 font-mono text-sm">
                      ABORT PROTOCOL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
