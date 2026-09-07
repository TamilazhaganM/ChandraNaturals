import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Truck,
  Home,
  AlertTriangle,
  Send,
  ExternalLink,
  Calendar,
  FileText
} from 'lucide-react';

const STAGES = [
  {
    id: 'pending',
    title: 'Placed',
    subtitle: 'Order received & payment verified',
    icon: Clock,
    color: 'amber'
  },
  {
    id: 'confirmed',
    title: 'Confirmed',
    subtitle: 'Accepted into kitchen schedule',
    icon: CheckCircle2,
    color: 'blue'
  },
  {
    id: 'processing',
    title: 'Handcrafting',
    subtitle: 'Stone-milling, slow-simmering & glass packing',
    icon: Sparkles,
    color: 'purple'
  },
  {
    id: 'shipped',
    title: 'Dispatched',
    subtitle: 'Handed over to courier with tracking',
    icon: Truck,
    color: 'emerald'
  },
  {
    id: 'delivered',
    title: 'Delivered',
    subtitle: 'Safely arrived at customer doorstep',
    icon: Home,
    color: 'emerald'
  }
];

const POPULAR_CARRIERS = [
  { name: 'Delhivery', trackingUrl: (awb) => `https://www.delhivery.com/track/package/${awb}` },
  { name: 'ST Courier', trackingUrl: (awb) => `https://stcourier.com/tracking?awb=${awb}` },
  { name: 'Blue Dart', trackingUrl: (awb) => `https://www.bluedart.com/tracking?numbers=${awb}` },
  { name: 'DTDC', trackingUrl: (awb) => `https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno=${awb}` },
  { name: 'India Post (Speed Post)', trackingUrl: (awb) => `https://www.indiapost.gov.in/_layouts/15/dpt.cpt.tracking/trackconsignment.aspx?tracknumber=${awb}` },
  { name: 'The Professional Couriers', trackingUrl: (awb) => `https://www.tpcindia.com/track.aspx?awb=${awb}` },
  { name: 'Dunzo / Local Courier', trackingUrl: () => '' },
  { name: 'Other Express', trackingUrl: () => '' }
];

