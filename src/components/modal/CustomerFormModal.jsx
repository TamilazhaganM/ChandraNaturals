import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { generateWhatsAppOrderUrl } from '../../utils/whatsapp';
import confetti from 'canvas-confetti';
import { X, MessageSquare, Send, CheckCircle2, ArrowLeft, ShieldCheck, MapPin, User, Phone } from 'lucide-react';

export const CustomerFormModal = () => {
  const {
    isCustomerFormOpen,
    setIsCustomerFormOpen,
    setIsCartOpen,
    cart,
    subtotal,
    clearCart
  } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Chennai',
    pincode: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');

  // Handle ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCustomerFormOpen(false);
      }
    };
    if (isCustomerFormOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCustomerFormOpen, setIsCustomerFormOpen]);

  if (!isCustomerFormOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your full name";
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }
    if (!formData.address.trim()) newErrors.address = "Please enter your delivery street address";
    if (!formData.city.trim()) newErrors.city = "Please enter your city";
    if (!formData.pincode.trim() || formData.pincode.trim().length < 6) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Generate WhatsApp URL
    const url = generateWhatsAppOrderUrl(cart, formData, subtotal);
    setGeneratedUrl(url);
    setIsSuccess(true);

    // Launch celebratory gold and green confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C9A24E', '#E8D9AE', '#4CAF50', '#1F3623']
      });
    } catch {
      // Confetti fallback
    }

    // Automatically open WhatsApp in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFinish = () => {
    setIsSuccess(false);
    setIsCustomerFormOpen(false);
    clearCart();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ink/85 backdrop-blur-md animate-fade-in"
      onClick={() => setIsCustomerFormOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-forest-deep border-2 border-gold-antique/60 shadow-2xl text-cream-warm overflow-hidden animate-fade-up max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gold-antique/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsCustomerFormOpen(false);
                setIsCartOpen(true);
              }}
              className="p-1.5 rounded-lg text-cream-warm/70 hover:text-gold-antique transition-colors cursor-pointer"
              title="Back to cart"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 id="customer-form-title" className="font-fraunces text-xl font-bold">
              {isSuccess ? "Ready to Send" : "Delivery Details"}
            </h2>
          </div>

          <button
            onClick={() => setIsCustomerFormOpen(false)}
            aria-label="Close form"
            className="p-1.5 rounded-full hover:text-gold-antique transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 font-sans">
          {isSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center mx-auto border border-[#25D366]/40">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="font-fraunces text-2xl font-bold text-cream-warm">
                  Order Formatted for WhatsApp!
                </h3>
                <p className="text-xs sm:text-sm text-cream-warm/80 max-w-sm mx-auto leading-relaxed">
                  We've prepared your consolidated order message. Click below if WhatsApp didn't open automatically.
                </p>
              </div>

              {/* Order Summary Snapshot */}
              <div className="p-4 rounded-xl bg-forest-ink/70 border border-gold-antique/30 text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between font-bold text-gold-antique">
                  <span>Total Order Value:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="text-cream-warm/75 space-y-0.5 font-sans">
                  <p>• Delivering to: <span className="font-semibold text-cream-warm">{formData.name}</span></p>
                  <p>• City: {formData.city} ({formData.pincode})</p>
                  <p>• Phone: {formData.phone}</p>
                </div>
              </div>

              {/* Primary Direct WhatsApp Link */}
              <div className="space-y-3 pt-2">
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm uppercase tracking-wider transition-colors shadow-lg font-sans"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Open in WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-2 text-xs text-cream-warm/70 hover:text-gold-antique transition-colors uppercase tracking-wider font-semibold font-sans cursor-pointer"
                >
                  Done • Back to Home
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="p-3 rounded-xl bg-forest-ink/60 border border-gold-antique/25 flex items-center justify-between text-xs">
                <span className="text-cream-warm/80">
                  Total for <strong className="text-gold-antique">{cart.length} unique items</strong>:
                </span>
                <span className="font-fraunces text-base font-bold text-gold-antique">
                  ₹{subtotal}
                </span>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm/90">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gold-antique absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs transition-colors"
                  />
                </div>
                {errors.name && <p className="text-red-400 text-[10px]">{errors.name}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm/90">
                  WhatsApp Mobile Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gold-antique absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs transition-colors"
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-[10px]">{errors.phone}</p>}
              </div>

              {/* Delivery Address */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm/90">
                  Delivery Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gold-antique absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Flat / House No., Street, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs transition-colors"
                  />
                </div>
                {errors.address && <p className="text-red-400 text-[10px]">{errors.address}</p>}
              </div>

              {/* City & Pincode */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm/90">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs transition-colors"
                  />
                  {errors.city && <p className="text-red-400 text-[10px]">{errors.city}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm/90">
                    Pincode <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 600028"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs transition-colors"
                  />
                  {errors.pincode && <p className="text-red-400 text-[10px]">{errors.pincode}</p>}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm/90">
                  Notes / Dietary Preference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please pack in extra protective wrapping"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-forest-ink" />
                  <span>Generate WhatsApp Order</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-cream-warm/70 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-antique" />
                <span>Your contact info is used strictly to process this WhatsApp order.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
