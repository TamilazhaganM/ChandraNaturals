import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { VegMark } from '../components/common/VegMark';
import { siteConfig } from '../config/siteConfig';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
import { orderAPI, paymentAPI } from '../services/api';
import { addressService } from '../services/addressService';
import confetti from 'canvas-confetti';
import {
  ShieldCheck, Lock, CreditCard, Truck, CheckCircle2, ArrowLeft,
  ArrowRight, Sparkles, ShoppingBag, MapPin, User, Phone, Mail,
  MessageSquare, AlertCircle, FileText, Check, Plus, Edit3, Home,
  Building2, ChevronRight, X
} from 'lucide-react';

const INDIAN_STATES = [
  'Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Delhi', 'Gujarat', 'West Bengal', 'Rajasthan',
  'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar',
  'Odisha', 'Goa', 'Assam', 'Other'
];

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TYc3JTxRc18uEb';

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
  const { cart, subtotal, totalOriginalPrice, totalSavings, clearCart, itemCount } = useCart();
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Enforce customer login: guests must log in before accessing checkout and address management
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth?redirect=/checkout', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    // Sync invoice email with user if logged in
    if (user?.email) {
      setInvoiceEmail(prev => prev || user.email);
    }
  }, [user]);

  // Address management state
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Address form fields (for adding/editing)
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    landmark: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    addressType: 'home', // 'home' | 'work' | 'other'
    isDefault: false,
    saveForFuture: true
  });

  // Additional order fields
  const [orderNotes, setOrderNotes] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState(user?.email || '');

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod' | 'whatsapp'
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleteData, setOrderCompleteData] = useState(null);

  // Delivery charge calculation: free if subtotal >= 3000 or if Rs. 1 test order
  const isTestOneRupeeOrder = cart.length > 0 && cart.every(item => item.product?.price === 1 || item.price === 1 || item.product?.id === 'tomato-thokku');
  const isFreeShipping = subtotal >= 3000 || isTestOneRupeeOrder;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  // Address toast message state
  const [addressToast, setAddressToast] = useState(null);
  const showAddressToast = (msg, type = 'info') => {
    setAddressToast({ msg, type });
    setTimeout(() => setAddressToast(null), 5000);
  };

  // Load user saved addresses - guarantees default address is displayed & selected
  const fetchAddresses = async (preferredId = null) => {
    setAddressesLoading(true);
    try {
      const userAddrs = await addressService.getUserAddresses(user);
      setAddresses(userAddrs || []);
      if (userAddrs && userAddrs.length > 0) {
        const targetId = preferredId || (selectedAddressId && userAddrs.some(a => a._id === selectedAddressId) ? selectedAddressId : null);
        const def = (targetId && userAddrs.find(a => a._id === targetId)) || userAddrs.find(a => a.isDefault) || userAddrs[0];
        setSelectedAddressId(def._id);
        setIsAddingAddress(false);
        return def;
      }
    } catch (err) {
      console.warn('Could not load user addresses:', err);
      return null;
    } finally {
      setAddressesLoading(false);
    }
  };

  // 1-Click Fetch & Apply Default / Saved Address
  const handleFetchDefaultAddress = async () => {
    setAddressesLoading(true);
    try {
      const userAddrs = await addressService.getUserAddresses(user);
      setAddresses(userAddrs || []);
      const def = userAddrs.find(a => a.isDefault) || userAddrs[0];
      if (def) {
        setSelectedAddressId(def._id);
        setIsAddingAddress(false);
        setEditingAddressId(null);
        showAddressToast(`Default address loaded: ${def.fullName} (${def.city}, ${def.pincode})`, 'success');
      }
    } catch (err) {
      showAddressToast('Could not fetch saved address.', 'error');
    } finally {
      setAddressesLoading(false);
    }
  };

  // Auto-fill form from user profile
  const handleAutoFillProfile = () => {
    const def = addressService.getDefaultAddress(user);
    setAddressForm(prev => ({
      ...prev,
      fullName: user?.name || def?.fullName || prev.fullName || '',
      phone: user?.phone || def?.phone || prev.phone || '',
      addressLine: user?.address || def?.addressLine || prev.addressLine || '',
      city: user?.city || def?.city || prev.city || 'Chennai',
      state: user?.state || def?.state || prev.state || 'Tamil Nadu',
      pincode: user?.pincode || def?.pincode || prev.pincode || ''
    }));
    showAddressToast('Auto-filled contact details from your account profile.', 'info');
  };

  // Automatically fetch on mount and on user session change
  useEffect(() => {
    fetchAddresses();
    if (user) {
      setInvoiceEmail(prev => prev || user.email || '');
      setAddressForm(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Open add address form
  const openAddNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      addressLine: '',
      landmark: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '',
      addressType: 'home',
      isDefault: addresses.length === 0,
      saveForFuture: true
    });
    setErrors({});
    setIsAddingAddress(true);
  };

  // Open edit address form
  const openEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine: addr.addressLine || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || 'Tamil Nadu',
      pincode: addr.pincode || '',
      addressType: addr.addressType || 'home',
      isDefault: Boolean(addr.isDefault),
      saveForFuture: true
    });
    setErrors({});
    setIsAddingAddress(true);
  };

  // Validate address form
  const validateAddressForm = () => {
    const errs = {};
    if (!addressForm.fullName.trim()) errs.fullName = 'Recipient full name is required';
    const cleanPhone = String(addressForm.phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) errs.phone = 'Valid 10-digit mobile number required';
    if (!addressForm.addressLine.trim()) errs.addressLine = 'Street / House / Building address required';
    if (!addressForm.city.trim()) errs.city = 'City is required';
    const cleanPin = String(addressForm.pincode || '').replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length !== 6) errs.pincode = 'Valid 6-digit postal PIN code required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save address action
  const handleSaveAddress = async (e) => {
    if (e) e.preventDefault();
    if (!validateAddressForm()) return false;

    setAddressSubmitting(true);
    try {
      if (addressForm.saveForFuture) {
        const saved = await addressService.saveAddress(user, addressForm, editingAddressId);
        const updated = await addressService.getUserAddresses(user);
        setAddresses(updated);
        setSelectedAddressId(saved._id);
      } else {
        const tempId = `temp_${Date.now()}`;
        const tempAddr = { ...addressForm, _id: tempId };
        setAddresses(prev => [tempAddr, ...prev]);
        setSelectedAddressId(tempId);
      }
      setIsAddingAddress(false);
      setEditingAddressId(null);
      return true;
    } catch (err) {
      alert('Could not save address: ' + (err.message || 'Error'));
      return false;
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your cart is empty. Please add items to checkout.');
      navigate('/shop');
      return;
    }

    // Determine active delivery address
    let activeAddress = null;

    if (isAddingAddress) {
      const saved = await handleSaveAddress();
      if (!saved) return;
      activeAddress = addressForm;
    } else {
      activeAddress = addresses.find(a => a._id === selectedAddressId) || addresses[0];
    }

    if (!activeAddress || !activeAddress.fullName || !activeAddress.addressLine) {
      alert('Please select or enter a valid delivery address to proceed.');
      setIsAddingAddress(true);
      return;
    }

    const cleanEmail = (invoiceEmail || user?.email || '').trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrors(prev => ({ ...prev, email: 'Please provide a valid email address for invoice' }));
      return;
    }

    setIsProcessing(true);

    try {
      const shippingAddress = {
        fullName: activeAddress.fullName.trim(),
        phone: String(activeAddress.phone).replace(/\D/g, '').slice(-10),
        email: cleanEmail,
        addressLine: activeAddress.addressLine.trim(),
        city: activeAddress.city.trim(),
        state: (activeAddress.state || 'Tamil Nadu').trim(),
        pincode: String(activeAddress.pincode).replace(/\D/g, '').slice(0, 6),
        landmark: (activeAddress.landmark || '').trim()
      };

      const orderPayload = {
        items: cart.map(item => ({
          productId: item.product.id || item.product._id,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod,
        notes: orderNotes
      };

      const orderRes = await orderAPI.createOrder(orderPayload);
      const serverOrder = orderRes.data?.order;
      const razorpayOrder = orderRes.data?.razorpayOrder;

      if (!serverOrder) {
        throw new Error('Order creation failed on server');
      }

      const customerSummary = {
        name: shippingAddress.fullName,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
        address: shippingAddress.addressLine,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        landmark: shippingAddress.landmark
      };

      // Method A: Razorpay Online Payment
      if (paymentMethod === 'razorpay') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert('Unable to connect to Razorpay secure gateway. Please check your internet or choose COD.');
          setIsProcessing(false);
          return;
        }

        const options = {
          key: razorpayOrder?.keyId || RAZORPAY_KEY_ID,
          order_id: razorpayOrder?.id,
          amount: razorpayOrder?.amount || Math.round(serverOrder.total * 100),
          currency: 'INR',
          name: siteConfig.brandName,
          description: `Artisanal Order #${serverOrder.orderNumber}`,
          image: '/logo.png',
          prefill: {
            name: customerSummary.name,
            email: customerSummary.email,
            contact: customerSummary.phone
          },
          notes: {
            orderNumber: serverOrder.orderNumber,
            orderId: serverOrder._id
          },
          theme: {
            color: '#C9A24E'
          },
          handler: async (response) => {
            try {
              // Verify cryptographic signature on backend
              await paymentAPI.verifyPayment({
                orderId: serverOrder._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              setIsProcessing(false);
              finishOrderSuccess({
                orderId: serverOrder.orderNumber,
                paymentId: response.razorpay_payment_id,
                paymentMethod: 'Online Payment (Razorpay)',
                items: serverOrder.items,
                customer: customerSummary,
                total: serverOrder.total
              });
            } catch (verErr) {
              setIsProcessing(false);
              alert('Payment verification error: ' + (verErr.message || 'Signature mismatch'));
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setAddressToast({
                type: 'error',
                msg: 'Razorpay payment was cancelled. Your items remain saved in your cart — you can retry online payment or choose Cash on Delivery.'
              });
              if (serverOrder?._id) {
                orderAPI.cancelOrder(serverOrder._id, 'Payment cancelled by customer during Razorpay gateway popup').catch(() => {});
              }
            }
          }
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', async (response) => {
            setIsProcessing(false);
            const failReason = response.error?.description || response.error?.reason || 'Transaction declined';
            setAddressToast({
              type: 'error',
              msg: `Payment failed: ${response.error?.description || 'Transaction declined'}. Your items remain in your cart.`
            });
            try {
              if (serverOrder?._id) {
                await orderAPI.cancelOrder(serverOrder._id, response.error?.description || 'Razorpay transaction failed');
              }
            } catch (e) {
              // Ignore backend cancellation error
            }
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
        const waUrl = generateWhatsAppOrderUrl(cart, customerSummary, serverOrder.total);
        setIsProcessing(false);
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        finishOrderSuccess({
          orderId: serverOrder.orderNumber,
          paymentId: 'WhatsApp-Confirmation (Pending Verification)',
          paymentMethod: 'WhatsApp Direct (Pending)',
          items: serverOrder.items,
          customer: customerSummary,
          total: serverOrder.total
        });
        return;
      }

      // Method C: Cash on Delivery (COD)
      if (paymentMethod === 'cod') {
        setIsProcessing(false);
        finishOrderSuccess({
          orderId: serverOrder.orderNumber,
          paymentId: 'COD-Verified',
          paymentMethod: 'Cash on Delivery',
          items: serverOrder.items,
          customer: customerSummary,
          total: serverOrder.total
        });
        return;
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setIsProcessing(false);
      alert(err.message || 'Failed to place order. Please try again.');
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
                {orderCompleteData.isWhatsApp ? 'WhatsApp Inquiry Forwarded!' : 'Thank you for choosing tradition!'}
              </span>
              <h1 className="font-fraunces text-3xl sm:text-4xl font-bold">
                {orderCompleteData.isWhatsApp ? 'Order Inquiry Sent via WhatsApp' : 'Your Order Has Been Placed!'}
              </h1>
              <p className="text-xs sm:text-sm text-cream-warm/75 font-sans max-w-md mx-auto">
                {orderCompleteData.isWhatsApp
                  ? 'We have redirected you to WhatsApp with your item summary. Our kitchen team will confirm fresh batch availability and finalize payment/dispatch with you.'
                  : 'We have received your request. Our kitchen will hand-pack your small-batch delicacies with pure care and despatch them promptly.'}
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
                  {orderCompleteData.isWhatsApp ? 'Order Channel' : 'Payment Method'}
                </span>
                <span className="font-semibold text-cream-warm">
                  {orderCompleteData.paymentMethod}
                </span>
              </div>

              <div className="space-y-0.5 text-center sm:text-right">
                <span className="text-cream-warm/60 uppercase tracking-widest text-[10px] block">
                  {orderCompleteData.isWhatsApp ? 'Total (Pay on Confirmation)' : 'Total Amount Paid'}
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
                to="/account?tab=orders"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-bold text-xs uppercase tracking-wider transition-all shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order Live</span>
              </Link>
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-forest-ink hover:bg-forest-moss text-cream-warm border border-gold-antique/40 hover:border-gold-antique font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // 1. If auth is still resolving, show clean loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-botanical-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gold-antique">
          <div className="w-8 h-8 border-2 border-gold-antique border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-xs tracking-wider uppercase text-cream-warm/75">
            Verifying your account...
          </span>
        </div>
      </div>
    );
  }

  // 2. If user is guest / not authenticated, require login before proceeding to address & checkout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-botanical-mesh flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-forest-deep border-2 border-gold-antique/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-antique/15 border border-gold-antique/30 flex items-center justify-center text-gold-antique shadow-gold-glow">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-fraunces text-2xl sm:text-3xl font-bold text-cream-warm">
              Sign In to Checkout
            </h2>
            <p className="text-xs sm:text-sm text-cream-warm/75 font-sans leading-relaxed">
              To deliver your artisanal small-batch order safely and access your saved delivery addresses, please sign in or create an account.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/auth?redirect=/checkout')}
              className="w-full py-3.5 px-6 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-bold font-sans text-xs uppercase tracking-wider transition-all shadow-gold-glow active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/cart"
              className="inline-block text-xs text-cream-warm/60 hover:text-gold-antique font-sans underline"
            >
              ← Return to Cart
            </Link>
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
              
              {/* Step 1: Shipping & Delivery Destination Card */}
              <div className="rounded-2xl bg-forest-deep border border-gold-antique/30 p-6 sm:p-7 shadow-xl space-y-5">
                {/* Step 1 Header with Prominent Fetch Default Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold-antique/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gold-antique text-forest-ink font-bold flex items-center justify-center text-xs font-sans">
                      1
                    </div>
                    <h2 className="font-fraunces text-xl font-bold text-cream-warm">
                      Shipping & Delivery Destination
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {user ? (
                      <span className="text-[11px] text-emerald-400 font-medium font-sans flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Account:</span> {user.name}
                      </span>
                    ) : (
                      <Link to="/auth" className="text-[11px] text-gold-antique hover:underline font-sans">
                        Log in
                      </Link>
                    )}
                  </div>
                </div>

                {/* Toast alert banner if active */}
                {addressToast && (
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-sans transition-all animate-fadeIn ${
                    addressToast.type === 'success'
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                      : addressToast.type === 'error'
                      ? 'bg-rose-950/70 border-rose-500/40 text-rose-200'
                      : 'bg-gold-antique/15 border-gold-antique/30 text-cream-warm'
                  }`}>
                    <div className="flex items-center gap-2">
                      {addressToast.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <MapPin className="w-4 h-4 text-gold-antique shrink-0" />
                      )}
                      <span>{addressToast.msg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddressToast(null)}
                      className="text-xs opacity-70 hover:opacity-100 cursor-pointer ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Content: loading skeleton OR saved addresses OR add/edit address form */}
                {addressesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-pulse">
                    {[1, 2].map(n => (
                      <div key={n} className="h-36 rounded-2xl bg-forest-ink/60 border border-gold-antique/20" />
                    ))}
                  </div>
                ) : !isAddingAddress && addresses.length > 0 ? (
                  /* SAVED ADDRESSES SELECTOR */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-gold-antique/15">
                      <span className="text-xs font-semibold text-cream-warm/80 font-sans">
                        Select delivery address ({addresses.length} saved):
                      </span>
                      <button
                        type="button"
                        onClick={openAddNewAddress}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold-antique text-forest-ink font-bold font-sans text-xs hover:bg-gold-champagne transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add New Address</span>
                      </button>
                    </div>

                    {/* Grid of Saved Addresses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id;
                        return (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddressId(addr._id)}
                            className={`relative rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between border-2 ${
                              isSelected
                                ? 'border-gold-antique bg-gold-antique/10 shadow-gold-glow ring-1 ring-gold-antique/40'
                                : 'border-gold-antique/20 bg-forest-ink/60 hover:border-gold-antique/40 hover:bg-forest-ink/80'
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Header row: Radio, type, default */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected ? 'border-gold-antique bg-gold-antique' : 'border-gold-antique/40'
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-forest-ink" />}
                                  </div>
                                  <span className="font-serif text-sm font-bold text-cream-warm">
                                    {addr.fullName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-deep border border-gold-antique/30 text-gold-antique font-sans">
                                    {addr.addressType === 'work' ? (
                                      <Building2 className="w-2.5 h-2.5" />
                                    ) : (
                                      <Home className="w-2.5 h-2.5" />
                                    )}
                                    {addr.addressType || 'Home'}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Address Details */}
                              <div className="text-xs text-cream-warm/80 font-sans space-y-0.5 pl-6 leading-relaxed">
                                <p className="line-clamp-2">{addr.addressLine}</p>
                                {addr.landmark && (
                                  <p className="text-[11px] text-cream-warm/60">Landmark: {addr.landmark}</p>
                                )}
                                <p className="font-medium text-cream-warm">
                                  {addr.city}, {addr.state} - <span className="font-mono text-gold-antique font-bold">{addr.pincode}</span>
                                </p>
                                <p className="text-cream-warm/70 pt-0.5 font-mono text-[11px]">
                                  Mobile: +91 {addr.phone}
                                </p>
                              </div>
                            </div>

                            {/* Bottom Card Action / Edit */}
                            <div className="pt-3 mt-3 border-t border-gold-antique/15 flex items-center justify-between pl-6 text-xs font-sans">
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 text-gold-antique font-bold text-[11px]">
                                  <Check className="w-3.5 h-3.5" />
                                  Deliver to this address
                                </span>
                              ) : (
                                <span className="text-cream-warm/50 text-[11px]">
                                  Click to choose
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditAddress(addr);
                                }}
                                className="p-1.5 rounded-lg bg-forest-deep hover:bg-forest-moss/40 text-cream-warm/70 hover:text-gold-antique transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                                title="Edit Address"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* ADD OR EDIT ADDRESS FORM */
                  <div className="space-y-4 font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-gold-antique/15">
                      <h3 className="font-fraunces text-base font-bold text-cream-warm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gold-antique" />
                        <span>
                          {editingAddressId ? 'Edit Delivery Address' : addresses.length > 0 ? 'Add New Delivery Address' : 'Enter Delivery Address'}
                        </span>
                      </h3>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAutoFillProfile}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-antique/15 hover:bg-gold-antique text-gold-antique hover:text-forest-ink text-[11px] font-semibold transition-all cursor-pointer border border-gold-antique/30"
                          title="Auto-fill contact details from your profile"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-fill Profile</span>
                        </button>

                        {addresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingAddress(false);
                              setEditingAddressId(null);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-gold-antique hover:underline cursor-pointer ml-1"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Use Saved Address</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {addresses.length === 0 && (
                      <div className="p-3.5 rounded-xl bg-gold-antique/10 border border-gold-antique/25 flex items-start gap-2.5 text-xs text-cream-warm/85">
                        <Sparkles className="w-4 h-4 text-gold-antique shrink-0 mt-0.5" />
                        <p>
                          You don't have a saved address yet. Please enter your delivery address below. We'll save it to your account for fast, 1-click checkout on future orders!
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Full Name */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gold-antique" />
                          <span>Recipient Full Name *</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Anandhi Sundaram"
                          value={addressForm.fullName}
                          onChange={(e) => {
                            setAddressForm(prev => ({ ...prev, fullName: e.target.value }));
                            if (errors.fullName) setErrors(prev => ({ ...prev, fullName: null }));
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl bg-forest-ink border ${
                            errors.fullName ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                          } text-cream-warm focus:outline-none font-sans text-sm`}
                        />
                        {errors.fullName && <p className="text-red-400 text-[11px]">{errors.fullName}</p>}
                      </div>

                      {/* Mobile Number */}
                      <div className="space-y-1.5">
                        <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gold-antique" />
                          <span>Mobile Number (10 digits) *</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-cream-warm/60 font-mono text-sm">+91</span>
                          <input
                            type="tel"
                            placeholder="9876543210"
                            maxLength={10}
                            value={addressForm.phone}
                            onChange={(e) => {
                              setAddressForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }));
                              if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                            }}
                            className={`w-full pl-13 pr-4 py-2.5 rounded-xl bg-forest-ink border ${
                              errors.phone ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                            } text-cream-warm focus:outline-none font-mono text-sm`}
                          />
                        </div>
                        {errors.phone && <p className="text-red-400 text-[11px]">{errors.phone}</p>}
                      </div>

                      {/* Address Type Selector */}
                      <div className="space-y-1.5">
                        <label className="text-cream-warm/85 font-semibold block">Address Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'home', label: 'Home', icon: Home },
                            { id: 'work', label: 'Work', icon: Building2 },
                            { id: 'other', label: 'Other', icon: MapPin }
                          ].map(type => {
                            const Icon = type.icon;
                            const isSelected = addressForm.addressType === type.id;
                            return (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => setAddressForm(prev => ({ ...prev, addressType: type.id }))}
                                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-sans text-xs transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-gold-antique bg-gold-antique text-forest-ink font-bold shadow-sm'
                                    : 'border-gold-antique/25 bg-forest-ink text-cream-warm hover:border-gold-antique/50'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{type.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Street / Flat Address */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gold-antique" />
                          <span>Flat / House No., Building, Street & Area *</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Flat 4B, Heritage Enclave, Gandhi Road, Adyar"
                          value={addressForm.addressLine}
                          onChange={(e) => {
                            setAddressForm(prev => ({ ...prev, addressLine: e.target.value }));
                            if (errors.addressLine) setErrors(prev => ({ ...prev, addressLine: null }));
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl bg-forest-ink border ${
                            errors.addressLine ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                          } text-cream-warm focus:outline-none font-sans text-sm resize-none`}
                        />
                        {errors.addressLine && <p className="text-red-400 text-[11px]">{errors.addressLine}</p>}
                      </div>

                      {/* Landmark */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-cream-warm/75">Nearby Landmark / Instructions (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Near Vinayagar Temple, Behind Metro Station"
                          value={addressForm.landmark}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl bg-forest-ink border border-gold-antique/25 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-xs"
                        />
                      </div>

                      {/* City */}
                      <div className="space-y-1.5">
                        <label className="text-cream-warm/85 font-semibold">City *</label>
                        <input
                          type="text"
                          placeholder="e.g. Chennai"
                          value={addressForm.city}
                          onChange={(e) => {
                            setAddressForm(prev => ({ ...prev, city: e.target.value }));
                            if (errors.city) setErrors(prev => ({ ...prev, city: null }));
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl bg-forest-ink border ${
                            errors.city ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                          } text-cream-warm focus:outline-none font-sans text-sm`}
                        />
                        {errors.city && <p className="text-red-400 text-[11px]">{errors.city}</p>}
                      </div>

                      {/* State */}
                      <div className="space-y-1.5">
                        <label className="text-cream-warm/85 font-semibold">State *</label>
                        <select
                          value={addressForm.state}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-sm cursor-pointer"
                        >
                          {INDIAN_STATES.map(st => (
                            <option key={st} value={st} className="bg-forest-deep text-cream-warm">
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Pincode */}
                      <div className="space-y-1.5">
                        <label className="text-cream-warm/85 font-semibold">Postal Pincode (6 digits) *</label>
                        <input
                          type="text"
                          placeholder="6-digit pincode"
                          maxLength={6}
                          value={addressForm.pincode}
                          onChange={(e) => {
                            setAddressForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }));
                            if (errors.pincode) setErrors(prev => ({ ...prev, pincode: null }));
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl bg-forest-ink border ${
                            errors.pincode ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                          } text-cream-warm focus:outline-none font-mono text-sm`}
                        />
                        {errors.pincode && <p className="text-red-400 text-[11px]">{errors.pincode}</p>}
                      </div>

                      {/* Checkboxes for saving and default */}
                      <div className="sm:col-span-2 pt-2 space-y-2">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-cream-warm/85">
                          <input
                            type="checkbox"
                            checked={addressForm.saveForFuture}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, saveForFuture: e.target.checked }))}
                            className="w-4 h-4 rounded text-gold-antique accent-gold-antique cursor-pointer"
                          />
                          <span>Save this address to my account for faster 1-click checkout next time</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-cream-warm/85">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                            className="w-4 h-4 rounded text-gold-antique accent-gold-antique cursor-pointer"
                          />
                          <span>Make this my default delivery address</span>
                        </label>
                      </div>

                      {/* Save Address Buttons */}
                      <div className="sm:col-span-2 pt-3 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={addressSubmitting}
                          onClick={handleSaveAddress}
                          className="px-6 py-2.5 rounded-xl bg-gold-antique text-forest-ink font-bold font-sans text-xs uppercase tracking-wider hover:bg-gold-champagne transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{addressSubmitting ? 'Saving Address...' : 'Save & Deliver Here'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAutoFillProfile}
                          className="px-4 py-2.5 rounded-xl border border-gold-antique/30 text-gold-antique hover:bg-gold-antique/10 text-xs font-sans cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-fill Profile</span>
                        </button>

                        {addresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingAddress(false);
                              setEditingAddressId(null);
                            }}
                            className="px-4 py-2.5 rounded-xl text-cream-warm/70 hover:text-cream-warm text-xs font-sans cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmed Delivery Destination Badge */}
                {!isAddingAddress && addresses.length > 0 && (() => {
                  const selectedAddr = addresses.find(a => a._id === selectedAddressId) || addresses[0];
                  if (!selectedAddr) return null;
                  return (
                    <div className="p-3.5 rounded-xl bg-forest-ink/90 border border-gold-antique/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans shadow-inner">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-gold-antique font-bold block">
                            Confirmed Delivery Destination
                          </span>
                          <p className="font-semibold text-cream-warm">
                            {selectedAddr.fullName} · +91 {selectedAddr.phone}
                          </p>
                          <p className="text-cream-warm/75 text-[11px] line-clamp-1">
                            {selectedAddr.addressLine}, {selectedAddr.city}, {selectedAddr.state} - {selectedAddr.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Invoice Email & Special Courier Remarks */}
                <div className="pt-4 border-t border-gold-antique/15 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gold-antique" />
                      <span>Invoice & Order Updates Email *</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={invoiceEmail}
                      onChange={(e) => {
                        setInvoiceEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                      }}
                      className={`w-full px-4 py-2 rounded-xl bg-forest-ink border ${
                        errors.email ? 'border-red-400' : 'border-gold-antique/30 focus:border-gold-antique'
                      } text-cream-warm focus:outline-none font-sans text-xs`}
                    />
                    {errors.email && <p className="text-red-400 text-[11px]">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-cream-warm/75 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gold-antique" />
                      <span>Courier Notes / Special Remarks (Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call before delivery / leave at security"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
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
                {totalSavings > 0 ? (
                  <>
                    <div className="flex justify-between text-cream-warm/85">
                      <span>Total MRP</span>
                      <span className="font-mono text-cream-warm/60 line-through">₹{totalOriginalPrice}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Discount on MRP
                      </span>
                      <span className="font-mono">- ₹{totalSavings}</span>
                    </div>
                    <div className="flex justify-between text-cream-warm/85">
                      <span>Items Subtotal</span>
                      <span className="font-mono font-bold">₹{subtotal}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-cream-warm/85">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-bold">₹{subtotal}</span>
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

                {totalSavings > 0 && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center font-medium text-[11px] flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>You are saving ₹{totalSavings} on this order!</span>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-gold-antique/15 space-y-2 text-[11px] text-cream-warm/75 font-sans">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-antique flex-shrink-0" />
                  <span>FSSAI Certified {siteConfig.fssaiNumber} • 100% Preservative-Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gold-antique flex-shrink-0" />
                  <span>Delivered safely across India in 3-5 business days</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
