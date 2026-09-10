import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VegMark } from '../common/VegMark';
import { Badge } from '../common/Badge';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { ShoppingBag, Eye, Check, Star, Heart } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const cartItem = cart.find(item => item.product.id === product.id);
  const inCartCount = cartItem ? cartItem.quantity : 0;
  const wishlisted = isWishlisted(product.id);

  const handleCardClick = (e) => {
    if (e.target.closest('button.add-btn') || e.target.closest('button.wish-btn') || e.target.closest('a')) return;
    navigate(`/product/${product.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="paper-tag-card group cursor-pointer flex flex-col justify-between p-3 sm:p-5 pb-4 sm:pb-6 text-cream-warm relative"
    >
      {/* Top Bar: Veg Mark + Badge */}
      <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-3 min-h-[20px] sm:min-h-[24px]">
        <div className="flex items-center">
          <VegMark isVeg={product.isVeg} size="sm" />
        </div>
        {product.badge && (
          <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-gold-antique/20 text-gold-antique border border-gold-antique/40 font-sans whitespace-nowrap">
            {product.badge}
          </span>
        )}
      </div>

      {/* Product Image Frame - Spacious Square Frame for High Visual Clarity */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-forest-ink border border-gold-antique/30 mb-3 sm:mb-4 group-hover:border-gold-antique/70 transition-colors shadow-inner">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-ink/80 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
        
        {/* Quick View Pill on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link
            to={`/product/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 rounded-full bg-forest-ink/95 text-gold-antique text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-lg border border-gold-antique/50 font-sans hover:bg-gold-antique hover:text-[#0F1D12] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </Link>
        </div>

        {/* In-Cart Pill indicator */}
        {inCartCount > 0 && (
          <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 bg-gold-antique text-forest-ink text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 font-sans">
            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
            <span>{inCartCount}</span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`wish-btn absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md border cursor-pointer ${
            wishlisted
              ? 'bg-rose-500 border-rose-400 text-white scale-105'
              : 'bg-forest-ink/80 border-cream-warm/20 text-cream-warm/60 hover:border-rose-400 hover:text-rose-400 hover:bg-rose-400/10'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${wishlisted ? 'fill-white scale-110' : ''}`} />
        </button>
      </div>

      {/* Product Details Header */}
      <div className="space-y-1 sm:space-y-1.5 flex-grow">
        <div className="flex items-center gap-1 text-gold-antique text-[10px] sm:text-xs mb-0.5">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-gold-antique" />
          <span className="font-semibold">{product.rating || '4.9'}</span>
          <span className="text-cream-warm/60 text-[9px] sm:text-[10px] font-sans">
            ({product.reviewCount || 48})
          </span>
        </div>

        <Link
          to={`/product/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block group/link"
        >
          <h3 className="font-fraunces text-xs sm:text-base md:text-lg font-bold leading-tight line-clamp-2 group-hover/link:text-gold-antique transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="hidden sm:block font-sans text-xs text-cream-warm/75 line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>
      </div>

      {/* Price & Action Row */}
      <div className="pt-2.5 sm:pt-4 mt-2 sm:mt-3 border-t border-gold-antique/25 flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1 sm:gap-1.5">
            <span className="font-fraunces text-base sm:text-xl font-bold text-gold-antique">
              ₹{product.price}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-cream-warm/50 line-through font-sans">
                ₹{product.compareAtPrice}
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] text-cream-warm/65 font-sans uppercase tracking-wider">
            {product.weight}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product, 1);
          }}
          className="add-btn w-full sm:w-auto px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </article>
  );
};
