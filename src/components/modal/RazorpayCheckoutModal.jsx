import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import confetti from 'canvas-confetti';
import {
  X, CreditCard, ArrowLeft, ShieldCheck, MapPin, User, Phone,
  CheckCircle2, Package, Truck, ArrowRight, Sparkles
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Replace 'rzp_test_XXXXXXXXXX' with your actual Razorpay Key ID
// Test key works for demo; swap for rzp_live_XXXXX before going live
// ─────────────────────────────────────────────────────────────────────────────
const RAZORPAY_KEY_ID = 'rzp_test_1DP5mmOlF5G5ag';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const RazorpayCheckoutModal = () => {
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
    email: '',
    address: '',
    city: 'Chennai',
    pincode: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCustomerFormOpen(false);
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
    if (!formData.name.trim()) newErrors.name = 'Please enter your full name';
    if (!formData.phone.trim() || formData.phone.trim().length < 10)
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    if (!formData.address.trim()) newErrors.address = 'Please enter your delivery address';
    if (!formData.city.trim()) newErrors.city = 'Please enter your city';
    if (!formData.pincode.trim() || formData.pincode.trim().length < 6)
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsProcessing(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Unable to load payment gateway. Please check your internet connection.');
      setIsProcessing(false);
      return;
    }

    // Build order description
    const itemsList = cart
      .map(item => `${item.product.name} x${item.quantity}`)
      .join(', ');

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: subtotal * 100, // Amount in paise (INR)
      currency: 'INR',
      name: 'Chandra Naturals',
      description: `Order: ${itemsList.substring(0, 200)}`,
      image: '/favicon.svg',
      prefill: {
        name: formData.name,
        email: formData.email || undefined,
        contact: `+91${formData.phone.replace(/\D/g, '').slice(-10)}`
      },
      notes: {
        address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        special_instructions: formData.notes || 'None',
        items: itemsList.substring(0, 500)
      },
      theme: {
        color: '#C9A24E'
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
        }
      },
      handler: (response) => {
        // Payment successful
        const generatedOrderId = response.razorpay_payment_id || `CN-${Date.now()}`;
        setOrderId(generatedOrderId);
        setIsSuccess(true);
        setIsProcessing(false);

        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#C9A24E', '#E8D9AE', '#4CAF50', '#1F3623']
          });
        } catch {
          // Confetti fallback
        }
      }
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        setIsProcessing(false);
        alert(`Payment failed: ${response.error.description || 'Please try again.'}`);
      });
      razorpay.open();
    } catch (err) {
      console.error('Razorpay error:', err);
      setIsProcessing(false);
      alert('Could not open payment window. Please try again.');
    }
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
      aria-labelledby="checkout-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ink/85 backdrop-blur-md animate-fade-in"
      onClick={() => !isProcessing && setIsCustomerFormOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-forest-deep border-2 border-gold-antique/60 shadow-2xl text-cream-warm overflow-hidden animate-fade-up max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gold-antique/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isSuccess && (
              <button
                onClick={() => {
                  setIsCustomerFormOpen(false);
                  setIsCartOpen(true);
                }}
                className="p-1.5 rounded-lg text-cream-warm/70 hover:text-gold-antique transition-colors cursor-pointer"
                title="Back to cart"
                disabled={isProcessing}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 id="checkout-form-title" className="font-fraunces text-xl font-bold">
              {isSuccess ? '🎉 Order Confirmed!' : 'Secure Checkout'}
            </h2>
          </div>

          {!isSuccess && !isProcessing && (
            <button
              onClick={() => setIsCustomerFormOpen(false)}
              aria-label="Close checkout"
              className="p-1.5 rounded-full hover:text-gold-antique transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 font-sans">
          {isSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-20 h-20 rounded-full bg-gold-antique/20 text-gold-antique flex items-center justify-center mx-auto border-2 border-gold-antique/50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="font-fraunces text-2xl font-bold text-cream-warm">
                  Payment Successful!
                </h3>
                <p className="text-xs sm:text-sm text-cream-warm/80 max-w-sm mx-auto leading-relaxed">
                  Your order has been placed successfully. We'll prepare it fresh and dispatch it with care.
                </p>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-xl bg-forest-ink/70 border border-gold-antique/30 text-left text-xs space-y-3 max-w-sm mx-auto">
                <div className="flex items-center gap-2 text-gold-antique font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>Order Details</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-cream-warm/80">Order ID:</span>
                  <span className="font-mono text-gold-antique">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cream-warm/80">Total Paid:</span>
                  <span className="font-fraunces text-lg font-bold text-gold-antique">₹{subtotal}</span>
                </div>
                <div className="text-cream-warm/75 space-y-1 pt-1 border-t border-gold-antique/20">
                  <p className="flex items-center gap-1.5">
                    <User className="w-3 h-3" /> {formData.name}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> {formData.city} - {formData.pincode}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Truck className="w-3 h-3" /> Delivery within 3-5 business days
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-3.5 px-6 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-bold text-sm uppercase tracking-wider transition-all shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-cream-warm/60 text-center">
                  🌿 A confirmation SMS will be sent to your registered mobile number.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              {/* Order Summary Bar */}
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

              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm/90">
                  Mobile Number <span className="text-red-400">*</span>
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

              {/* Email (optional) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm/90">
                  Email Address <span className="text-cream-warm/50">(Optional — for receipt)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. priya@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs transition-colors"
                />
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

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm/90">
                  Notes / Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please pack securely, gift wrapping needed"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3.5 px-6 rounded-xl font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2 group ${
                    isProcessing
                      ? 'bg-gold-antique/50 text-forest-ink/60 cursor-wait'
                      : 'bg-gold-antique hover:bg-gold-champagne text-forest-ink cursor-pointer'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Opening Payment Gateway...' : `Pay ₹${subtotal} Securely`}
                  </span>
                  {!isProcessing && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-cream-warm/70 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-antique" />
                <span>256-bit encrypted payment powered by Razorpay. UPI, Cards, Net Banking accepted.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
