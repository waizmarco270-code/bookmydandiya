import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Upload, Info, Copy, ExternalLink } from 'lucide-react';
import { eventConfig } from '../data/config';
import { Button } from './ui/Button';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
export const BookingModal = ({ isOpen, onClose, initialPass }) => {
  const [step, setStep] = useState(1);
  const [selectedPass, setSelectedPass] = useState(initialPass || eventConfig.passes[0]);
  const [primaryDetails, setPrimaryDetails] = useState({ name: '', phone: '', address: '', countryCode: '+91' });
  const [attendees, setAttendees] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING, SUBMITTED, VERIFIED
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [upiConfig, setUpiConfig] = useState(null);
  const [livePricing, setLivePricing] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Fetch payment configuration from DEV panel settings
  useEffect(() => {
    if (!isOpen) return;
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'systemConfig', 'payment');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUpiConfig(docSnap.data());
        } else {
          setUpiConfig({
            upiId: 'sargroup@upi',
            payeeName: 'SARN GROUP',
            phone: '9122729530',
            instructions: 'Please wait up to 2 hours for payment verification after submission.',
            staticQrBase64: ''
          });
        }
      } catch (error) {
        console.error("Error fetching configs:", error);
      }
      
      try {
        const priceDocRef = doc(db, 'systemConfig', 'pricing');
        const priceDocSnap = await getDoc(priceDocRef);
        if (priceDocSnap.exists()) {
          setLivePricing(priceDocSnap.data());
        }
      } catch (error) {
        console.error("Error fetching pricing config:", error);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, [isOpen]);

  // Update selected pass if initialPass changes
  useEffect(() => {
    if (initialPass) {
      setSelectedPass(initialPass);
    }
  }, [initialPass]);

  // Reset attendees when pass changes or modal opens
  useEffect(() => {
    if (isOpen) {
      // Initialize attendees array based on pass capacity
      const initialAttendees = Array(selectedPass.capacity).fill(null).map(() => ({
        name: '', age: '', gender: 'Male', type: 'Adult'
      }));
      setAttendees(initialAttendees);
    }
  }, [selectedPass, isOpen]);

  // Reset entirely when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setPrimaryDetails({ name: '', phone: '', address: '', countryCode: '+91' });
        setPaymentStatus('PENDING');
        setBookingRef('');
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const calculateTotal = () => {
    // If live pricing exists, find the selected pass's live price, otherwise use static
    let basePrice = selectedPass.price;
    let singlePrice = 299;
    let childPrice = 100;
    
    if (livePricing && livePricing.passes) {
      const activePass = livePricing.passes.find(p => p.id === selectedPass.id);
      if (activePass) basePrice = activePass.price;
      
      const singlePass = livePricing.passes.find(p => p.id === 'single');
      if (singlePass) singlePrice = singlePass.price;
      
      if (livePricing.kidsPricing) {
        childPrice = livePricing.kidsPricing.paidPrice || 100;
      }
    }

    let total = basePrice;
    
    // Add extra price for each additional person based on age
    attendees.forEach((a, idx) => {
      if (idx >= selectedPass.capacity) {
        const age = parseInt(a.age) || 0;
        
        let freeMaxAge = livePricing?.kidsPricing?.freeMaxAge || 5;
        let paidMaxAge = livePricing?.kidsPricing?.paidMaxAge || 10;
        
        if (age >= 1 && age <= freeMaxAge) {
          total += 0;
        } else if (age > freeMaxAge && age <= paidMaxAge) {
          total += childPrice;
        } else {
          total += singlePrice;
        }
      }
    });
    return total;
  };

  const handleAddPerson = () => {
    setAttendees([...attendees, { name: '', age: '', gender: 'Male', type: 'Adult' }]);
  };

  const updateAttendee = (index, field, value) => {
    const newAttendees = [...attendees];
    
    // If it's a child pass and they enter an age > 10, cap it at 10
    if (field === 'age' && selectedPass.id === 'child') {
      let ageVal = parseInt(value);
      if (ageVal > 10) {
        toast.error("Child pass is strictly for ages up to 10.");
        ageVal = 10;
      }
      newAttendees[index][field] = isNaN(ageVal) ? '' : ageVal.toString();
    } else {
      newAttendees[index][field] = value;
    }
    
    setAttendees(newAttendees);
  };

  const removeAttendee = (index) => {
    if (index >= selectedPass.capacity) {
      const newAttendees = [...attendees];
      newAttendees.splice(index, 1);
      setAttendees(newAttendees);
    }
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (!primaryDetails.name || !primaryDetails.phone || !primaryDetails.address) {
        toast.error("Please fill all primary details.");
        return;
      }
      if (primaryDetails.name.trim().length < 4) {
        toast.error("Full Name must be at least 4 characters long.");
        return;
      }
      if (primaryDetails.phone.length !== 10) {
        toast.error("Mobile Number must be exactly 10 digits.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Validation for attendees could go here
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleSubmitPayment = async () => {
    if (!utrNumber) {
      toast.error("Please enter UTR/Transaction ID");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const refId = `SDR-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingRef(refId);

      // Generate a secure ticket token
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let secureToken = 'TKT_';
      for (let i = 0; i < 16; i++) {
        secureToken += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const entriesAllowed = attendees.length;

      await addDoc(collection(db, "bookings"), {
        bookingRef: refId,
        primaryDetails,
        attendees,
        selectedPass: {
          id: selectedPass.id,
          name: selectedPass.name,
          price: selectedPass.price,
          capacity: selectedPass.capacity
        },
        totalAmount,
        utrNumber: 'VIA_WHATSAPP',
        status: 'PENDING',
        secureToken,
        entriesAllowed,
        entriesUsed: 0,
        entriesRemaining: entriesAllowed,
        uid: auth.currentUser?.uid || null,
        createdAt: serverTimestamp()
      });

      setPaymentStatus('SUBMITTED');
      setStep(6);
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = calculateTotal();
  const upiUri = upiConfig ? `upi://pay?pa=${upiConfig.upiId}&pn=${encodeURIComponent(upiConfig.payeeName)}&am=${totalAmount}&cu=INR` : '';

  const whatsappUrl = `https://wa.me/${upiConfig?.whatsappAdminNumber?.replace(/[^0-9]/g, '') || '9122729530'}?text=${encodeURIComponent(
    `Hi, I have paid ₹${totalAmount} for the Grand Dandiya Raas.\n\n` +
    `*Booking Ref:* ${bookingRef}\n` +
    `*Pass:* ${selectedPass?.name}\n` +
    `*Name:* ${primaryDetails?.name}\n` +
    `*Phone:* ${primaryDetails?.phone}\n\n` +
    `Please find my payment screenshot attached below.`
  )}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-brand-sand rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-brand-dark p-6 border-b border-brand-gold/30 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-display text-2xl text-brand-gold font-bold">Book Your Passes</h3>
              <p className="text-brand-sand/70 text-sm">Step {step > 5 ? 5 : step} of 5</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h4 className="text-3xl font-display font-bold text-brand-dark">Choose Your Experience</h4>
                  <p className="text-brand-dark/60 text-sm mt-2">Select a premium pass template to begin your journey</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {eventConfig.passes.map((pass, i) => (
                    <motion.div 
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      key={pass.id}
                      onClick={() => { setSelectedPass(pass); setStep(2); }}
                      className={`relative overflow-hidden rounded-3xl cursor-pointer shadow-xl border-4 transition-all ${
                        selectedPass.id === pass.id ? 'border-brand-maroon ring-4 ring-brand-maroon/20' : 'border-transparent hover:border-brand-maroon/30'
                      }`}
                      style={{
                        background: i === 0 ? 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)' :
                                    i === 1 ? 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' :
                                              'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)'
                      }}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 text-black">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                      </div>
                      <div className="p-6 relative z-10 text-brand-dark">
                        <div className="text-xs font-bold uppercase tracking-widest mb-3 opacity-70 bg-black/5 inline-block px-3 py-1 rounded-full">{pass.capacity} PERSON(S)</div>
                        <div className="font-display font-bold text-3xl mb-2">{pass.name}</div>
                        <div className="text-4xl font-black mb-4">₹{pass.price}</div>
                        <div className="text-sm font-medium leading-relaxed opacity-90">{pass.description}</div>
                        {pass.id === 'single' && (
                          <div className="mt-4 text-xs font-bold bg-white/40 p-3 rounded-xl inline-block border border-white/50 text-brand-dark shadow-sm">
                            💡 Want tickets for multiple people? Select this and increase the count in the next step!
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <button onClick={() => setStep(1)} className="text-brand-maroon text-sm font-bold flex items-center gap-1 hover:underline">
                  ← Back to templates
                </button>
                <div>
                  <h4 className="text-xl font-display font-bold text-brand-dark mb-4">Primary Contact Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark/80 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={primaryDetails.name}
                        onChange={(e) => setPrimaryDetails({...primaryDetails, name: e.target.value})}
                        className="w-full p-3 rounded-lg border border-brand-dark/20 bg-white focus:outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark/80 mb-1">Mobile Number</label>
                      <div className="flex border border-brand-dark/20 rounded-lg overflow-hidden bg-white focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon">
                        <select 
                          value={primaryDetails.countryCode}
                          onChange={(e) => setPrimaryDetails({...primaryDetails, countryCode: e.target.value})}
                          className="bg-gray-50 border-r border-brand-dark/20 p-3 text-brand-dark focus:outline-none"
                        >
                          <option value="+91">IN (+91)</option>
                          <option value="+1">US (+1)</option>
                          <option value="+44">UK (+44)</option>
                          <option value="+61">AU (+61)</option>
                          <option value="+971">UAE (+971)</option>
                        </select>
                        <input 
                          type="tel" 
                          value={primaryDetails.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, ''); // only allow digits
                            if (val.length <= 10) {
                              setPrimaryDetails({...primaryDetails, phone: val});
                            }
                          }}
                          className="w-full p-3 bg-transparent focus:outline-none"
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark/80 mb-1">Address</label>
                      <textarea 
                        value={primaryDetails.address}
                        onChange={(e) => setPrimaryDetails({...primaryDetails, address: e.target.value})}
                        className="w-full p-3 rounded-lg border border-brand-dark/20 bg-white focus:outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                        placeholder="Your residential address"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex justify-between items-end mb-4">
                  <h4 className="text-xl font-display font-bold text-brand-dark">Attendee Details</h4>
                  {(selectedPass.id === 'single' || selectedPass.id === 'child') && (
                    <button 
                      onClick={handleAddPerson}
                      className="text-sm font-medium text-brand-maroon hover:text-brand-burgundy underline"
                    >
                      {selectedPass.id === 'child' ? '+ Add Child' : '+ Add Person/Kid'}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {attendees.map((attendee, index) => (
                    <div key={index} className="p-4 rounded-xl border border-brand-dark/10 bg-white relative">
                      {index >= selectedPass.capacity && (
                        <button 
                          onClick={() => removeAttendee(index)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <h5 className="font-medium text-brand-dark mb-3">
                        {index < selectedPass.capacity ? `Person ${index + 1}` : `Additional Person`} 
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                          <label className="block text-xs text-brand-dark/60 mb-1">Name</label>
                          <input 
                            type="text"
                            value={attendee.name}
                            onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                            className="w-full p-2 text-sm rounded border border-brand-dark/20 focus:outline-none focus:border-brand-maroon"
                            placeholder="Name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-dark/60 mb-1">Age</label>
                          <input 
                            type="number"
                            value={attendee.age}
                            onChange={(e) => updateAttendee(index, 'age', e.target.value)}
                            max={selectedPass.id === 'child' ? "10" : "100"}
                            className="w-full p-2 text-sm rounded border border-brand-dark/20 focus:outline-none focus:border-brand-maroon"
                            placeholder={selectedPass.id === 'child' ? "Max 10" : "Age"}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-dark/60 mb-1">Gender</label>
                          <select 
                            value={attendee.gender}
                            onChange={(e) => updateAttendee(index, 'gender', e.target.value)}
                            className="w-full p-2 text-sm rounded border border-brand-dark/20 focus:outline-none focus:border-brand-maroon bg-white"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h4 className="text-xl font-display font-bold text-brand-dark mb-4">Review Order</h4>
                
                <div className="bg-white rounded-xl p-6 border border-brand-dark/10 shadow-sm">
                  <div className="flex justify-between items-start border-b border-brand-dark/10 pb-4 mb-4">
                    <div>
                      <h5 className="font-bold text-brand-dark text-lg">{selectedPass.name} PASS</h5>
                      <p className="text-sm text-brand-dark/60">{selectedPass.capacity} Person(s)</p>
                    </div>
                    <div className="font-bold text-brand-dark text-lg">₹{selectedPass.price}</div>
                  </div>

                  {attendees.length > selectedPass.capacity && (
                    <div className="border-b border-brand-dark/10 pb-4 mb-4 space-y-2">
                      <p className="text-sm font-bold text-brand-dark mb-2">Additional Members:</p>
                      {attendees.slice(selectedPass.capacity).map((person, idx) => {
                        const age = parseInt(person.age) || 0;
                        let extraPrice = eventConfig.passes.find(p => p.id === 'single')?.price || 299;
                        if (age >= 1 && age <= 5) extraPrice = 0;
                        else if (age >= 6 && age <= 10) extraPrice = 100;
                        
                        return (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span>{person.name || `Extra Person ${idx + 1}`} (Age {person.age || '?'})</span>
                            <span>{extraPrice === 0 ? 'FREE' : `₹${extraPrice}`}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-brand-dark text-xl">TOTAL AMOUNT</span>
                    <span className="font-display font-bold text-brand-maroon text-3xl">₹{totalAmount}</span>
                  </div>
                </div>

                <div className="bg-brand-maroon/5 rounded-xl p-4 border border-brand-maroon/20 flex gap-3">
                  <Info className="text-brand-maroon shrink-0" size={20} />
                  <p className="text-sm text-brand-dark/80">
                    By proceeding to payment, you confirm that all attendee details are correct. Tickets are non-refundable.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-display font-bold text-brand-dark">SECURE PAYMENT</h4>
                  <p className="text-brand-dark/60 text-sm mt-1">Scan using any supported UPI app</p>
                </div>
                
                {loadingConfig ? (
                  <div className="py-12 text-center text-brand-dark/50 animate-pulse">Loading payment details...</div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
                    {/* Left Column: QR & Actions */}
                    <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
                      <div className="bg-white p-4 rounded-3xl shadow-xl border border-brand-dark/10 mb-4 inline-block">
                        <div className="text-center mb-4">
                          <span className="text-gray-500 text-sm block">Amount to Pay</span>
                          <span className="font-display font-bold text-3xl text-brand-maroon">₹{totalAmount}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl flex items-center justify-center">
                          {upiConfig?.staticQrBase64 ? (
                            <img 
                              src={upiConfig.staticQrBase64} 
                              alt="Static QR Code" 
                              className="w-[200px] h-[200px] object-contain"
                            />
                          ) : (
                            <QRCodeSVG 
                              value={upiUri} 
                              size={200}
                              bgColor={"#ffffff"}
                              fgColor={"#2D1F1C"}
                              level={"Q"}
                              includeMargin={false}
                            />
                          )}
                        </div>
                      </div>

                    <div className="w-full space-y-4 mb-4">
                      
                      <button 
                        onClick={() => {
                          window.location.href = upiUri;
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-[#5f259f] hover:bg-[#4b1d7d] text-white font-bold py-4 px-2 rounded-xl transition-all active:scale-95 text-sm sm:text-base shadow-md"
                      >
                        Continue to Pay via UPI App
                      </button>
                      
                      <Button 
                        onClick={handleSubmitPayment}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? 'Processing...' : 'I have completed the payment'}
                      </Button>

                    </div>

                    <div className="text-center">
                        <p className="text-xs text-brand-dark/60 mb-2">Having trouble opening your UPI app? <br/> Scan the QR instead.</p>
                        <button 
                          onClick={() => {
                            if(upiConfig) {
                              navigator.clipboard.writeText(upiConfig.upiId);
                              toast.success('UPI ID copied to clipboard');
                            }
                          }}
                          className="text-xs font-medium text-brand-maroon bg-brand-maroon/10 px-3 py-1.5 rounded-full hover:bg-brand-maroon/20 transition-colors flex items-center gap-1 mx-auto"
                        >
                          <Copy size={14} /> Copy UPI ID
                        </button>
                      </div>
                    </div>
                    
                    {/* Right Column: UTR Confirmation (Conditional) */}
                    <div className="w-full md:flex-1 space-y-6">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                        <h5 className="text-sm font-bold text-brand-dark mb-2">Payment Support Info</h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium text-brand-dark">UPI ID:</span> {upiConfig?.upiId}</p>
                          <p><span className="font-medium text-brand-dark">Name:</span> {upiConfig?.payeeName}</p>
                          <p><span className="font-medium text-brand-dark">Support:</span> {upiConfig?.phone}</p>
                        </div>
                        {upiConfig?.instructions && (
                          <div className="mt-3 p-3 bg-brand-maroon/5 rounded-lg border border-brand-maroon/10">
                            <p className="text-xs text-brand-dark/80">{upiConfig.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
                )}
              </motion.div>
            )}

            {step === 6 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-brand-maroon/10 rounded-full flex items-center justify-center text-brand-maroon mb-2">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-2xl font-display font-bold text-brand-dark">Application Submitted!</h4>
                
                <div className="bg-white p-4 rounded-xl border border-brand-dark/10 w-full max-w-sm">
                  <p className="text-xs text-brand-dark/60 mb-1">Booking Reference</p>
                  <p className="font-display font-bold text-xl tracking-wider text-brand-maroon">{bookingRef}</p>
                </div>
                
                <p className="text-brand-dark/70 text-sm max-w-md">
                  To complete your booking, please send your payment screenshot to our verification team on WhatsApp.
                </p>

                <div className="w-full max-w-sm pt-4">
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Send Screenshot & Verify
                  </a>
                </div>
                
                <p className="text-xs text-brand-dark/50 mt-4 max-w-sm">
                  You can track your verification status in the "My Tickets" section later.
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {step < 5 && (
            <div className="bg-white p-4 md:px-8 border-t border-brand-dark/10 flex justify-between items-center shrink-0">
              <button 
                onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                className="px-6 py-2 text-brand-dark/70 font-medium hover:text-brand-dark transition-colors"
              >
                {step > 1 ? 'Back' : 'Cancel'}
              </button>
              
              {step < 4 && (
                <Button onClick={handleNextStep}>
                  {step === 3 ? 'Proceed to Pay' : 'Next Step'}
                </Button>
              )}
            </div>
          )}
          
          {step === 5 && (
            <div className="bg-white p-4 md:px-8 border-t border-brand-dark/10 flex justify-center shrink-0">
              <Button onClick={onClose} className="w-full sm:w-auto">
                Close & Return to Home
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
