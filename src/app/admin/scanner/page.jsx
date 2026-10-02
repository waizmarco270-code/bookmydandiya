"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, doc, runTransaction } from 'firebase/firestore';
import { CheckCircle2, XCircle, AlertTriangle, Minus, Plus, RefreshCcw, Camera } from 'lucide-react';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const [scanStatus, setScanStatus] = useState('IDLE'); // IDLE, VERIFYING, VALID, INVALID, USED
  const [ticketData, setTicketData] = useState(null);
  const [entriesToAdmit, setEntriesToAdmit] = useState(1);
  const [processingEntry, setProcessingEntry] = useState(false);
  const [flashColor, setFlashColor] = useState('transparent');
  const [cameraError, setCameraError] = useState('');
  
  const scannerRef = useRef(null);

  // Play audio feedbacks
  const playBeep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playBuzz = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  useEffect(() => {
    let html5QrCode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        const devices = await Html5Qrcode.getCameras();
        
        if (devices && devices.length) {
          // Prefer back camera
          const cameraId = devices.length > 1 ? devices[1].id : devices[0].id;
          
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              if (scanStatus === 'IDLE' || scanStatus === 'INVALID' || scanStatus === 'USED') {
                handleScan(decodedText);
                // Pause scanner to process
                html5QrCode.pause();
              }
            },
            (errorMessage) => {
              // Ignore standard read failures
            }
          );
        } else {
          setCameraError("No cameras found on device.");
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setCameraError("Camera permission denied or unavailable.");
      }
    };

    if (scanStatus === 'IDLE' && !scannerRef.current) {
      startScanner();
      scannerRef.current = true;
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
        });
      }
      scannerRef.current = false;
    };
  }, [scanStatus]);

  const resumeScanner = () => {
    setScanStatus('IDLE');
    setScanResult(null);
    setTicketData(null);
    setEntriesToAdmit(1);
    setFlashColor('transparent');
    
    // The useEffect will handle restarting if needed, 
    // but typically we can just let it re-mount or we should keep the scanner running and use pause/resume.
    // For simplicity, forcing a fast reload of state allows the effect to handle it.
  };

  const handleScan = async (token) => {
    setScanStatus('VERIFYING');
    setScanResult(token);

    try {
      const q = query(collection(db, 'bookings'), where('secureToken', '==', token));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        triggerError('Invalid or unknown QR code.');
        return;
      }

      const docSnapshot = snapshot.docs[0];
      const data = docSnapshot.data();

      if (data.status !== 'CONFIRMED' && data.paymentStatus !== 'PAYMENT_VERIFIED') {
        triggerError('Payment not verified for this ticket.');
        return;
      }

      if (data.status === 'CANCELLED') {
        triggerError('This ticket has been cancelled.');
        return;
      }

      const remaining = data.entriesAllowed - (data.entriesUsed || 0);

      if (remaining <= 0) {
        setScanStatus('USED');
        setTicketData({ ...data, id: docSnapshot.id, remaining: 0 });
        setFlashColor('rgba(239, 68, 68, 0.4)'); // Red flash
        playBuzz();
        return;
      }

      // Valid Ticket!
      setTicketData({ ...data, id: docSnapshot.id, remaining });
      setEntriesToAdmit(Math.min(1, remaining));
      setScanStatus('VALID');
      setFlashColor('rgba(34, 197, 94, 0.4)'); // Green flash
      playBeep();

    } catch (err) {
      console.error(err);
      triggerError('Network or Server error.');
    }
  };

  const triggerError = (msg) => {
    setScanStatus('INVALID');
    setTicketData({ error: msg });
    setFlashColor('rgba(239, 68, 68, 0.4)');
    playBuzz();
  };

  const handleConfirmEntry = async () => {
    if (!ticketData || !ticketData.id) return;
    setProcessingEntry(true);

    try {
      const docRef = doc(db, 'bookings', ticketData.id);
      
      await runTransaction(db, async (transaction) => {
        const ticketDoc = await transaction.get(docRef);
        if (!ticketDoc.exists()) throw "Document does not exist!";
        
        const currentData = ticketDoc.data();
        const currentUsed = currentData.entriesUsed || 0;
        const allowed = currentData.entriesAllowed || 1;
        
        const newUsed = currentUsed + entriesToAdmit;
        
        if (newUsed > allowed) {
          throw "Cannot admit more than allowed entries.";
        }
        
        transaction.update(docRef, { 
          entriesUsed: newUsed,
          entriesRemaining: allowed - newUsed,
          lastScannedAt: new Date().toISOString()
        });
      });

      // Show massive success
      setScanStatus('IDLE');
      setFlashColor('rgba(34, 197, 94, 0.8)'); // Bright green flash
      playBeep();
      setTimeout(playBeep, 150); // Double beep for success
      
      // Auto reset after 1s
      setTimeout(() => {
        resumeScanner();
      }, 1500);

    } catch (err) {
      console.error("Transaction failed: ", err);
      alert("Failed to confirm entry! Please scan again. Error: " + err);
    } finally {
      setProcessingEntry(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-black text-white font-sans flex flex-col transition-colors duration-300"
      style={{ backgroundColor: flashColor === 'transparent' ? '#000' : flashColor }}
    >
      {/* Header */}
      <div className="bg-[#111] p-4 border-b border-[#333] flex justify-between items-center z-10">
        <h1 className="text-brand-gold font-display text-xl font-bold">SCANNER MODE</h1>
        {scanStatus !== 'IDLE' && (
          <button 
            onClick={resumeScanner}
            className="flex items-center gap-2 text-white/70 hover:text-white"
          >
            <RefreshCcw size={20} />
            <span className="text-sm">Scan Next</span>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col relative">
        
        {/* Scanner Viewport (Only visible when IDLE) */}
        <div className={`flex-1 flex flex-col items-center justify-center ${scanStatus !== 'IDLE' ? 'hidden' : ''}`}>
          {cameraError ? (
            <div className="text-center p-6 bg-red-900/30 border border-red-500/50 rounded-xl m-4">
              <Camera className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-400">{cameraError}</p>
              <p className="text-sm text-white/50 mt-2">Please ensure you are on HTTPS and have granted camera permissions.</p>
            </div>
          ) : (
            <>
              <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden bg-black border-2 border-[#333] rounded-3xl shadow-2xl"></div>
              <p className="mt-8 text-white/50 text-sm tracking-widest uppercase">Point at QR Code to scan</p>
            </>
          )}
        </div>

        {/* Verifying State */}
        {scanStatus === 'VERIFYING' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-brand-gold font-bold text-xl tracking-wider animate-pulse">VERIFYING TICKET...</p>
          </div>
        )}

        {/* Invalid Ticket View */}
        {scanStatus === 'INVALID' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <XCircle size={80} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            <h2 className="text-3xl font-bold text-red-500 mb-2">INVALID TICKET</h2>
            <p className="text-xl text-white/70 mb-12">{ticketData?.error}</p>
            
            <button 
              onClick={resumeScanner}
              className="w-full max-w-sm bg-[#222] border border-[#444] text-white py-4 rounded-xl text-lg font-bold"
            >
              SCAN ANOTHER
            </button>
          </div>
        )}

        {/* Already Used View */}
        {scanStatus === 'USED' && ticketData && !ticketData.error && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle size={80} className="text-orange-500 mb-6 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
            <h2 className="text-3xl font-bold text-orange-500 mb-2">ENTRY COMPLETED</h2>
            <p className="text-lg text-white/70 mb-8">This ticket has already exhausted all entries.</p>
            
            <div className="bg-[#111] border border-[#333] rounded-xl p-4 w-full max-w-sm mb-8 text-left">
              <p className="text-white/50 text-sm">Booking Ref</p>
              <p className="font-mono text-lg mb-4">{ticketData.bookingRef}</p>
              <p className="text-white/50 text-sm">Pass Type</p>
              <p className="font-bold text-xl">{ticketData.selectedPass?.name}</p>
            </div>

            <button 
              onClick={resumeScanner}
              className="w-full max-w-sm bg-[#222] border border-[#444] text-white py-4 rounded-xl text-lg font-bold"
            >
              SCAN ANOTHER
            </button>
          </div>
        )}

        {/* Valid Ticket View - Entry Confirmation */}
        {scanStatus === 'VALID' && ticketData && (
          <div className="flex-1 flex flex-col p-4 md:p-8 max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
              <h2 className="text-3xl font-bold text-green-500 tracking-wider">VALID TICKET</h2>
            </div>

            <div className="bg-[#111] border border-[#333] rounded-2xl p-6 mb-6 shadow-2xl">
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#333]">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Pass Type</p>
                  <p className="font-bold text-lg text-brand-gold leading-tight">{ticketData.selectedPass?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Value</p>
                  <p className="font-bold text-lg">₹{ticketData.totalAmount}</p>
                </div>
              </div>

              <div className="mb-4 pb-4 border-b border-[#333]">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Booker Name</p>
                <p className="font-bold text-xl">{ticketData.primaryDetails?.name}</p>
                <p className="text-sm text-white/50 font-mono mt-1">{ticketData.bookingRef}</p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Entries</p>
                  <p className="font-mono text-sm">
                    <span className="text-white/50">{ticketData.entriesAllowed} Allowed</span><br/>
                    <span className="text-red-400">{ticketData.entriesUsed || 0} Used</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-500 uppercase tracking-widest mb-1">Remaining</p>
                  <p className="font-bold text-4xl text-green-400">{ticketData.remaining}</p>
                </div>
              </div>
            </div>

            {/* Entry Stepper */}
            <div className="bg-[#111] border border-[#333] rounded-2xl p-4 mb-8 flex flex-col items-center">
              <p className="text-sm text-white/50 uppercase tracking-widest mb-4">Admit People Now</p>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setEntriesToAdmit(Math.max(1, entriesToAdmit - 1))}
                  className="w-14 h-14 rounded-full bg-[#222] hover:bg-[#333] flex items-center justify-center text-white text-2xl active:scale-95 transition-all"
                >
                  <Minus />
                </button>
                <span className="text-5xl font-bold font-mono w-16 text-center">{entriesToAdmit}</span>
                <button 
                  onClick={() => setEntriesToAdmit(Math.min(ticketData.remaining, entriesToAdmit + 1))}
                  className="w-14 h-14 rounded-full bg-[#222] hover:bg-[#333] flex items-center justify-center text-white text-2xl active:scale-95 transition-all"
                >
                  <Plus />
                </button>
              </div>
            </div>

            {/* Confirm Button */}
            <button 
              onClick={handleConfirmEntry}
              disabled={processingEntry || entriesToAdmit <= 0}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-5 rounded-2xl text-xl font-bold tracking-widest shadow-[0_0_20px_rgba(22,163,74,0.4)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {processingEntry ? 'RECORDING...' : `ADMIT ${entriesToAdmit}`}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
