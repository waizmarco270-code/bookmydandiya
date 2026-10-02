"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Calendar, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DevEventSettings() {
  const [config, setConfig] = useState({
    eventName: '',
    organizerName: '',
    tagline: '',
    eventDate: '',
    venueName: '',
    venueSub: '',
    contactNumbers: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'systemConfig', 'event');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        } else {
          setConfig({
            eventName: 'GRAND DANDIYA RAAS',
            organizerName: 'SARN GROUP PRESENTS',
            tagline: 'The Biggest Dandiya Night in Ranchi',
            eventDate: '18 OCTOBER 2026',
            venueName: 'Beside Kushwaha Bhawan',
            venueSub: 'Bundu, Ranchi, Jharkhand (Near Taw Ground)',
            contactNumbers: '9122729530, 6200986216, 7903338065',
            description: 'Join us for an unforgettable night of music, dance, and celebration.'
          });
        }
      } catch (error) {
        console.error("Error fetching event config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'systemConfig', 'event'), config);
      toast.success("Event settings saved successfully!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="text-zinc-500 font-mono animate-pulse">Fetching event configuration...</div>;

  return (
    <div className="space-y-6">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
          <Calendar className="text-red-500" /> Event Configuration
        </h1>
        <p className="text-zinc-500 mt-1 font-mono text-sm">Centralized event metadata and display properties.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-3xl">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">EVENT NAME</label>
              <input type="text" name="eventName" value={config.eventName} onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">ORGANIZER NAME</label>
              <input type="text" name="organizerName" value={config.organizerName} onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">TAGLINE</label>
              <input type="text" name="tagline" value={config.tagline} onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">EVENT DATE</label>
              <input type="text" name="eventDate" value={config.eventDate} onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">CONTACT NUMBERS (CSV)</label>
              <input type="text" name="contactNumbers" value={config.contactNumbers} onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">VENUE NAME</label>
              <input type="text" name="venueName" value={config.venueName} onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">VENUE SUBTITLE/AREA</label>
              <input type="text" name="venueSub" value={config.venueSub} onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">EVENT DESCRIPTION</label>
            <textarea name="description" value={config.description} onChange={handleChange}
              className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm h-24" />
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button onClick={handleSave} disabled={saving}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded transition-colors disabled:opacity-50 tracking-widest text-sm flex justify-center items-center gap-2">
              <Save size={18} />
              {saving ? 'SAVING CONFIGURATION...' : 'UPDATE EVENT INFRASTRUCTURE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
