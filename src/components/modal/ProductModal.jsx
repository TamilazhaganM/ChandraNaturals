import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { VegMark } from '../common/VegMark';
import { Badge } from '../common/Badge';
import { X, Plus, Minus, Check, Clock, Utensils, ThermometerSnowflake, Star, Heart, ShoppingBag } from 'lucide-react';

export const ProductModal = () => {
  const { activeProductModal, setActiveProductModal, addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setAddedAnimation(false);
  }, [activeProductModal]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveProductModal(null);
      }
    };
    if (activeProductModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeProductModal, setActiveProductModal]);

  if (!activeProductModal) return null;

  const product = activeProductModal;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      setActiveProductModal(null);
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-forest-ink/80 backdrop-blur-md animate-fade-in"
      onClick={() => setActiveProductModal(null)}
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-forest-deep border-2 border-gold-antique/50 shadow-2xl text-cream-warm overflow-hidden animate-fade-up mt-auto sm:mt-0"
      >
        {/* Close Button */}
        <button
          onClick={() => setActiveProductModal(null)}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-forest-ink/90 text-cream-warm hover:text-gold-antique border border-gold-antique/40 hover:border-gold-antique transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-4 right-16 z-20 p-2 rounded-full border transition-all duration-200 cursor-pointer ${
            wishlisted
              ? 'bg-rose-500 border-rose-400 text-white'
              : 'bg-forest-ink/90 text-cream-warm/60 border-gold-antique/40 hover:border-rose-400 hover:text-rose-400'
          }`}
        >
          <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left: Product Image */}
            <div className="md:col-span-5 relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-gold-antique/40 bg-forest-ink">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <VegMark isVeg={product.isVeg} size="lg" />
                {product.badge && <Badge text={product.badge} />}
              </div>
              <div className="absolute bottom-3 left-3 bg-forest-ink/90 text-gold-antique text-xs font-semibold px-3 py-1 rounded-full border border-gold-antique/30 font-sans">
                {product.weight}
              </div>
            </div>

            {/* Right: Product Info & Pricing */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gold-antique text-xs">
                  <Star className="w-3.5 h-3.5 fill-gold-antique" />
                  <span className="font-semibold">{product.rating || '4.9'}</span>
                  <span className="text-cream-warm/50 text-[10px] font-sans">
                    ({product.reviewCount || 54} customer reviews)
                  </span>
                </div>

                <h2 id="modal-product-title" className="font-fraunces text-2xl sm:text-3xl font-bold leading-tight">
                  {product.name}
                </h2>
                <p className="font-caveat text-xl text-gold-antique">
                  Handcrafted in small batches
                </p>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-fraunces text-3xl font-bold text-gold-antique">
                  ₹{product.price}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-cream-warm/50 line-through font-sans">
                    ₹{product.compareAtPrice}
                  </span>
                )}
                <span className="text-xs text-cream-warm/70 uppercase tracking-wider font-sans">
                  • Taxes included
                </span>
              </div>

              <p className="font-sans text-xs sm:text-sm text-cream-warm/85 leading-relaxed">
                {product.description || product.shortDescription}
              </p>

              {/* Quantity Selector + Add Button in Modal Top */}
              <div className="pt-3 flex items-center gap-3">
                <div className="flex items-center rounded-xl bg-forest-ink border border-gold-antique/40 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gold-antique hover:bg-gold-antique/20 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-fraunces font-bold text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gold-antique hover:bg-gold-antique/20 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 rounded-xl font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer ${
                    addedAnimation
                      ? 'bg-green-600 text-white'
                      : 'bg-gold-antique hover:bg-gold-champagne text-forest-ink'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Order!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart • ₹{product.price * quantity}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* Deep Details Section */}
          <div className="pt-6 border-t border-gold-antique/25 space-y-6">
            
            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-gold-antique">
                  <Utensils className="w-4 h-4" />
                  <h4 className="font-fraunces text-base font-bold">Heirloom Ingredients</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-forest-ink text-xs text-cream-warm border border-gold-antique/30 font-sans"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* How to Use & Storage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* How to Use */}
              {product.howToUse && (
                <div className="p-4 rounded-xl bg-forest-ink/60 border border-gold-antique/25 space-y-1.5">
                  <div className="flex items-center gap-2 text-gold-antique">
                    <Utensils className="w-4 h-4" />
                    <h5 className="font-fraunces text-sm font-bold">How to Enjoy</h5>
                  </div>
                  <p className="font-sans text-xs text-cream-warm/80 leading-relaxed">
                    {product.howToUse}
                  </p>
                </div>
              )}

              {/* Storage & Shelf Life */}
              <div className="p-4 rounded-xl bg-forest-ink/60 border border-gold-antique/25 space-y-2">
                <div className="flex items-center gap-2 text-gold-antique">
                  <ThermometerSnowflake className="w-4 h-4" />
                  <h5 className="font-fraunces text-sm font-bold">Storage & Shelf Life</h5>
                </div>
                <p className="font-sans text-xs text-cream-warm/80 leading-relaxed">
                  {product.storage}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-gold-antique font-medium pt-1 font-sans">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Shelf Life: {product.shelfLife}</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
