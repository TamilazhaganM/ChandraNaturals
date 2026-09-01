import React, { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { VegMark } from '../common/VegMark';
import { X, Plus, Minus, Trash2, CreditCard, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export const OrderSummaryDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    itemCount,
    totalSavings,
    setIsCustomerFormOpen
  } = useCart();

  // Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleProceedToDetails = () => {
    setIsCartOpen(false);
    setIsCustomerFormOpen(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-summary-title"
      className="fixed inset-0 z-50 flex justify-end bg-forest-ink/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsCartOpen(false)}
    >
      {/* Slide-over Drawer Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-forest-deep border-l-2 border-gold-antique/40 shadow-2xl flex flex-col justify-between text-cream-warm animate-fade-in relative"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-gold-antique/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-gold-antique" />
            <div>
              <h2 id="order-summary-title" className="font-fraunces text-xl font-bold">
                Your Order
              </h2>
              <span className="text-xs text-cream-warm/75 font-sans">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-cream-warm/60 hover:text-red-400 transition-colors uppercase tracking-wider font-semibold mr-1 font-sans cursor-pointer"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              aria-label="Close order summary"
              className="p-2 rounded-full bg-forest-ink text-cream-warm hover:text-gold-antique border border-gold-antique/30 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Items Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-forest-ink flex items-center justify-center text-gold-antique border border-gold-antique/30">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="font-fraunces text-lg font-bold">Your order is empty</h3>
                <p className="text-xs text-cream-warm/75 max-w-xs font-sans">
                  Browse our handcrafted thokkus, A2 ghee, and wellness mixes to add your favorites.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  const el = document.querySelector('#thokku');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-2.5 rounded-xl bg-gold-antique text-forest-ink font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Explore Thokku
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-xl bg-forest-ink/70 border border-gold-antique/25 flex items-center gap-3.5 group hover:border-gold-antique/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gold-antique/30 bg-forest-ink">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <VegMark isVeg={item.product.isVeg} size="sm" />
                      <h4 className="font-fraunces text-sm font-bold truncate">
                        {item.product.name}
                      </h4>
                    </div>
                    <span className="text-[11px] text-cream-warm/65 block mb-1">
                      {item.product.weight}
                    </span>
                    <span className="font-fraunces text-sm font-bold text-gold-antique">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>

                  {/* Controls (+/- and remove) */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-cream-warm/50 hover:text-red-400 transition-colors p-1 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center rounded-lg bg-forest-deep border border-gold-antique/30 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-gold-antique hover:bg-gold-antique/20 rounded transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-fraunces font-bold text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gold-antique hover:bg-gold-antique/20 rounded transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer: Subtotal & WhatsApp CTA */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gold-antique/25 bg-forest-ink/75 space-y-4 font-sans">
            
            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-cream-warm/80">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold font-mono text-sm">₹{subtotal}</span>
              </div>
              
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Special Pack Savings
                  </span>
                  <span>- ₹{totalSavings}</span>
                </div>
              )}

              <div className="flex justify-between text-cream-warm/65 text-[11px] pt-1">
                <span>Delivery Charges</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="pt-2 border-t border-gold-antique/20 flex justify-between items-baseline">
                <span className="font-fraunces text-base font-bold text-cream-warm">
                  Estimated Total
                </span>
                <span className="font-fraunces text-2xl font-bold text-gold-antique">
                  ₹{subtotal}
                </span>
              </div>
            </div>

            {/* Razorpay Checkout Button */}
            <button
              type="button"
              onClick={handleProceedToDetails}
              className="w-full py-3.5 px-6 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2 group cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-[10px] text-center text-cream-warm/65 font-sans">
              🔒 Secure online payment via Razorpay — UPI, Cards & Net Banking.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