export const OrderStatusModal = ({ order, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !order) return null;

  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus || 'pending');
  const [carrier, setCarrier] = useState(order.trackingInfo?.carrier || 'Delhivery');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingInfo?.trackingNumber || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.trackingInfo?.estimatedDelivery
      ? new Date(order.trackingInfo.estimatedDelivery).toISOString().split('T')[0]
      : ''
  );
  const [notes, setNotes] = useState(order.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form when order changes
  useEffect(() => {
    if (order) {
      setSelectedStatus(order.orderStatus || 'pending');
      setCarrier(order.trackingInfo?.carrier || 'Delhivery');
      setTrackingNumber(order.trackingInfo?.trackingNumber || '');
      setEstimatedDelivery(
        order.trackingInfo?.estimatedDelivery
          ? new Date(order.trackingInfo.estimatedDelivery).toISOString().split('T')[0]
          : ''
      );
      setNotes(order.notes || '');
      setErrorMsg('');
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        status: selectedStatus,
        carrier: carrier.trim(),
        trackingNumber: trackingNumber.trim(),
        estimatedDelivery: estimatedDelivery || undefined,
        notes: notes.trim()
      };

      const res = await adminAPI.updateOrderStatus(order._id, payload);
      setSubmitting(false);

      if (res.data?.order) {
        onSuccess(res.data.order);
        onClose();
      } else {
        // Optimistic update fallback
        const updated = {
          ...order,
          orderStatus: selectedStatus,
          trackingInfo: {
            ...order.trackingInfo,
            carrier: carrier.trim(),
            trackingNumber: trackingNumber.trim(),
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : order.trackingInfo?.estimatedDelivery
          },
          notes: notes.trim()
        };
        onSuccess(updated);
        onClose();
      }
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Failed to update order fulfillment status.');
    }
  };

  const currentStageIndex = STAGES.findIndex(s => s.id === selectedStatus);

  // Listen for Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-forest-deep border border-gold-antique/35 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-gold-antique/20 bg-forest-ink/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm sm:text-base font-bold text-gold-antique tracking-wide">
                Order #{order.orderNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-forest-ink border border-gold-antique/30 text-cream-warm/70 font-sans">
                {order.shippingAddress?.fullName}
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-cream-warm">
              Fulfillment & Kitchen Stage Updater
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest-ink hover:bg-rose-500/20 text-cream-warm hover:text-rose-300 border border-gold-antique/40 hover:border-rose-400 transition-all cursor-pointer shadow-sm group"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <X className="w-4 h-4 text-cream-warm group-hover:text-rose-400 stroke-[2.5]" />
            <span className="text-xs font-bold font-sans">Close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-sans flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 5-Stage Stepper Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gold-antique font-sans uppercase tracking-wider block">
              Fulfillment Pipeline Stage (Click to select)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isSelected = selectedStatus === stage.id;
                const isPassed = currentStageIndex >= idx;

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setSelectedStatus(stage.id)}
                    className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gold-antique text-[#0F1D12] border-gold-antique font-bold shadow-md ring-2 ring-gold-antique/40'
                        : isPassed
                        ? 'bg-forest-ink/90 border-gold-antique/40 text-cream-warm hover:border-gold-antique'
                        : 'bg-forest-ink/40 border-gold-antique/20 text-cream-warm/50 hover:text-cream-warm/80'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#0F1D12] text-gold-antique'
                          : 'bg-forest-deep text-gold-antique border border-gold-antique/30'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left sm:text-center min-w-0">
                      <span className="block text-xs font-bold leading-tight truncate">
                        {stage.title}
                      </span>
                      <span className="text-[10px] hidden sm:block text-current opacity-70 leading-tight mt-0.5">
                        Step {idx + 1}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Dispatch / Courier Information Section */}
          {(selectedStatus === 'shipped' || selectedStatus === 'delivered') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-forest-ink/80 border border-gold-antique/30 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-gold-antique">
                <Truck className="w-4 h-4" />
                <span className="text-xs font-bold font-sans uppercase tracking-wider">
                  Courier Consignment & Tracking Info (Dispatched)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Carrier Partner */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-cream-warm/80 font-sans block">
                    Courier Partner Name
                  </label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-deep border border-gold-antique/30 text-cream-warm text-xs sm:text-sm font-sans focus:outline-none focus:border-gold-antique"
                  >
                    {POPULAR_CARRIERS.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AWB / Tracking ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-cream-warm/80 font-sans block">
                    Tracking Number / AWB
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DELH981273910"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-deep border border-gold-antique/30 text-cream-warm text-xs sm:text-sm font-sans placeholder:text-cream-warm/30 focus:outline-none focus:border-gold-antique"
                  />
                </div>

                {/* Estimated Delivery Date */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-cream-warm/80 font-sans flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-antique" />
                    Estimated Doorstep Delivery Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-deep border border-gold-antique/30 text-cream-warm text-xs sm:text-sm font-sans focus:outline-none focus:border-gold-antique"
                  />
                </div>
              </div>

              {/* Preview of customer tracking link */}
              {trackingNumber && (
                <div className="pt-2 text-[11px] text-cream-warm/70 flex items-center gap-2">
                  <span className="font-semibold text-gold-antique">Customer view:</span>
                  <span>Tracking with {carrier} #{trackingNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Option */}
          {selectedStatus !== 'cancelled' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-forest-ink/40 border border-gold-antique/20">
              <span className="text-xs text-cream-warm/70 font-sans">
                Need to cancel this order due to kitchen stock outage or customer request?
              </span>
              <button
                type="button"
                onClick={() => setSelectedStatus('cancelled')}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                Mark as Cancelled
              </button>
            </div>
          )}

          {selectedStatus === 'cancelled' && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs font-sans uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Order Cancellation Confirmation</span>
              </div>
              <p className="text-xs text-cream-warm/80">
                Marking this order as cancelled will automatically restore reserved stock to inventory and update the customer's account view.
              </p>
            </div>
          )}

          {/* Fulfillment & Kitchen Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cream-warm/80 font-sans flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gold-antique" />
              Kitchen & Dispatch Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Batch #TM-08 slow-cooked on iron tawa, sealed with tamper proof strip."
              className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 text-cream-warm text-xs sm:text-sm font-sans placeholder:text-cream-warm/30 focus:outline-none focus:border-gold-antique"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-gold-antique/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-forest-ink hover:bg-forest-moss/40 border border-gold-antique/30 text-xs sm:text-sm font-semibold text-cream-warm transition-colors cursor-pointer"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-[#0F1D12] text-xs sm:text-sm font-bold font-sans transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0F1D12] border-t-transparent rounded-full animate-spin" />
                  <span>Updating Stage...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Update Order & Stepper</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
