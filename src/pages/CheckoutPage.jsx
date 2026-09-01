import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { VegMark } from '../components/common/VegMark';
import { siteConfig } from '../config/siteConfig';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
import confetti from 'canvas-confetti';
import {
  ShieldCheck, Lock, CreditCard, Truck, CheckCircle2, ArrowLeft,
  ArrowRight, Sparkles, ShoppingBag, MapPin, User, Phone, Mail,
  MessageSquare, AlertCircle, FileText, Check
} from 'lucide-react';

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

export const CheckoutPage = () => {
  const { cart, subtotal, totalSavings, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Delivery / customer form data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    notes: ''
  });

  // Sync user profile data if user changes or logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod' | 'whatsapp'
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleteData, setOrderCompleteData] = useState(null);

  // Delivery charge calculation
  const isFreeShipping = subtotal >= 3000;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your full name';
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.address.trim()) newErrors.address = 'Please enter your street / flat delivery address';
    if (!formData.city.trim()) newErrors.city = 'Please enter your city';
    if (!formData.pincode.trim() || formData.pincode.trim().length < 6) {
      newErrors.pincode = 'Please enter a valid 6-digit postal pincode';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items to checkout.');
      navigate('/shop');
      return;
    }

    setIsProcessing(true);

    const generatedOrderId = 'CN-' + Math.floor(100000 + Math.random() * 900000);
    const orderItemsSnapshot = [...cart];

    // Method A: Razorpay Online Payment
    if (paymentMethod === 'razorpay') {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Unable to connect to Razorpay secure payment gateway. Please check your internet connection or choose COD.');
        setIsProcessing(false);
        return;
      }

      const itemsDescription = orderItemsSnapshot
        .map(item => `${item.product.name} x${item.quantity}`)
        .join(', ');

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: grandTotal * 100, // Amount in paise
        currency: 'INR',
        name: siteConfig.brandName,
        description: `Small-Batch Artisanal Order #${generatedOrderId}`,
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=200&auto=format&fit=crop',
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          order_id: generatedOrderId,
          shipping_address: `${formData.address}, ${formData.city}, ${formData.pincode}`,
          items: itemsDescription.slice(0, 200)
        },
        theme: {
          color: '#C9A24E'
        },
        handler: (response) => {
          setIsProcessing(false);
          const paymentId = response.razorpay_payment_id;
          finishOrderSuccess({
            orderId: generatedOrderId,
            paymentId,
            paymentMethod: 'Online Payment (Razorpay)',
            items: orderItemsSnapshot,
            customer: formData,
            total: grandTotal
          });
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          setIsProcessing(false);
          alert(`Payment failed: ${response.error.description || 'Transaction declined'}`);
        });
        rzp.open();
      } catch (err) {
        console.error('Razorpay invocation error:', err);
        setIsProcessing(false);
        alert('An error occurred opening the payment window. Please try again.');
      }
      return;
    }

    // Method B: WhatsApp Direct Order
    if (paymentMethod === 'whatsapp') {
      const waUrl = generateWhatsAppOrderUrl(cart, formData, grandTotal);
      setIsProcessing(false);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      finishOrderSuccess({
        orderId: generatedOrderId,
        paymentId: 'WhatsApp-Confirmation',
        paymentMethod: 'WhatsApp Kitchen Order',
        items: orderItemsSnapshot,
        customer: formData,
        total: grandTotal
      });
      return;
    }

    // Method C: Cash on Delivery (COD)
    if (paymentMethod === 'cod') {
      setTimeout(() => {
        setIsProcessing(false);
        finishOrderSuccess({
          orderId: generatedOrderId,
          paymentId: 'COD-Verified',
          paymentMethod: 'Cash on Delivery',
          items: orderItemsSnapshot,
          customer: formData,
          total: grandTotal
        });
      }, 700);
    }
  };

  const finishOrderSuccess = (orderData) => {
    setOrderCompleteData(orderData);
    clearCart();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#C9A24E', '#E8D9AE', '#4CAF50', '#1F3623']
      });
    } catch {
      // Confetti fallback
    }
  };

  // If order was successfully completed, show rich confirmation receipt view
  if (orderCompleteData) {
    return (
      <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-forest-deep border-2 border-gold-antique/40 p-8 sm:p-10 shadow-2xl space-y-8 animate-fade-in text-cream-warm">
            
            {/* Header / Success Pill */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-forest-ink flex items-center justify-center text-gold-antique mx-auto border-2 border-gold-antique shadow-gold-glow animate-pulse">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="font-caveat text-2xl text-gold-antique font-semibold block">
                Thank you for choosing tradition!
              </span>
              <h1 className="font-fraunces text-3xl sm:text-4xl font-bold">
                Your Order Has Been Placed!
              </h1>
              <p className="text-xs sm:text-sm text-cream-warm/75 font-sans max-w-md mx-auto">
                We have received your request. Our kitchen will hand-pack your small-batch delicacies with pure care and despatch them promptly.
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="p-5 rounded-2xl bg-forest-ink/70 border border-gold-antique/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-cream-warm/60 uppercase tracking-widest text-[10px] block">
                  Order Number
                </span>
                <span className="font-mono text-base font-bold text-gold-antique">
                  #{orderCompleteData.orderId}
                </span>
              </div>

              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-cream-warm/60 uppercase tracking-widest text-[10px] block">
                  Payment Method
                </span>
                <span className="font-semibold text-cream-warm">
                  {orderCompleteData.paymentMethod}
                </span>
              </div>

              <div className="space-y-0.5 text-center sm:text-right">
                <span className="text-cream-warm/60 uppercase tracking-widest text-[10px] block">
                  Total Amount Paid
                </span>
                <span className="font-fraunces text-lg font-bold text-gold-antique">
                  ₹{orderCompleteData.total}
                </span>
              </div>
            </div>

            {/* Detailed Ordered Items List */}
            <div className="space-y-3 font-sans">
              <h3 className="font-fraunces text-lg font-bold text-cream-warm border-b border-gold-antique/20 pb-2">
                Order Item Details
              </h3>
              <div className="divide-y divide-gold-antique/15 bg-forest-ink/40 rounded-2xl p-4 border border-gold-antique/20">
                {orderCompleteData.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gold-antique/30 bg-forest-ink flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-cream-warm line-clamp-1 font-sans">
                          {item.product.name}
                        </p>
                        <span className="text-[11px] text-cream-warm/60 font-sans">
                          {item.product.weight} · Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-fraunces text-sm font-bold text-gold-antique font-mono">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Details */}
            <div className="p-4 rounded-2xl bg-forest-ink/40 border border-gold-antique/20 space-y-1 font-sans text-xs">
              <span className="text-[10px] uppercase tracking-widest text-gold-antique font-bold block">
                Shipping & Delivery Address
              </span>
              <p className="font-semibold text-cream-warm">{orderCompleteData.customer.name} ({orderCompleteData.customer.phone})</p>
              <p className="text-cream-warm/75 leading-relaxed">
                {orderCompleteData.customer.address}, {orderCompleteData.customer.city}, {orderCompleteData.customer.state} - {orderCompleteData.customer.pincode}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-sans">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-bold text-xs uppercase tracking-wider transition-all shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-forest-ink hover:bg-forest-moss text-cream-warm border border-gold-antique/40 hover:border-gold-antique font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Back to Homepage
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and not completed
  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-forest-deep flex items-center justify-center text-gold-antique mx-auto border border-gold-antique/30">
            <ShoppingBag className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-2">
            <h2 className="font-fraunces text-2xl font-bold text-cream-warm">
              No items to checkout
            </h2>
            <p className="text-xs sm:text-sm text-cream-warm/70 font-sans">
              Please add your favourite artisanal thokkus, ghee, or grain mixes to proceed with full checkout.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gold-antique text-forest-ink font-sans font-bold text-xs uppercase tracking-wider shadow-gold-glow"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-antique">
          <Link to="/" className="hover:underline flex items-center gap-1">
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link to="/cart" className="hover:underline">
            <span>Cart</span>
          </Link>
          <span>/</span>
          <span className="text-cream-warm">Full Size Checkout</span>
        </div>

        {/* Header */}
        <div className="border-b border-gold-antique/20 pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-antique/15 text-gold-antique text-xs font-semibold uppercase tracking-wider font-sans">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure 256-Bit SSL Checkout</span>
          </div>
          <h1 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold text-cream-warm">
            Checkout & Order Confirmation
          </h1>
          <p className="font-sans text-sm sm:text-base text-cream-warm/75">
            Fill in your delivery address and choose your preferred payment method.
          </p>
        </div>

        {/* Main 2-Column Full-Size Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Delivery Form & Payment Methods (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              
              {/* Step 1: Shipping & Delivery Info Card */}
              <div className="rounded-2xl bg-forest-deep border border-gold-antique/30 p-6 sm:p-7 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-gold-antique/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gold-antique text-forest-ink font-bold flex items-center justify-center text-xs font-sans">
                      1
                    </div>
                    <h2 className="font-fraunces text-xl font-bold text-cream-warm">
                      Shipping & Delivery Details
                    </h2>
                  </div>
                  {user ? (
                    <span className="text-[11px] text-emerald-400 font-medium font-sans">
                      Logged in as {user.name}
                    </span>
                  ) : (
                    <Link to="/auth" className="text-[11px] text-gold-antique hover:underline font-sans">
                      Have an account? Log in
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gold-antique" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Anandhi Sundaram"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-forest-ink border ${
                        errors.name ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                      } text-cream-warm focus:outline-none font-sans text-sm`}
                    />
                    {errors.name && <p className="text-red-400 text-[11px]">{errors.name}</p>}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gold-antique" />
                      <span>Mobile Number (WhatsApp) *</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-forest-ink border ${
                        errors.phone ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                      } text-cream-warm focus:outline-none font-sans text-sm`}
                    />
                    {errors.phone && <p className="text-red-400 text-[11px]">{errors.phone}</p>}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gold-antique" />
                      <span>Email Address (For Invoice) *</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-forest-ink border ${
                        errors.email ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                      } text-cream-warm focus:outline-none font-sans text-sm`}
                    />
                    {errors.email && <p className="text-red-400 text-[11px]">{errors.email}</p>}
                  </div>

                  {/* Street / Flat Address */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-antique" />
                      <span>Door No, Building, Street / Area *</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Flat 4B, Heritage Enclave, Gandhi Road, Adyar"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-forest-ink border ${
                        errors.address ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                      } text-cream-warm focus:outline-none font-sans text-sm resize-none`}
                    />
                    {errors.address && <p className="text-red-400 text-[11px]">{errors.address}</p>}
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-cream-warm/85 font-semibold">City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-forest-ink border ${
                        errors.city ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                      } text-cream-warm focus:outline-none font-sans text-sm`}
                    />
                    {errors.city && <p className="text-red-400 text-[11px]">{errors.city}</p>}
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1.5">
                    <label className="text-cream-warm/85 font-semibold">Postal Pincode *</label>
                    <input
                      type="text"
                      placeholder="6-digit pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-forest-ink border ${
                        errors.pincode ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                      } text-cream-warm focus:outline-none font-sans text-sm`}
                    />
                    {errors.pincode && <p className="text-red-400 text-[11px]">{errors.pincode}</p>}
                  </div>

                  {/* State */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-cream-warm/85 font-semibold">State / Region</label>
                    <input
                      type="text"
                      placeholder="Tamil Nadu"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-sm"
                    />
                  </div>

                  {/* Order Notes / Landmark */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-cream-warm/75">Delivery Instructions / Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Vinayagar Temple, ring bell on 2nd floor"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-forest-ink border border-gold-antique/25 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-xs"
                    />
                  </div>

                </div>
              </div>

              {/* Step 2: Payment Method Card */}
              <div className="rounded-2xl bg-forest-deep border border-gold-antique/30 p-6 sm:p-7 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 border-b border-gold-antique/20 pb-3">
                  <div className="w-7 h-7 rounded-full bg-gold-antique text-forest-ink font-bold flex items-center justify-center text-xs font-sans">
                    2
                  </div>
                  <h2 className="font-fraunces text-xl font-bold text-cream-warm">
                    Select Payment Method
                  </h2>
                </div>

                <div className="space-y-3 font-sans">
                  
                  {/* Option 1: Razorpay Online Payment */}
                  <label
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'razorpay'
                        ? 'border-gold-antique bg-gold-antique/10 shadow-gold-glow'
                        : 'border-gold-antique/25 bg-forest-ink/60 hover:border-gold-antique/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-1 text-gold-antique focus:ring-0 w-4 h-4 accent-gold-antique cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-fraunces text-sm font-bold text-cream-warm">
                          Online Payment via Razorpay
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-cream-warm/75 leading-relaxed">
                        Instant, 100% secure payment via UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, and Net Banking.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Direct WhatsApp Confirmation */}
                  <label
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'whatsapp'
                        ? 'border-[#25D366] bg-[#25D366]/10 shadow-md'
                        : 'border-gold-antique/25 bg-forest-ink/60 hover:border-gold-antique/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                      className="mt-1 text-[#25D366] focus:ring-0 w-4 h-4 accent-[#25D366] cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-fraunces text-sm font-bold text-cream-warm flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-[#25D366]" />
                          <span>Direct Kitchen WhatsApp Order</span>
                        </span>
                      </div>
                      <p className="text-xs text-cream-warm/75 leading-relaxed">
                        Connect with our culinary team directly on WhatsApp to confirm details, customize spice level, and pay via QR / GPay.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-gold-antique bg-gold-antique/10 shadow-gold-glow'
                        : 'border-gold-antique/25 bg-forest-ink/60 hover:border-gold-antique/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 text-gold-antique focus:ring-0 w-4 h-4 accent-gold-antique cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <span className="font-fraunces text-sm font-bold text-cream-warm">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-xs text-cream-warm/75 leading-relaxed">
                        Pay cash or UPI at your doorstep upon parcel arrival.
                      </p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Submit / Pay Button */}
              <div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-8 rounded-2xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-forest-ink border-t-transparent rounded-full animate-spin" />
                      <span>Connecting with Payment Gateway...</span>
                    </span>
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{grandTotal} & Confirm Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : paymentMethod === 'whatsapp' ? (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Confirm via WhatsApp (₹{grandTotal})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4" />
                      <span>Place Cash on Delivery Order (₹{grandTotal})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Full Chosen Products & Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="rounded-2xl bg-forest-deep border-2 border-gold-antique/40 p-6 shadow-2xl space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gold-antique/20 pb-3">
                <div>
                  <h2 className="font-fraunces text-xl font-bold text-cream-warm">
                    Chosen Products
                  </h2>
                  <span className="text-xs text-cream-warm/75 font-sans">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} in your basket
                  </span>
                </div>
                <Link
                  to="/cart"
                  className="text-xs font-semibold text-gold-antique hover:underline font-sans"
                >
                  Edit Cart
                </Link>
              </div>

              {/* Scrollable list of chosen products */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gold-antique/15 pr-1 space-y-3 font-sans">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gold-antique/30 bg-forest-ink flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-0 right-0 bg-gold-antique text-forest-ink font-bold text-[9px] w-4 h-4 rounded-bl flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <VegMark isVeg={item.product.isVeg} size="sm" />
                          <p className="text-xs sm:text-sm font-semibold text-cream-warm truncate font-sans">
                            {item.product.name}
                          </p>
                        </div>
                        <span className="text-[11px] text-cream-warm/65 block font-sans">
                          {item.product.weight} · Qty: {item.quantity}
                        </span>
                      </div>
                    </div>

                    <span className="font-fraunces text-sm font-bold text-gold-antique font-mono flex-shrink-0">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="pt-3 border-t border-gold-antique/20 space-y-2.5 font-sans text-xs">
                <div className="flex justify-between text-cream-warm/85">
                  <span>Items Subtotal</span>
                  <span className="font-mono font-bold">₹{subtotal}</span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Special Savings
                    </span>
                    <span className="font-mono">- ₹{totalSavings}</span>
                  </div>
                )}

                <div className="flex justify-between text-cream-warm/85">
                  <span>Shipping & Handling</span>
                  <span className="font-mono">
                    {isFreeShipping ? (
                      <span className="text-emerald-400 font-bold">FREE (Above Rs.3000)</span>
                    ) : (
                      <span>₹99 Flat Pan-India</span>
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-gold-antique/25 flex justify-between items-baseline">
                  <div>
                    <span className="font-fraunces text-base font-bold text-cream-warm block">
                      Grand Total
                    </span>
                    <span className="text-[10px] text-cream-warm/60 font-sans">
                      All taxes & safe packaging included
                    </span>
                  </div>
                  <span className="font-fraunces text-2xl font-bold text-gold-antique font-mono">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-gold-antique/15 space-y-2 text-[11px] text-cream-warm/75 font-sans">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-antique flex-shrink-0" />
                  <span>FSSAI Certified {siteConfig.fssaiNumber} • 100% Preservative-Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gold-antique flex-shrink-0" />
                  <span>Delivered safely across India in 5-7 business days</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
