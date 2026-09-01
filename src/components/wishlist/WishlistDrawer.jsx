import React, { useEffect } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { VegMark } from '../common/VegMark';
import { X, Heart, ShoppingBag, Trash2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WishlistDrawer = () => {
  const { isWishlistOpen, setIsWishlistOpen, wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsWishlistOpen(false);
    };
    if (isWishlistOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWishlistOpen, setIsWishlistOpen]);

  if (!isWishlistOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-forest-ink/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsWishlistOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-forest-deep border-l-2 border-gold-antique/40 shadow-2xl flex flex-col text-cream-warm animate-fade-in"
      >
        {/* Header */}
        <div className="p-6 border-b border-gold-antique/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            <div>
              <h2 id="wishlist-drawer-title" className="font-fraunces text-xl font-bold">
                My Wishlist
              </h2>
              <span className="text-xs text-cream-warm/75 font-sans">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close wishlist"
            className="p-2 rounded-full bg-forest-ink text-cream-warm hover:text-gold-antique border border-gold-antique/30 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 font-sans">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-rose-400/10 flex items-center justify-center text-rose-400 border border-rose-400/30">
                <Heart className="w-8 h-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="font-fraunces text-lg font-bold">Your wishlist is empty</h3>
                <p className="text-xs text-cream-warm/75 max-w-xs font-sans">
                  Tap the ♥ heart on any product to save it here for later.
                </p>
              </div>
              <Link
                to="/shop"
                onClick={() => setIsWishlistOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-gold-antique text-forest-ink font-bold text-xs uppercase tracking-wider"
              >
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlist.map((product) => (
                <div
                  key={product.id}
                  className="p-3.5 rounded-xl bg-forest-ink/70 border border-gold-antique/25 flex items-center gap-3.5 group hover:border-gold-antique/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gold-antique/30 bg-forest-ink">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <VegMark isVeg={product.isVeg} size="sm" />
                      <h4 className="font-fraunces text-sm font-bold truncate">
                        {product.name}
                      </h4>
                    </div>
                    <span className="text-[11px] text-cream-warm/65 block mb-2">
                      {product.weight} • ₹{product.price}
                    </span>
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        removeFromWishlist(product.id);
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-gold-antique hover:text-gold-champagne transition-colors cursor-pointer font-sans"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Cart</span>
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="text-cream-warm/50 hover:text-rose-400 transition-colors p-1 cursor-pointer flex-shrink-0"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-6 border-t border-gold-antique/25 bg-forest-ink/75 space-y-3 font-sans">
            <button
              onClick={() => {
                wishlist.forEach(p => addToCart(p, 1));
                setIsWishlistOpen(false);
              }}
              className="w-full py-3 px-6 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add All to Cart ({wishlistCount} items)</span>
            </button>
            <p className="text-[10px] text-center text-cream-warm/65 font-sans">
              🌿 Items will be added to your current order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
