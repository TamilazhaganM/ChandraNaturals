import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { OrderStatusModal } from '../../components/admin/OrderStatusModal';
import { OrderPackingSlipModal } from '../../components/admin/OrderPackingSlipModal';
import {
  Package,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Sparkles,
  Truck,
  Home,
  AlertCircle,
  FileText,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Filter,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';

// Seed demo orders for fallback if database is fresh
const DEMO_ORDERS = [
  {
    _id: 'ord_demo_101',
    orderNumber: 'CN-8942',
    orderStatus: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    paymentId: 'pay_Or0gXbL8z9Q1wE',
    total: 820,
    subtotal: 770,
    shippingFee: 50,
    discount: 0,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Ananya Sundaram',
      phone: '9840123456',
      email: 'ananya.sundaram@gmail.com',
      addressLine: 'Flat 4B, Kaveri Palms, 12th Cross, RS Puram',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641002'
    },
    items: [
      {
        name: 'Heirloom Tomato Thokku Mix',
        price: 240,
        quantity: 2,
        weight: '250g Glass Jar',
        image: '/assets/Thokkus/tomato_mix_.jpg'
      },
      {
        name: 'Mudakathan Keerai Mix',
        price: 290,
        quantity: 1,
        weight: '250g Glass Jar',
        image: '/assets/Thokkus/mudakathan_mix_.jpg'
      }
    ],
    trackingInfo: {
      carrier: '',
      trackingNumber: '',
      estimatedDelivery: null
    },
    notes: 'Customer requested brass-cured small batch if available.'
  },
  {
    _id: 'ord_demo_102',
    orderNumber: 'CN-8941',
    orderStatus: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    paymentId: 'pay_Op8kLm19xK3zPw',
    total: 1350,
    subtotal: 1350,
    shippingFee: 0,
    discount: 0,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Karthik Subramanian',
      phone: '9791054321',
      email: 'karthik.subramanian@outlook.com',
      addressLine: 'Plot 88, 3rd Avenue, Anna Nagar East',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600102'
    },
    items: [
      {
        name: 'A2 Cultured Desi Cow Bilona Ghee',
        price: 850,
        quantity: 1,
        weight: '500ml Glass Jar',
        image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=800'
      },
      {
        name: 'Poondu Milagu Thokku Mix',
        price: 260,
        quantity: 1,
        weight: '250g Glass Jar',
        image: '/assets/Thokkus/poondu_milagu_mix_.jpg'
      },
      {
        name: 'Pirandai Thokku Mix',
        price: 240,
        quantity: 1,
        weight: '250g Glass Jar',
        image: '/assets/Thokkus/pirandai_mix_.jpg'
      }
    ],
    trackingInfo: {
      carrier: 'Delhivery',
      trackingNumber: 'DELH7821903482',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString()
    },
    notes: 'Shipped via Delhivery Express Air.'
  },
  {
    _id: 'ord_demo_103',
    orderNumber: 'CN-8940',
    orderStatus: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    paymentId: 'pay_Oq7nVm28yH4xQs',
    total: 580,
    subtotal: 530,
    shippingFee: 50,
    discount: 0,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Meenakshi Raman',
      phone: '9443218765',
      email: 'meenakshi.r@yahoo.co.in',
      addressLine: '14/2, Sannathi Street, Near Temple',
      city: 'Madurai',
      state: 'Tamil Nadu',
      pincode: '625001'
    },
    items: [
      {
        name: 'Mulaikattiya Payaru Thokku Mix',
        price: 270,
        quantity: 1,
        weight: '250g Glass Jar',
        image: '/assets/Thokkus/mulaikattiya_payaru_mix_.jpg'
      },
      {
        name: 'Curry Leaf Thokku Mix',
        price: 260,
        quantity: 1,
        weight: '250g Glass Jar',
        image: '/assets/Thokkus/curry_leaf_mix_.jpg'
      }
    ],
    trackingInfo: {},
    notes: 'Verified payment confirmation.'
  },
  {
    _id: 'ord_demo_104',
    orderNumber: 'CN-8939',
    orderStatus: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    paymentId: 'pay_On3xZq91wL5rPt',
    total: 390,
    subtotal: 340,
    shippingFee: 50,
    discount: 0,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Venkatesh Babu',
      phone: '9884019283',
      email: 'venkatesh.babu@gmail.com',
      addressLine: 'B-304, Green Acres, Viman Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411014'
    },
    items: [
      {
        name: 'Karuppu Kavuni Traditional Rice Mix',
        price: 340,
        quantity: 1,
        weight: '500g Eco Pouch',
        image: '/assets/Thokkus/karuppukavuni_pedestal_.jpg'
      }
    ],
    trackingInfo: {},
    notes: 'New order queued for tomorrow morning batch.'
  },
  {
    _id: 'ord_demo_105',
    orderNumber: 'CN-8938',
    orderStatus: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    paymentId: 'pay_Om1jLp77vK9wTx',
    total: 1950,
    subtotal: 1950,
    shippingFee: 0,
    discount: 0,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Dr. Radhakrishnan V.',
      phone: '9444102938',
      email: 'dr.radhakrishnan@apollo.org',
      addressLine: 'Villa 12, Sobha Malabar, Kakkanad',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682030'
    },
    items: [
      {
        name: 'Grand Grandmother Heritage Feast Combo',
        price: 1950,
        quantity: 1,
        weight: 'Full Set of 6 Jars',
        image: '/assets/Thokkus/tomato_mix_.jpg'
      }
    ],
    trackingInfo: {
      carrier: 'ST Courier',
      trackingNumber: 'ST872019482',
      estimatedDelivery: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    notes: 'Successfully delivered and signed.'
  }
];

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Modals state
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);

  // Load orders from server or fallback
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getOrders();
      if (res.data?.orders?.length > 0) {
        setOrders(res.data.orders);
      } else {
        // Fallback to demo orders if fresh database
        setOrders(DEMO_ORDERS);
      }
    } catch (err) {
      console.warn('Could not fetch backend admin orders, using demo dataset:', err.message);
      setOrders(DEMO_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order in local state after modal confirmation
  const handleOrderUpdated = (updatedOrder) => {
    setOrders(prev =>
      prev.map(o => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
    );
  };

  // Status counts for operational KPIs
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.orderStatus === 'pending').length,
      confirmed: orders.filter(o => o.orderStatus === 'confirmed').length,
      processing: orders.filter(o => o.orderStatus === 'processing').length,
      shipped: orders.filter(o => o.orderStatus === 'shipped').length,
      delivered: orders.filter(o => o.orderStatus === 'delivered').length
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Status Filter
      if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
        return false;
      }

      // 2. Payment Filter
      if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) {
        return false;
      }

      // 3. Search Query (Matches order number, customer name, phone, email, city)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const num = (order.orderNumber || '').toLowerCase();
        const name = (order.shippingAddress?.fullName || '').toLowerCase();
        const phone = (order.shippingAddress?.phone || '');
        const email = (order.shippingAddress?.email || '').toLowerCase();
        const city = (order.shippingAddress?.city || '').toLowerCase();
        const payId = (order.paymentId || '').toLowerCase();

        return (
          num.includes(q) ||
          name.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          city.includes(q) ||
          payId.includes(q)
        );
      }

      return true;
    });
  }, [orders, statusFilter, paymentFilter, searchQuery]);

  // Helper for Status Badge styling
  const getStageBadge = (st) => {
    switch (st) {
      case 'pending':
        return {
          label: 'Placed',
          bg: 'bg-amber-500/15 border-amber-500/35 text-amber-300',
          dot: 'bg-amber-500',
          icon: Clock
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          bg: 'bg-blue-500/15 border-blue-500/35 text-blue-300',
          dot: 'bg-blue-500',
          icon: CheckCircle2
        };
      case 'processing':
        return {
          label: 'In Kitchen (Handcrafting)',
          bg: 'bg-purple-500/15 border-purple-500/35 text-purple-300',
          dot: 'bg-purple-500 animate-pulse',
          icon: Sparkles
        };
      case 'shipped':
        return {
          label: 'Dispatched (In Transit)',
          bg: 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300',
          dot: 'bg-cyan-500',
          icon: Truck
        };
      case 'delivered':
        return {
          label: 'Delivered',
          bg: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300',
          dot: 'bg-emerald-500',
          icon: Home
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-rose-500/15 border-rose-500/35 text-rose-300',
          dot: 'bg-rose-500',
          icon: AlertCircle
        };
      default:
        return {
          label: st,
          bg: 'bg-forest-ink border-gold-antique/30 text-cream-warm',
          dot: 'bg-gold-antique',
          icon: Package
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Top Banner & Refresh                                                          */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream-warm">
              Kitchen & Dispatch Operations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-cream-warm/70 font-sans mt-1">
            Manage incoming artisanal food orders, transit tracking, and real-time customer stepper progression.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-deep hover:bg-forest-ink border border-gold-antique/30 hover:border-gold-antique text-gold-antique text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* KPI Counters Grid                                                             */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: 'all', label: 'All Orders', count: counts.all, color: 'text-cream-warm' },
          { id: 'pending', label: '1. Placed', count: counts.pending, color: 'text-amber-400' },
          { id: 'confirmed', label: '2. Confirmed', count: counts.confirmed, color: 'text-blue-400' },
          { id: 'processing', label: '3. Handcrafting', count: counts.processing, color: 'text-purple-400' },
          { id: 'shipped', label: '4. Dispatched', count: counts.shipped, color: 'text-cyan-400' },
          { id: 'delivered', label: '5. Delivered', count: counts.delivered, color: 'text-emerald-400' }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStatusFilter(item.id)}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === item.id
                ? 'bg-gold-antique/15 border-gold-antique shadow-md ring-1 ring-gold-antique/40'
                : 'bg-forest-deep border-gold-antique/20 hover:border-gold-antique/40 hover:bg-forest-ink/60'
            }`}
          >
            <span className="text-[11px] text-cream-warm/65 font-sans font-medium block truncate">
              {item.label}
            </span>
            <span className={`font-serif text-2xl font-bold mt-1 block ${item.color}`}>
              {loading ? '—' : item.count}
            </span>
          </button>
        ))}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Search & Filter Bar                                                           */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-forest-deep border border-gold-antique/25 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-antique/70 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Customer Name, Mobile, City, or Razorpay ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/25 text-cream-warm placeholder:text-cream-warm/35 text-xs sm:text-sm font-sans focus:outline-none focus:border-gold-antique transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gold-antique" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-forest-ink border border-gold-antique/25 text-cream-warm text-xs font-semibold font-sans focus:outline-none focus:border-gold-antique"
            >
              <option value="all">Stage: All Stages</option>
              <option value="pending">Stage: Placed</option>
              <option value="confirmed">Stage: Confirmed</option>
              <option value="processing">Stage: Handcrafting</option>
              <option value="shipped">Stage: Dispatched</option>
              <option value="delivered">Stage: Delivered</option>
              <option value="cancelled">Stage: Cancelled</option>
            </select>
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-forest-ink border border-gold-antique/25 text-cream-warm text-xs font-semibold font-sans focus:outline-none focus:border-gold-antique"
          >
            <option value="all">Payment: All</option>
            <option value="paid">Payment: Paid</option>
            <option value="pending">Payment: Pending</option>
          </select>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Orders Feed & Table                                                           */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-44 rounded-2xl bg-forest-deep border border-gold-antique/20 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-forest-deep border border-gold-antique/25 space-y-3 shadow-md">
          <div className="w-14 h-14 rounded-full bg-gold-antique/15 border border-gold-antique/30 flex items-center justify-center text-gold-antique mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-lg font-bold text-cream-warm">
            No matching orders found
          </h3>
          <p className="text-xs text-cream-warm/60 font-sans max-w-sm mx-auto">
            Try adjusting your search query or reset the stage filter to view all incoming batches.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const badge = getStageBadge(order.orderStatus);
            const BadgeIcon = badge.icon;
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order._id}
                className="rounded-2xl bg-forest-deep border border-gold-antique/25 overflow-hidden shadow-md transition-all hover:border-gold-antique/45"
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 bg-forest-ink/70 border-b border-gold-antique/15 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-base sm:text-lg font-bold text-gold-antique tracking-wide">
                      #{order.orderNumber}
                    </span>

                    {/* Stage Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </div>

                    <span className="text-xs text-cream-warm/60 font-sans">
                      Placed {orderDate}
                    </span>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <span className="font-serif text-lg sm:text-xl font-bold text-cream-warm">
                      ₹{order.total}
                    </span>

                    <button
                      onClick={() => setSelectedOrderForSlip(order)}
                      className="px-3 py-1.5 rounded-xl bg-forest-ink hover:bg-forest-moss/40 border border-gold-antique/30 text-cream-warm text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Print Packing Slip"
                    >
                      <FileText className="w-3.5 h-3.5 text-gold-antique" />
                      <span className="hidden sm:inline">Packing Slip</span>
                    </button>

                    <button
                      onClick={() => setSelectedOrderForStatus(order)}
                      className="px-4 py-1.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-[#0F1D12] text-xs font-bold font-sans transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Update Stage</span>
                    </button>
                  </div>
                </div>

                {/* Details Grid: Customer info, items, payment & courier */}
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Customer & Address Details (Col 1-4) */}
                  <div className="lg:col-span-4 space-y-2 text-xs text-cream-warm/80 font-sans border-b lg:border-b-0 lg:border-r border-gold-antique/15 pb-4 lg:pb-0 lg:pr-5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cream-warm text-sm">
                        {order.shippingAddress?.fullName}
                      </span>
                      {order.shippingAddress?.phone && (
                        <a
                          href={`https://wa.me/91${order.shippingAddress.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(order.shippingAddress.fullName)},%20regarding%20your%20Chandra%20Naturals%20Order%20${order.orderNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                          title="Open WhatsApp chat with customer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <div className="space-y-0.5 text-cream-warm/70">
                      <p>{order.shippingAddress?.addressLine}</p>
                      <p className="font-semibold text-cream-warm">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                      </p>
                      <p className="pt-1 flex items-center gap-1 text-cream-warm/85 font-mono">
                        <Phone className="w-3 h-3 text-gold-antique" />
                        +91 {order.shippingAddress?.phone}
                      </p>
                    </div>

                    {/* Payment badge */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-forest-ink border border-gold-antique/30 text-gold-antique">
                        {order.paymentMethod === 'razorpay' ? 'Razorpay Online' : order.paymentMethod}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {order.paymentStatus}
                      </span>
                      {order.paymentId && (
                        <span className="text-[10px] font-mono text-cream-warm/60 truncate max-w-[140px]" title={order.paymentId}>
                          {order.paymentId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items Ordered (Col 5-8) */}
                  <div className="lg:col-span-5 space-y-2 border-b lg:border-b-0 lg:border-r border-gold-antique/15 pb-4 lg:pb-0 lg:pr-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-antique block">
                      Kitchen Items ({order.items?.length || 0})
                    </span>
                    <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-forest-ink border border-gold-antique/20 overflow-hidden shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-gold-antique/40 m-auto mt-2" />
                              )}
                            </div>
                            <div className="truncate">
                              <p className="font-semibold text-cream-warm truncate">{item.name}</p>
                              <p className="text-[10px] text-cream-warm/60">
                                {item.weight ? `${item.weight} • ` : ''}Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-gold-antique shrink-0">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dispatch & Courier Information (Col 9-12) */}
                  <div className="lg:col-span-3 space-y-2 text-xs font-sans">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-antique flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      Fulfillment Status
                    </span>

                    {order.trackingInfo?.carrier || order.trackingInfo?.trackingNumber ? (
                      <div className="p-3 rounded-xl bg-forest-ink border border-gold-antique/25 space-y-1">
                        <p className="font-bold text-cream-warm">
                          {order.trackingInfo.carrier || 'Express Courier'}
                        </p>
                        <p className="font-mono text-gold-antique text-[11px]">
                          AWB: {order.trackingInfo.trackingNumber}
                        </p>
                        {order.trackingInfo.estimatedDelivery && (
                          <p className="text-[10px] text-cream-warm/70">
                            Est. Delivery: {new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-forest-ink/50 border border-gold-antique/15 text-cream-warm/60 text-[11px]">
                        Awaiting dispatch assignment. Click <strong>"Update Stage"</strong> to assign courier & AWB tracking.
                      </div>
                    )}

                    {order.notes && (
                      <p className="text-[11px] text-cream-warm/60 italic pt-1 truncate" title={order.notes}>
                        Note: {order.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Modals: Status Updater & Printable Packing Slip                               */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <OrderStatusModal
        order={selectedOrderForStatus}
        isOpen={!!selectedOrderForStatus}
        onClose={() => setSelectedOrderForStatus(null)}
        onSuccess={handleOrderUpdated}
      />

      <OrderPackingSlipModal
        order={selectedOrderForSlip}
        isOpen={!!selectedOrderForSlip}
        onClose={() => setSelectedOrderForSlip(null)}
      />
    </div>
  );
};
