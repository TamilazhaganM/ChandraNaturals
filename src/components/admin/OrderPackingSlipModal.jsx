import React, { useEffect } from 'react';
import { X, Printer, Package, MapPin, ShieldCheck, Check, Sparkles, Building2, Phone, Calendar } from 'lucide-react';

export const OrderPackingSlipModal = ({ order, isOpen, onClose }) => {
  // Listen for Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      {/* Explicit Print Stylesheet for 100% Cross-Browser Isolation */}
      <style>{`
        @media print {
          /* Hide everything in the document by default */
          body * {
            visibility: hidden !important;
          }

          /* Make printable packing slip and all its children visible */
          #printable-packing-slip,
          #printable-packing-slip * {
            visibility: visible !important;
          }

          /* Force printable container to occupy full page */
          #printable-packing-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #111827 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            z-index: 999999 !important;
          }

          /* Hide control buttons and modal header in print */
          .slip-no-print {
            display: none !important;
          }

          /* Force high contrast print text & borders */
          .print-border {
            border-color: #d1d5db !important;
          }
          .print-bg-light {
            background-color: #f9fafb !important;
          }
          .print-text-dark {
            color: #111827 !important;
          }
          .print-text-muted {
            color: #4b5563 !important;
          }
        }
      `}</style>

      {/* Modal Backdrop & Outer Container (Click backdrop to close) */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in slip-no-print cursor-pointer"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-forest-deep border border-gold-antique/35 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] cursor-default"
        >
          {/* Modal Actions Bar (On-Screen Controls) */}
          <div className="p-4 sm:p-5 border-b border-gold-antique/20 bg-forest-ink/90 flex items-center justify-between slip-no-print">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-antique/15 border border-gold-antique/30 flex items-center justify-center text-gold-antique">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif text-sm sm:text-base font-bold text-cream-warm block">
                  Kitchen Packing Slip & Dispatch Manifest
                </span>
                <span className="text-[11px] text-cream-warm/60 font-sans">
                  Official dispatch manifest for Order #{order.orderNumber}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gold-antique hover:bg-gold-champagne text-[#0F1D12] text-xs font-bold font-sans transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print Packing Slip</span>
                <span className="sm:hidden">Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest-ink hover:bg-rose-500/20 text-cream-warm hover:text-rose-300 border border-gold-antique/40 hover:border-rose-400 transition-all cursor-pointer shadow-sm group"
                aria-label="Close packing slip"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 text-cream-warm group-hover:text-rose-400 stroke-[2.5]" />
                <span className="text-xs font-bold font-sans">Close</span>
              </button>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────────────────────── */}
          {/* Authentic High-Contrast Physical Document Container                           */}
          {/* Designed to look like a premium crisp paper manifest on both themes & print   */}
          {/* ───────────────────────────────────────────────────────────────────────────── */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-forest-ink/50">
            <div
              id="printable-packing-slip"
              className="bg-[#FFFDF9] text-[#1E2922] p-6 sm:p-8 rounded-2xl border-2 border-[#C9A24E]/40 shadow-xl space-y-6 font-sans select-text"
            >
              {/* Slip Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#C9A24E]/30 print-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#8A5A2E] tracking-wide">
                      Chandra Naturals
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C9A24E]/15 text-[#8A5A2E] border border-[#C9A24E]/40">
                      Kitchen Packing Slip
                    </span>
                  </div>
                  <p className="text-xs text-[#3D4D40] font-sans font-medium">
                    Heirloom Traditional Recipes • Stone-Milled Premixes • Brass-Simmered Relishes
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#556658]">
                    <span>FSSAI Lic: <strong>22423588000142</strong></span>
                    <span>•</span>
                    <span>Coimbatore, Tamil Nadu</span>
                    <span>•</span>
                    <span>Support: chandranaturals1@gmail.com</span>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1 bg-[#F5EFE1] p-3 rounded-xl border border-[#C9A24E]/30 print-bg-light">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A5A2E] block">
                    Order Reference
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-[#0F1D12] block">
                    #{order.orderNumber}
                  </span>
                  <p className="text-[11px] text-[#556658]">
                    Date: <strong>{orderDate}</strong>
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#0F1D12] text-[#FFFDF9]">
                    Stage: {order.orderStatus?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Consignee & Payment 2-Column Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipping Delivery Address */}
                <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#E5DEC9] print-bg-light print-border space-y-1.5 text-xs">
                  <span className="font-bold text-[#8A5A2E] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Delivery Consignee Details
                  </span>
                  <p className="font-bold text-sm text-[#0F1D12]">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p className="text-[#334438] leading-relaxed">
                    {order.shippingAddress?.addressLine}
                    {order.shippingAddress?.landmark ? `, Near ${order.shippingAddress.landmark}` : ''}
                  </p>
                  <p className="text-[#0F1D12] font-semibold">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                  <p className="text-[#334438] font-mono pt-1">
                    Phone: <strong>+91 {order.shippingAddress?.phone}</strong>
                  </p>
                </div>

                {/* Dispatch & Payment Verification */}
                <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#E5DEC9] print-bg-light print-border space-y-1.5 text-xs">
                  <span className="font-bold text-[#8A5A2E] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Payment & Courier Verification
                  </span>
                  <div className="space-y-1 text-[#334438]">
                    <div className="flex justify-between">
                      <span className="text-[#66776B]">Payment Method:</span>
                      <strong className="text-[#0F1D12] capitalize">
                        {order.paymentMethod === 'razorpay' ? 'Razorpay Online Prepaid' : order.paymentMethod}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#66776B]">Payment Status:</span>
                      <strong className="text-emerald-700 uppercase font-bold">
                        {order.paymentStatus || 'PAID'}
                      </strong>
                    </div>
                    {order.paymentId && (
                      <div className="flex justify-between">
                        <span className="text-[#66776B]">Transaction ID:</span>
                        <span className="font-mono text-[#0F1D12] font-semibold text-[11px]">
                          {order.paymentId}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1.5 border-t border-[#E5DEC9] print-border">
                      <span className="text-[#66776B]">Courier / AWB:</span>
                      <strong className="text-[#8A5A2E]">
                        {order.trackingInfo?.carrier ? `${order.trackingInfo.carrier} #${order.trackingInfo.trackingNumber || 'Pending'}` : 'Handcrafted • Awaiting Dispatch'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kitchen Checklist Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8A5A2E] uppercase tracking-wider">
                    Kitchen Packing Checklist & Quality Inspection
                  </span>
                  <span className="text-[11px] text-[#66776B] italic">
                    Pack with food-safe air-cushioning for glass jars
                  </span>
                </div>

                <div className="border-2 border-[#E5DEC9] print-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F0EBE0] text-[#334438] font-bold border-b border-[#E5DEC9] print-bg-light print-border">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-12">Packed</th>
                        <th className="py-2.5 px-4">Artisanal Product Name</th>
                        <th className="py-2.5 px-4 text-center">Pack Size</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DEC9] print-border">
                      {order.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F9F7F2]">
                          <td className="py-3 px-3 text-center">
                            <div className="w-4 h-4 rounded border-2 border-[#8A5A2E] mx-auto bg-white" />
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-sm text-[#0F1D12]">
                              {item.name}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-center text-[#445548]">
                            {item.weight || 'Standard Jar'}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#0F1D12] text-sm">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-[#445548]">
                            ₹{item.price}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#0F1D12]">
                            ₹{item.subtotal || item.price * item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Total & Sign-Off */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pt-2 border-t-2 border-[#C9A24E]/30 print-border">
                {/* Kitchen Quality Assurance Signature */}
                <div className="text-xs space-y-1 text-[#556658]">
                  <p>Packed by: ________________________</p>
                  <p>Quality Checked: ____________________</p>
                  <p className="text-[10px] text-[#77887B] italic">
                    Seal inspected: 100% Preservative Free & Tamper Evident
                  </p>
                </div>

                {/* Totals Table */}
                <div className="w-64 space-y-1.5 text-xs text-[#334438] bg-[#F8F6F0] p-3.5 rounded-xl border border-[#E5DEC9] print-bg-light print-border">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-[#0F1D12]">₹{order.subtotal || order.total}</span>
                  </div>
                  {order.shippingFee > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping & Protective Packaging:</span>
                      <span className="font-semibold text-[#0F1D12]">₹{order.shippingFee}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount:</span>
                      <span>-₹{order.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#E5DEC9] print-border text-sm font-bold text-[#0F1D12]">
                    <span>Total Bill Paid:</span>
                    <span className="text-[#8A5A2E] text-base">₹{order.total}</span>
                  </div>
                </div>
              </div>

              {/* Packing Slip Bottom Quote */}
              <div className="pt-3 border-t border-[#E5DEC9] print-border text-center space-y-0.5">
                <p className="text-xs font-serif italic text-[#8A5A2E]">
                  "Crafted with heirloom dedication in Coimbatore. Thank you for supporting native artisanal agriculture."
                </p>
                <p className="text-[10px] text-[#77887B]">
                  For queries or transit damage replacement, WhatsApp +91 73588 08966 or write to chandranaturals1@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Modal Bottom Actions Bar (Slip-no-print) */}
          <div className="p-4 sm:p-5 border-t border-gold-antique/20 bg-forest-ink/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 slip-no-print">
            <span className="text-xs text-cream-warm/70 font-sans hidden sm:block">
              Tip: Press <strong>Esc</strong> on your keyboard or click outside to dismiss this slip.
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-[#0F1D12] text-xs sm:text-sm font-bold font-sans transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest-deep hover:bg-rose-500/20 border border-gold-antique/40 hover:border-rose-400 text-xs sm:text-sm font-bold text-cream-warm hover:text-rose-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Close Window</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
