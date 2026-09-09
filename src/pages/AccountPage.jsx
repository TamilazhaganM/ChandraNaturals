import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../config/siteConfig';
import { orderAPI, addressAPI } from '../services/api';
import {
  User, Package, MapPin, Lock, LogOut, CheckCircle2,
  Clock, AlertCircle, Eye, EyeOff, Plus, Trash2, Edit3,
  ShieldCheck, ChevronRight, Phone, Mail, Home, Building2,
  Truck, ShoppingBag, ArrowRight, X, Sparkles,
  RotateCcw, HelpCircle, Check, ExternalLink
} from 'lucide-react';

const INDIAN_STATES = [
  'Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Delhi', 'Gujarat', 'West Bengal', 'Rajasthan',
  'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar',
  'Odisha', 'Goa', 'Assam', 'Other'
];

export const AccountPage = ({ defaultTab = 'orders' }) => {
  const { user, isAuthenticated, loading: authLoading, logout, updateProfile, changePassword } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Read tab from URL query params or prop (e.g. /account?tab=addresses)
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync state if query param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['orders', 'personal', 'addresses', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/account');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Global Notification Feedback
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4500);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. ORDERS STATE & METHODS
  // ─────────────────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled'

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await orderAPI.getMyOrders();
      if (res.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn('Could not fetch orders:', err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  // Order status badge config
  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'delivered':
        return {
          label: 'Delivered',
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300',
          dot: 'bg-emerald-500'
        };
      case 'shipped':
        return {
          label: 'In Transit',
          bg: 'bg-blue-500/15 border-blue-500/40 text-blue-800 dark:text-blue-300',
          dot: 'bg-blue-500 animate-pulse'
        };
      case 'processing':
        return {
          label: 'Handcrafting & Packing',
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300',
          dot: 'bg-amber-500'
        };
      case 'confirmed':
        return {
          label: 'Order Confirmed',
          bg: 'bg-gold-antique/20 border-gold-antique/50 text-[#8A5A2E] dark:text-gold-antique',
          dot: 'bg-gold-antique'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-300',
          dot: 'bg-rose-500'
        };
      default:
        return {
          label: 'Order Placed',
          bg: 'bg-forest-moss/40 border-gold-antique/30 text-cream-warm',
          dot: 'bg-gold-antique'
        };
    }
  };

  // Re-order items
  const handleReorder = (order) => {
    if (!order?.items?.length) return;
    order.items.forEach(item => {
      const productObj = {
        id: item.product || item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        weight: item.weight
      };
      addToCart(productObj, item.quantity || 1);
    });
    showFeedback('success', `Items from Order #${order.orderNumber} added to your cart!`);
    navigate('/cart');
  };

  // Filtered orders
  const filteredOrders = orders.filter(ord => {
    const st = String(ord.orderStatus).toLowerCase();
    if (orderFilter === 'active') return ['pending', 'confirmed', 'processing', 'shipped'].includes(st);
    if (orderFilter === 'delivered') return st === 'delivered';
    if (orderFilter === 'cancelled') return st === 'cancelled' || st === 'returned';
    return true;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PERSONAL DATA STATE & METHODS
  // ─────────────────────────────────────────────────────────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showFeedback('error', 'Full name cannot be empty.');
      return;
    }
    const cleanPhone = profileForm.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showFeedback('error', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setProfileSaving(true);
    const res = await updateProfile({
      name: profileForm.name.trim(),
      phone: cleanPhone
    });
    setProfileSaving(false);

    if (res.success) {
      setIsEditingProfile(false);
      showFeedback('success', 'Profile details updated successfully!');
    } else {
      showFeedback('error', res.message || 'Failed to update profile.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. SAVED ADDRESSES STATE & METHODS
  // ─────────────────────────────────────────────────────────────────────────────
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    landmark: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    addressType: 'home',
    isDefault: false
  });
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await addressAPI.getAddresses();
      if (res.data?.addresses) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.warn('Could not fetch addresses:', err.message);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      addressLine: '',
      landmark: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: '',
      addressType: 'home',
      isDefault: addresses.length === 0
    });
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr) => {
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
      isDefault: Boolean(addr.isDefault)
    });
    setAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressForm.fullName.trim()) {
      showFeedback('error', 'Recipient name is required.');
      return;
    }
    const cleanPhone = addressForm.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showFeedback('error', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!addressForm.addressLine.trim()) {
      showFeedback('error', 'House/Street address is required.');
      return;
    }
    if (!addressForm.city.trim()) {
      showFeedback('error', 'City is required.');
      return;
    }
    const cleanPin = addressForm.pincode.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length !== 6) {
      showFeedback('error', 'Please enter a valid 6-digit PIN code.');
      return;
    }

    setAddressSubmitting(true);
    try {
      const payload = {
        ...addressForm,
        phone: cleanPhone,
        pincode: cleanPin
      };

      if (editingAddressId) {
        await addressAPI.updateAddress(editingAddressId, payload);
        showFeedback('success', 'Address updated successfully!');
      } else {
        await addressAPI.createAddress(payload);
        showFeedback('success', 'New address added to your address book!');
      }

      setAddressModalOpen(false);
      fetchAddresses();
    } catch (err) {
      showFeedback('error', err.message || 'Unable to save address.');
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      await addressAPI.deleteAddress(id);
      showFeedback('success', 'Address removed successfully.');
      fetchAddresses();
    } catch (err) {
      showFeedback('error', err.message || 'Could not delete address.');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await addressAPI.setDefault(id);
      showFeedback('success', 'Default address updated.');
      fetchAddresses();
    } catch (err) {
      showFeedback('error', err.message || 'Could not update default address.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. CHANGE PASSWORD STATE & METHODS
  // ─────────────────────────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-gold-antique/20' };
    let s = 0;
    if (pass.length >= 6) s += 1;
    if (pass.length >= 8) s += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) s += 1;
    if (/\d/.test(pass)) s += 1;
    if (/[^A-Za-z0-9]/.test(pass)) s += 1;

    if (s <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (s <= 4) return { score: 2, label: 'Good', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong & Secure', color: 'bg-emerald-500' };
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showFeedback('error', 'Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showFeedback('error', 'New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      showFeedback('error', 'New password cannot be the same as your existing password.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showFeedback('error', 'New passwords do not match. Please re-type.');
      return;
    }

    setPasswordSaving(true);
    const res = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    setPasswordSaving(false);

    if (res.success) {
      showFeedback('success', 'Your password has been updated securely!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showFeedback('error', res.message || 'Failed to update password.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. SIGN OUT CONFIRMATION MODAL
  // ─────────────────────────────────────────────────────────────────────────────
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login?msg=logged_out');
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-forest-ink text-cream-warm">
        <div className="w-12 h-12 border-4 border-gold-antique/30 border-t-gold-antique rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg text-cream-warm">Opening your Chandra Naturals pantry...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-forest-ink bg-botanical-mesh text-cream-warm pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Toast Notification */}
      {feedback.message && (
        <div className="fixed top-24 right-5 z-50 animate-fade-in">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-semibold backdrop-blur-md ${feedback.type === 'error'
                ? 'bg-rose-500/15 border-rose-500/60 text-rose-800 dark:text-rose-100 bg-forest-deep'
                : 'bg-forest-deep border-gold-antique text-cream-warm shadow-gold-glow'
              }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-gold-antique shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-cream-warm/70 font-sans">
          <Link to="/" className="hover:text-gold-antique transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-cream-warm/40" />
          <span className="text-gold-antique font-semibold">My Account</span>
        </nav>

        {/* Clean & Professional User Header Bar */}
        <section className="relative overflow-hidden rounded-2xl bg-forest-deep border border-gold-antique/25 p-5 sm:p-6 shadow-md">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* User Avatar Initials */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-forest-ink border border-gold-antique/40 flex items-center justify-center text-gold-antique shadow-sm shrink-0">
                <span className="font-serif text-xl sm:text-2xl font-bold uppercase">
                  {user.name ? user.name.charAt(0) : 'U'}
                </span>
              </div>

              <div>
                <h1 className="font-serif text-xl sm:text-2xl text-cream-warm font-bold tracking-tight">
                  Welcome, {user.name}
                </h1>
                <p className="text-xs text-cream-warm/65 font-sans mt-0.5">
                  {user.email} {user.phone ? `• +91 ${user.phone}` : ''}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              {user?.role === 'admin' && (
                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gold-antique text-[#0F1D12] hover:bg-gold-champagne text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kitchen & Store Operations</span>
                </Link>
              )}

              <button
                onClick={() => setShowLogoutModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest-ink hover:bg-rose-500/15 text-cream-warm/80 hover:text-rose-600 dark:hover:text-rose-300 border border-gold-antique/25 hover:border-rose-400/40 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-cream-warm/70 group-hover:text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* Main Two-Column Layout: Sidebar Tabs + Content Area                   */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Tabs Sidebar */}
          <aside className="lg:col-span-3 space-y-2 bg-forest-deep rounded-2xl border border-gold-antique/25 p-3 shadow-md sticky top-28">
            <div className="px-3 py-2 text-xs font-bold tracking-wider text-gold-antique uppercase font-sans">
              Account Menu
            </div>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${activeTab === 'orders'
                  ? 'bg-gold-antique text-[#0F1D12] shadow-md font-bold'
                  : 'text-cream-warm/85 hover:bg-forest-moss/40 hover:text-cream-warm'
                }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'orders'
                    ? 'bg-[#0F1D12]/15 text-[#0F1D12]'
                    : 'bg-forest-ink border border-gold-antique/20 text-cream-warm/70'
                  }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('personal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${activeTab === 'personal'
                  ? 'bg-gold-antique text-[#0F1D12] shadow-md font-bold'
                  : 'text-cream-warm/85 hover:bg-forest-moss/40 hover:text-cream-warm'
                }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Data</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${activeTab === 'addresses'
                  ? 'bg-gold-antique text-[#0F1D12] shadow-md font-bold'
                  : 'text-cream-warm/85 hover:bg-forest-moss/40 hover:text-cream-warm'
                }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'addresses'
                    ? 'bg-[#0F1D12]/15 text-[#0F1D12]'
                    : 'bg-forest-ink border border-gold-antique/20 text-cream-warm/70'
                  }`}
              >
                {addresses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${activeTab === 'security'
                  ? 'bg-gold-antique text-[#0F1D12] shadow-md font-bold'
                  : 'text-cream-warm/85 hover:bg-forest-moss/40 hover:text-cream-warm'
                }`}
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>

            <div className="pt-2 border-t border-gold-antique/15 mt-2">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-500/15 transition-all text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Tab Content Display Area */}
          <main className="lg:col-span-9 space-y-6">
            {/* ───────────────────────────────────────────────────────────────── */}
            {/* TAB 1: MY ORDERS & TRACKING                                       */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header & Filter Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-forest-deep p-5 rounded-2xl border border-gold-antique/25 shadow-md">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl text-cream-warm font-bold flex items-center gap-2">
                      <Package className="w-6 h-6 text-gold-antique" />
                      Orders & Tracking
                    </h2>
                    <p className="text-xs text-cream-warm/70 font-sans mt-0.5">
                      Review handcrafting progress, live tracking, and item details for every order.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-forest-ink rounded-xl border border-gold-antique/20 self-start sm:self-auto">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'active', label: 'In Progress' },
                      { id: 'delivered', label: 'Delivered' },
                      { id: 'cancelled', label: 'Cancelled' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setOrderFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${orderFilter === tab.id
                            ? 'bg-gold-antique text-[#0F1D12] font-bold shadow-sm'
                            : 'text-cream-warm/75 hover:text-cream-warm'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List / Loading / Empty State */}
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(n => (
                      <div key={n} className="h-44 rounded-2xl bg-forest-deep border border-gold-antique/20 animate-pulse" />
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="rounded-3xl border border-gold-antique/25 bg-forest-deep p-12 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-gold-antique/15 border border-gold-antique/30 flex items-center justify-center text-gold-antique mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl font-bold text-cream-warm">
                        {orderFilter === 'all'
                          ? 'No Orders Yet'
                          : `No ${orderFilter} orders found`}
                      </h3>
                      <p className="text-cream-warm/70 text-sm max-w-md mx-auto">
                        Experience authentic stone-milled premixes, podis, and handcrafted treats direct from our small batch pantry.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-antique text-[#0F1D12] font-bold font-sans text-sm hover:bg-gold-champagne transition-all shadow-md active:scale-95"
                      >
                        <span>Explore Our Shop</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredOrders.map(order => {
                      const badge = getStatusBadge(order.orderStatus);
                      const isExpanded = selectedOrder === order._id;
                      const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });

                      // Determine tracking step index (0 to 4)
                      const st = String(order.orderStatus).toLowerCase();
                      let stepIndex = 0;
                      if (st === 'confirmed') stepIndex = 1;
                      else if (st === 'processing') stepIndex = 2;
                      else if (st === 'shipped') stepIndex = 3;
                      else if (st === 'delivered') stepIndex = 4;
                      else if (st === 'cancelled' || st === 'returned') stepIndex = -1;

                      return (
                        <div
                          key={order._id}
                          className="rounded-2xl bg-forest-deep border border-gold-antique/25 overflow-hidden shadow-md transition-all hover:border-gold-antique/40"
                        >
                          {/* Order Header Summary */}
                          <div className="p-5 sm:p-6 border-b border-gold-antique/15 bg-forest-ink/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm sm:text-base font-bold text-gold-antique tracking-wide">
                                  #{order.orderNumber}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                  {badge.label}
                                </span>
                              </div>
                              <p className="text-xs text-cream-warm/70 font-sans">
                                Placed on {orderDate} • {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 self-end sm:self-auto">
                              <div className="text-right">
                                <span className="text-xs text-cream-warm/60 block font-sans font-medium">Total Amount</span>
                                <span className="font-serif text-lg sm:text-xl font-bold text-cream-warm">
                                  ₹{order.total}
                                </span>
                              </div>

                              <button
                                onClick={() => setSelectedOrder(isExpanded ? null : order._id)}
                                className="px-3 py-1.5 rounded-lg bg-forest-deep hover:bg-forest-moss/40 border border-gold-antique/30 text-xs font-semibold text-gold-antique transition-colors cursor-pointer"
                              >
                                {isExpanded ? 'Hide Details' : 'Track & Details'}
                              </button>
                            </div>
                          </div>

                          {/* 5-Step Order Tracking Stepper */}
                          {stepIndex >= 0 && (
                            <div className="px-5 py-6 bg-forest-ink/30 border-b border-gold-antique/15">
                              <div className="max-w-3xl mx-auto">
                                <div className="grid grid-cols-5 gap-1 text-center relative">
                                  {/* Progress Line */}
                                  <div className="absolute top-3.5 left-[10%] right-[10%] h-1 bg-gold-antique/25 rounded-full -z-0">
                                    <div
                                      className="h-full bg-gold-antique rounded-full transition-all duration-700"
                                      style={{ width: `${(Math.min(stepIndex, 4) / 4) * 100}%` }}
                                    />
                                  </div>

                                  {[
                                    { title: 'Placed', icon: Clock },
                                    { title: 'Confirmed', icon: CheckCircle2 },
                                    { title: 'Handcrafting', icon: Sparkles },
                                    { title: 'Dispatched', icon: Truck },
                                    { title: 'Delivered', icon: Home }
                                  ].map((step, idx) => {
                                    const isDone = idx <= stepIndex;
                                    const isCurrent = idx === stepIndex;
                                    const StepIcon = step.icon;

                                    return (
                                      <div key={step.title} className="flex flex-col items-center relative z-10">
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDone
                                              ? 'bg-gold-antique text-[#0F1D12] font-bold shadow-md shadow-gold-antique/30'
                                              : 'bg-forest-ink text-cream-warm/40 border border-gold-antique/30'
                                            } ${isCurrent ? 'ring-4 ring-gold-antique/25 scale-110' : ''}`}
                                        >
                                          <StepIcon className="w-4 h-4" />
                                        </div>
                                        <span
                                          className={`text-[11px] mt-2 font-sans font-semibold hidden sm:block ${isDone ? 'text-cream-warm font-bold' : 'text-cream-warm/50'
                                            }`}
                                        >
                                          {step.title}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Live Courier & Dispatch Tracking Card */}
                                {order.trackingInfo?.trackingNumber && (
                                  <div className="mt-5 p-3.5 sm:p-4 rounded-xl bg-forest-ink border border-gold-antique/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-gold-antique/20 text-gold-antique flex items-center justify-center shrink-0">
                                        <Truck className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-cream-warm">
                                            Dispatched via {order.trackingInfo.carrier || 'Express Courier'}
                                          </span>
                                          <span className="font-mono text-gold-antique font-bold px-1.5 py-0.5 rounded bg-forest-deep border border-gold-antique/30 text-[11px]">
                                            #{order.trackingInfo.trackingNumber}
                                          </span>
                                        </div>
                                        {order.trackingInfo.estimatedDelivery && (
                                          <p className="text-[11px] text-cream-warm/70 mt-0.5">
                                            Estimated Doorstep Delivery: {new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <a
                                      href={`https://www.google.com/search?q=${encodeURIComponent((order.trackingInfo.carrier || 'Courier') + ' tracking ' + order.trackingInfo.trackingNumber)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-antique text-[#0F1D12] font-bold text-xs hover:bg-gold-champagne transition-all shadow-sm self-start sm:self-auto cursor-pointer"
                                    >
                                      <span>Track Shipment</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Items Preview row */}
                          <div className="p-5 sm:p-6 space-y-4">
                            <div className="divide-y divide-gold-antique/15">
                              {order.items?.map((item, i) => (
                                <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-forest-ink border border-gold-antique/25 overflow-hidden shrink-0 flex items-center justify-center text-xs text-cream-warm/50">
                                      {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <Package className="w-5 h-5 text-gold-antique/50" />
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-serif text-sm font-semibold text-cream-warm">
                                        {item.name}
                                      </h4>
                                      <p className="text-xs text-cream-warm/70 font-sans">
                                        {item.weight ? `${item.weight} • ` : ''}Qty: {item.quantity} × ₹{item.price}
                                      </p>
                                    </div>
                                  </div>

                                  <span className="font-sans text-sm font-bold text-gold-antique">
                                    ₹{item.subtotal || item.price * item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Collapsible Full Order Receipt & Address details */}
                            {isExpanded && (
                              <div className="pt-5 border-t border-gold-antique/15 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                {/* Shipping Address Snapshot */}
                                <div className="p-4 rounded-xl bg-forest-ink border border-gold-antique/20 space-y-2">
                                  <span className="text-xs font-bold text-gold-antique flex items-center gap-1.5 uppercase tracking-wider">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Delivery Address
                                  </span>
                                  {order.shippingAddress ? (
                                    <div className="text-xs text-cream-warm/85 font-sans leading-relaxed space-y-0.5">
                                      <p className="font-bold text-cream-warm">{order.shippingAddress.fullName}</p>
                                      <p>{order.shippingAddress.addressLine}</p>
                                      {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
                                      <p>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                      </p>
                                      <p className="pt-1 text-cream-warm/70 font-medium">Phone: +91 {order.shippingAddress.phone}</p>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-cream-warm/70">Address recorded on order.</p>
                                  )}
                                </div>

                                {/* Payment Summary Snapshot */}
                                <div className="p-4 rounded-xl bg-forest-ink border border-gold-antique/20 space-y-2">
                                  <span className="text-xs font-bold text-gold-antique flex items-center gap-1.5 uppercase tracking-wider">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Payment Information
                                  </span>
                                  <div className="text-xs text-cream-warm/85 font-sans space-y-1">
                                    <div className="flex justify-between">
                                      <span>Payment Method:</span>
                                      <span className="font-bold text-cream-warm capitalize">
                                        {order.paymentMethod === 'razorpay' ? 'Razorpay Online' : order.paymentMethod}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Payment Status:</span>
                                      <span className={`font-semibold uppercase ${order.paymentStatus === 'paid' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}`}>
                                        {order.paymentStatus || 'Pending'}
                                      </span>
                                    </div>
                                    {order.paymentId && (
                                      <div className="flex justify-between text-[11px] text-cream-warm/70">
                                        <span>Transaction Ref:</span>
                                        <span className="font-mono">{order.paymentId}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between pt-1 border-t border-gold-antique/15 text-sm font-bold text-gold-antique">
                                      <span>Total Paid:</span>
                                      <span>₹{order.total}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Bottom Card Actions */}
                            <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                              <a
                                href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
                                  `Namaste Chandra Naturals, I have an inquiry about my Order #${order.orderNumber}`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-cream-warm/70 hover:text-gold-antique font-sans font-semibold transition-colors"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Need help with this order? WhatsApp support</span>
                              </a>

                              <button
                                onClick={() => handleReorder(order)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-deep hover:bg-gold-antique hover:text-[#0F1D12] border border-gold-antique/40 text-cream-warm text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Re-order Items</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* TAB 2: PERSONAL DATA (NAME, EMAIL, PHONE)                         */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeTab === 'personal' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-forest-deep p-6 sm:p-8 rounded-2xl border border-gold-antique/25 shadow-md space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gold-antique/15">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl text-cream-warm font-bold flex items-center gap-2">
                        <User className="w-6 h-6 text-gold-antique" />
                        Personal Information
                      </h2>
                      <p className="text-xs text-cream-warm/70 font-sans mt-0.5">
                        Manage your contact details used for verification and order updates.
                      </p>
                    </div>

                    {!isEditingProfile ? (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-deep hover:bg-forest-moss/30 border border-gold-antique/40 text-gold-antique text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Details</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="inline-flex items-center gap-1.5 text-xs text-cream-warm/70 hover:text-cream-warm font-sans cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    /* Read-Only Profile Cards */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-forest-ink border border-gold-antique/20 space-y-1">
                        <span className="text-xs text-cream-warm/70 font-sans font-medium flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gold-antique" />
                          Full Name
                        </span>
                        <p className="font-serif text-base font-bold text-cream-warm">{user.name}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-forest-ink border border-gold-antique/20 space-y-1">
                        <span className="text-xs text-cream-warm/70 font-sans font-medium flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gold-antique" />
                          Email Address
                        </span>
                        <div className="flex items-center gap-2">
                          <p className="font-sans text-sm font-semibold text-cream-warm truncate">{user.email}</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                            Verified
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-forest-ink border border-gold-antique/20 space-y-1">
                        <span className="text-xs text-cream-warm/70 font-sans font-medium flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gold-antique" />
                          Mobile Number
                        </span>
                        <p className="font-sans text-sm font-semibold text-cream-warm">
                          +91 {user.phone || 'Not provided'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-forest-ink border border-gold-antique/20 space-y-1">
                        <span className="text-xs text-cream-warm/70 font-sans font-medium flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-gold-antique" />
                          Account Security
                        </span>
                        <p className="font-sans text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Two-factor OTP Protected
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Edit Profile Form */
                    <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                      <div>
                        <label className="block text-xs font-semibold text-cream-warm/85 mb-1.5 font-sans">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-cream-warm/85 mb-1.5 font-sans">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-sm text-cream-warm/60 font-mono">+91</span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={profileForm.phone}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                phone: e.target.value.replace(/\D/g, '')
                              })
                            }
                            className="w-full pl-14 pr-4 py-3 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none font-mono transition-colors"
                          />
                        </div>
                        <span className="text-[11px] text-cream-warm/70 mt-1 block">
                          Transactional order updates and delivery notifications will be sent to this number.
                        </span>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={profileSaving}
                          className="px-6 py-2.5 rounded-xl bg-gold-antique text-[#0F1D12] font-bold font-sans text-sm hover:bg-gold-champagne transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {profileSaving ? 'Saving Updates...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2.5 rounded-xl text-cream-warm/70 hover:text-cream-warm text-sm font-sans cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* TAB 3: SAVED ADDRESSES                                            */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header & Add button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-forest-deep p-5 rounded-2xl border border-gold-antique/25 shadow-md">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl text-cream-warm font-bold flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-gold-antique" />
                      Saved Delivery Addresses
                    </h2>
                    <p className="text-xs text-cream-warm/70 font-sans mt-0.5">
                      Store home and workplace addresses for instant 1-click checkout.
                    </p>
                  </div>

                  <button
                    onClick={openAddAddressModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-antique text-[#0F1D12] font-bold font-sans text-xs sm:text-sm hover:bg-gold-champagne transition-all shadow-md active:scale-95 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* Address Cards List */}
                {addressesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map(n => (
                      <div key={n} className="h-40 rounded-2xl bg-forest-deep border border-gold-antique/20 animate-pulse" />
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="rounded-3xl border border-gold-antique/25 bg-forest-deep p-12 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-gold-antique/15 border border-gold-antique/30 flex items-center justify-center text-gold-antique mx-auto">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl font-bold text-cream-warm">No Saved Addresses</h3>
                      <p className="text-cream-warm/70 text-sm max-w-md mx-auto">
                        You don't have any saved shipping destinations yet. Add an address now to save time on your next order.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={openAddAddressModal}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-antique text-[#0F1D12] font-bold font-sans text-sm hover:bg-gold-champagne transition-all shadow-lg active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Your First Address</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div
                        key={addr._id}
                        className={`rounded-2xl p-5 bg-forest-deep border transition-all flex flex-col justify-between shadow-sm ${addr.isDefault
                            ? 'border-gold-antique ring-1 ring-gold-antique/30 shadow-md'
                            : 'border-gold-antique/20 hover:border-gold-antique/40'
                          }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-forest-ink border border-gold-antique/30 text-gold-antique font-sans">
                              {addr.addressType === 'work' ? (
                                <Building2 className="w-3 h-3" />
                              ) : (
                                <Home className="w-3 h-3" />
                              )}
                              {addr.addressType || 'Home'}
                            </span>

                            {addr.isDefault && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                                <Check className="w-3 h-3" />
                                Default Address
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-serif text-base font-bold text-cream-warm">{addr.fullName}</h4>
                            <p className="text-xs text-cream-warm/85 font-sans leading-relaxed">
                              {addr.addressLine}
                              {addr.landmark && `, near ${addr.landmark}`}
                            </p>
                            <p className="text-xs text-cream-warm/85 font-sans">
                              {addr.city}, {addr.state} - <span className="font-mono font-bold text-gold-antique">{addr.pincode}</span>
                            </p>
                            <p className="text-xs text-cream-warm/70 font-sans pt-1">
                              Phone: <span className="font-mono text-cream-warm font-semibold">+91 {addr.phone}</span>
                            </p>
                          </div>
                        </div>

                        {/* Address Actions */}
                        <div className="pt-4 mt-4 border-t border-gold-antique/15 flex items-center justify-between gap-2">
                          {!addr.isDefault ? (
                            <button
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              className="text-xs text-cream-warm/70 hover:text-gold-antique font-sans font-semibold transition-colors cursor-pointer"
                            >
                              Make Default
                            </button>
                          ) : (
                            <span className="text-[11px] text-cream-warm/50 font-sans">Primary Destination</span>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditAddressModal(addr)}
                              className="p-2 rounded-lg bg-forest-ink hover:bg-forest-moss/40 text-cream-warm/80 hover:text-gold-antique transition-colors cursor-pointer"
                              title="Edit Address"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr._id)}
                              className="p-2 rounded-lg bg-forest-ink hover:bg-rose-500/15 text-cream-warm/70 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* TAB 4: CHANGE PASSWORD                                            */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-forest-deep p-6 sm:p-8 rounded-2xl border border-gold-antique/25 shadow-md space-y-6 max-w-xl">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl text-cream-warm font-bold flex items-center gap-2">
                      <Lock className="w-6 h-6 text-gold-antique" />
                      Change Password
                    </h2>
                    <p className="text-xs text-cream-warm/70 font-sans mt-0.5">
                      Ensure your account remains safe with a unique, secure password.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-semibold text-cream-warm/85 mb-1.5 font-sans">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none transition-colors pr-11 placeholder:text-cream-warm/40"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-3 text-cream-warm/60 hover:text-cream-warm cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-cream-warm/85 mb-1.5 font-sans">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none transition-colors pr-11 placeholder:text-cream-warm/40"
                          placeholder="Enter at least 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-3 text-cream-warm/60 hover:text-cream-warm cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Bar */}
                      {passwordForm.newPassword && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-1.5 h-1.5 w-full bg-gold-antique/25 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getPasswordStrength(passwordForm.newPassword).color
                                }`}
                              style={{
                                width: `${(getPasswordStrength(passwordForm.newPassword).score / 3) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-cream-warm/70 font-sans block text-right">
                            Strength: <strong className="text-cream-warm">{getPasswordStrength(passwordForm.newPassword).label}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-cream-warm/85 mb-1.5 font-sans">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none transition-colors pr-11 placeholder:text-cream-warm/40"
                          placeholder="Re-type your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3 text-cream-warm/60 hover:text-cream-warm cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gold-antique text-[#0F1D12] font-bold font-sans text-sm hover:bg-gold-champagne transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {passwordSaving ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT ADDRESS                                             */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-forest-deep border border-gold-antique/40 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gold-antique/20">
              <h3 className="font-serif text-xl font-bold text-cream-warm flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold-antique" />
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1 rounded-lg text-cream-warm/60 hover:text-cream-warm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cream-warm/85 mb-1 font-sans">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none placeholder:text-cream-warm/40"
                    placeholder="e.g. S. Meenakshi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-warm/85 mb-1 font-sans">
                    Mobile Phone *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-cream-warm/60 font-mono">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-12 pr-3 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none font-mono placeholder:text-cream-warm/40"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-warm/85 mb-1 font-sans">
                  Flat / House / Building & Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none placeholder:text-cream-warm/40"
                  placeholder="e.g. 42, Agrahara Street, Near Temple Pond"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-warm/85 mb-1 font-sans">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none placeholder:text-cream-warm/40"
                  placeholder="e.g. Opposite Banyan Tree"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cream-warm/85 mb-1 font-sans">City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none placeholder:text-cream-warm/40"
                    placeholder="e.g. Madurai"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-warm/85 mb-1 font-sans">State *</label>
                  <select
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none"
                  >
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st} className="bg-forest-deep text-cream-warm">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-warm/85 mb-1 font-sans">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/35 focus:border-gold-antique text-cream-warm text-sm outline-none font-mono placeholder:text-cream-warm/40"
                    placeholder="625001"
                  />
                </div>
              </div>

              {/* Address Type */}
              <div>
                <label className="block text-xs font-semibold text-cream-warm/85 mb-1.5 font-sans">
                  Address Type
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'home', label: 'Home', icon: Home },
                    { id: 'work', label: 'Work', icon: Building2 },
                    { id: 'other', label: 'Other', icon: MapPin }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, addressType: t.id })}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${addressForm.addressType === t.id
                          ? 'bg-gold-antique text-[#0F1D12] border-gold-antique font-bold shadow-sm'
                          : 'bg-forest-ink text-cream-warm/80 border-gold-antique/25 hover:border-gold-antique/50'
                        }`}
                    >
                      <t.icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-gold-antique bg-forest-ink border-gold-antique/40 focus:ring-0"
                />
                <span className="text-xs text-cream-warm/85 font-sans">
                  Set as default delivery address for rapid checkout
                </span>
              </label>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gold-antique/20">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-cream-warm/70 hover:text-cream-warm text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gold-antique text-[#0F1D12] font-bold font-sans text-xs hover:bg-gold-champagne transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {addressSubmitting ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MODAL: SIGN OUT CONFIRMATION                                          */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-forest-deep border border-gold-antique/40 p-6 sm:p-7 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-cream-warm">Sign Out of Chandra Naturals?</h3>
              <p className="text-xs text-cream-warm/70 font-sans">
                You will need to enter your credentials or verify OTP to sign back into your pantry account.
              </p>
            </div>

            <div className="pt-3 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-4 rounded-xl border border-gold-antique/30 hover:border-gold-antique text-cream-warm/80 text-xs font-semibold transition-colors cursor-pointer"
              >
                Keep Me In
              </button>
              <button
                onClick={handleConfirmLogout}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md active:scale-95 cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
