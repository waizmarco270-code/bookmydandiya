"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CreditCard, Save, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function DevPaymentControl() {
  const [config, setConfig] = useState({
    upiId: '',
    payeeName: '',
    phone: '',
    whatsappAdminNumber: '9122729530',
    instructions: 'Please wait up to 2 hours for payment verification after submission.',
    staticQrBase64: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewAmount, setPreviewAmount] = useState(499);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'systemConfig', 'payment');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        } else {
          // Default config if not exists
          setConfig({
            upiId: 'example@upi',
            payeeName: 'SARN GROUP',
            phone: '9122729530',
            whatsappAdminNumber: '9122729530',
            instructions: 'Please wait up to 2 hours for payment verification after submission.'
          });
        }
      } catch (error) {
        console.error("Error fetching payment config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 500KB to save Firestore space)
      if (file.size > 500 * 1024) {
        toast.error("Image is too large! Please upload a QR code under 500KB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, staticQrBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'systemConfig', 'payment'), config);
      toast.success("Payment settings saved successfully!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-zinc-500 font-mono animate-pulse">Fetching payment infrastructure...</div>;

  const upiUri = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.payeeName)}&am=${previewAmount}&cu=INR`;

  return (
    <div className="space-y-6">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
          <CreditCard className="text-red-500" /> Payment Control
        </h1>
        <p className="text-zinc-500 mt-1 font-mono text-sm">Configure dynamic UPI endpoints and instructions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
              Payment Gateway Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">UPI ID (DESTINATION)</label>
                <input 
                  type="text" 
                  value={config.upiId}
                  onChange={(e) => setConfig({...config, upiId: e.target.value})}
                  className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm"
                  placeholder="e.g. sargroup@sbi"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">PAYEE / DISPLAY NAME</label>
                <input 
                  type="text" 
                  value={config.payeeName}
                  onChange={(e) => setConfig({...config, payeeName: e.target.value})}
                  className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm"
                  placeholder="e.g. SARN GROUP"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">PAYMENT SUPPORT PHONE</label>
                  <input 
                    type="text" 
                    value={config.phone}
                    onChange={(e) => setConfig({...config, phone: e.target.value})}
                    className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm"
                    placeholder="e.g. 9122729530"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">WHATSAPP ADMIN (VERIFICATION)</label>
                  <input 
                    type="text" 
                    value={config.whatsappAdminNumber} 
                    onChange={(e) => setConfig({...config, whatsappAdminNumber: e.target.value})}
                    className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm"
                    placeholder="e.g. 919876543210"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Users will send payment screenshots to this WhatsApp number.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">PAYMENT INSTRUCTIONS</label>
                <textarea 
                  value={config.instructions}
                  onChange={(e) => setConfig({...config, instructions: e.target.value})}
                  className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm h-24"
                  placeholder="Instructions displayed to user..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 tracking-wider">STATIC QR UPLOAD (FALLBACK)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20 cursor-pointer"
                  />
                  {config.staticQrBase64 && (
                    <div className="w-12 h-12 shrink-0 rounded bg-white p-1 border border-zinc-700">
                      <img src={config.staticQrBase64} alt="QR Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {config.staticQrBase64 && (
                    <button 
                      onClick={() => setConfig({ ...config, staticQrBase64: '' })}
                      className="text-xs text-red-500 hover:text-red-400 underline whitespace-nowrap"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Image is converted to Base64 and stored directly in database (Max 500KB).</p>
              </div>

              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 mt-4 tracking-widest text-sm flex justify-center items-center gap-2"
              >
                <Save size={18} />
                {saving ? 'UPDATING SYSTEM...' : 'SAVE PAYMENT SETTINGS'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Side */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
              <QrCode size={18} className="text-zinc-500" /> Dynamic QR Preview
            </h2>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wider">TEST AMOUNT (₹)</label>
              <div className="flex gap-2">
                {[299, 499, 1499].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setPreviewAmount(amt)}
                    className={`flex-1 py-2 rounded text-sm font-mono transition-colors ${
                      previewAmount === amt ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg flex flex-col items-center justify-center border-4 border-zinc-950 shadow-inner">
              <QRCodeSVG 
                value={upiUri} 
                size={180}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"Q"}
              />
              <div className="mt-4 text-center">
                <p className="font-bold text-zinc-900 text-xl font-sans">₹{previewAmount}</p>
                <p className="text-xs text-zinc-500 font-mono mt-1 break-all">{config.upiId || 'No UPI ID'}</p>
              </div>
            </div>
            
            <div className="mt-4 bg-zinc-950 p-3 rounded border border-zinc-800">
              <p className="text-[10px] text-zinc-500 font-mono break-all leading-tight">
                <strong>URI PREVIEW:</strong><br/>
                {upiUri}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
