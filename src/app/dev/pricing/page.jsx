"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Settings, Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DevPricingConfig() {
  const [passes, setPasses] = useState([]);
  const [kidsPricing, setKidsPricing] = useState({
    freeMinAge: 1, freeMaxAge: 5,
    paidMinAge: 6, paidMaxAge: 10, paidPrice: 100
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'systemConfig', 'pricing');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPasses(docSnap.data().passes || []);
          setKidsPricing(docSnap.data().kidsPricing || kidsPricing);
        } else {
          setPasses([
            { id: 'single', name: 'SINGLE', price: 299, capacity: 1, active: true },
            { id: 'couple', name: 'COUPLE / DUO', price: 499, capacity: 2, active: true },
            { id: 'group', name: 'GROUP OF 6', price: 1499, capacity: 6, active: true }
          ]);
        }
      } catch (error) {
        console.error("Error fetching pricing config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'systemConfig', 'pricing'), { passes, kidsPricing });
      toast.success("Pricing configuration saved successfully!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-zinc-500 font-mono animate-pulse">Fetching pricing engine...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
          <Settings className="text-red-500" /> Pricing Engine
        </h1>
        <p className="text-zinc-500 mt-1 font-mono text-sm">Configure event passes and dynamic pricing rules.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center justify-between border-b border-zinc-800 pb-2">
          Pass Configurations
          <button onClick={() => setPasses([...passes, { id: Date.now().toString(), name: 'NEW PASS', price: 0, capacity: 1, active: true }])}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
            <Plus size={14}/> ADD PASS
          </button>
        </h2>
        
        <div className="space-y-4">
          {passes.map((pass, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center bg-zinc-950 p-3 rounded border border-zinc-800">
              <div className="col-span-4">
                <label className="text-[10px] text-zinc-500 block mb-1">PASS NAME</label>
                <input type="text" value={pass.name} onChange={(e) => {
                  const newPasses = [...passes]; newPasses[index].name = e.target.value; setPasses(newPasses);
                }} className="w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:border-red-500 focus:outline-none" />
              </div>
              <div className="col-span-3">
                <label className="text-[10px] text-zinc-500 block mb-1">PRICE (₹)</label>
                <input type="number" value={pass.price} onChange={(e) => {
                  const newPasses = [...passes]; newPasses[index].price = Number(e.target.value); setPasses(newPasses);
                }} className="w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:border-red-500 focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-zinc-500 block mb-1">CAPACITY</label>
                <input type="number" value={pass.capacity} onChange={(e) => {
                  const newPasses = [...passes]; newPasses[index].capacity = Number(e.target.value); setPasses(newPasses);
                }} className="w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:border-red-500 focus:outline-none" />
              </div>
              <div className="col-span-2 flex items-end h-full pb-1 pl-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pass.active} onChange={(e) => {
                    const newPasses = [...passes]; newPasses[index].active = e.target.checked; setPasses(newPasses);
                  }} className="accent-red-500" />
                  <span className="text-xs text-zinc-300">Active</span>
                </label>
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => setPasses(passes.filter((_, i) => i !== index))} className="text-zinc-600 hover:text-red-500 p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-4 border-b border-zinc-800 pb-2">Kids Pricing Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-zinc-950 rounded border border-zinc-800">
            <h3 className="text-sm font-bold text-green-500 mb-3">Free Entry Age Bracket</h3>
            <div className="flex gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">MIN AGE</label>
                <input type="number" value={kidsPricing.freeMinAge} onChange={(e) => setKidsPricing({...kidsPricing, freeMinAge: Number(e.target.value)})}
                  className="w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">MAX AGE</label>
                <input type="number" value={kidsPricing.freeMaxAge} onChange={(e) => setKidsPricing({...kidsPricing, freeMaxAge: Number(e.target.value)})}
                  className="w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm" />
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-zinc-950 rounded border border-zinc-800">
            <h3 className="text-sm font-bold text-orange-500 mb-3">Paid Kids Bracket</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">MIN AGE</label>
                <input type="number" value={kidsPricing.paidMinAge} onChange={(e) => setKidsPricing({...kidsPricing, paidMinAge: Number(e.target.value)})}
                  className="w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">MAX AGE</label>
                <input type="number" value={kidsPricing.paidMaxAge} onChange={(e) => setKidsPricing({...kidsPricing, paidMaxAge: Number(e.target.value)})}
                  className="w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">PRICE (₹)</label>
                <input type="number" value={kidsPricing.paidPrice} onChange={(e) => setKidsPricing({...kidsPricing, paidPrice: Number(e.target.value)})}
                  className="w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button onClick={handleSave} disabled={saving}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded transition-colors disabled:opacity-50 tracking-widest text-sm flex justify-center items-center gap-2">
          <Save size={18} />
          {saving ? 'UPDATING PRICING ENGINE...' : 'SAVE PRICING CONFIGURATION'}
        </button>
      </div>
    </div>
  );
}
