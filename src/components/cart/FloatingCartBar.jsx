import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

export const FloatingCartBar = () => {
  const { itemCount, subtotal, totalSavings } = useCart();

  if (itemCount === 0) return null;

  return (
    <aside
      aria-label="Floating Order Bar"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md animate-fade-up"
    >
      <Link
        to="/cart"
        className="block bg-forest-ink/95 backdrop-blur-md text-cream-warm border-2 border-gold-antique rounded-2xl p-3 sm:p-3.5 shadow-2xl hover:border-gold-champagne transition-all duration-300 group"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left Side: Bag Icon + Count & Price */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gold-antique flex items-center justify-center text-forest-ink flex-shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              <span className="absolute -top-1.5 -right-1.5 bg-forest-ink text-gold-champagne text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-gold-antique">
                {itemCount}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-fraunces text-base sm:text-lg font-bold text-gold-antique">
                  ₹{subtotal}
                </span>
                <span className="text-xs text-cream-warm/75 font-sans">
                  ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
              </div>
              {totalSavings > 0 ? (
                <span className="text-[10px] text-green-500 font-semibold flex items-center gap-0.5 font-sans">
                  <Sparkles className="w-2.5 h-2.5" />
                  Saving ₹{totalSavings}
                </span>
              ) : (
                <span className="text-[10px] text-cream-warm/60 font-sans">
                  Tap to view full cart
                </span>
              )}
            </div>
          </div>

          {/* Right Side: View Order Button */}
          <div className="px-4 py-2.5 rounded-xl bg-gold-antique group-hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5 flex-shrink-0">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </aside>
  );
};

