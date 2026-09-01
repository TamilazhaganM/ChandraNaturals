import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { VegMark } from '../components/common/VegMark';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft,
  Sparkles, ShieldCheck, Truck, Lock, Gift, Heart, ArrowUpRight
} from 'lucide-react';

export const CartPage = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    itemCount,
    totalSavings,
    setActiveProductModal
  } = useCart();

  const navigate = useNavigate();

  const freeShippingThreshold = 3000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-antique">
          <Link to="/" className="hover:underline flex items-center gap-1">
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:underline">
            <span>Shop</span>
          </Link>
          <span>/</span>
          <span className="text-cream-warm">Shopping Cart</span>
        </div>

        {/* Page Heading Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gold-antique/20 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-antique/15 text-gold-antique text-xs font-semibold uppercase tracking-wider font-sans">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Small-Batch Pantry Basket</span>
            </div>
            <h1 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold text-cream-warm">
              Your Shopping Cart
            </h1>
            <p className="font-sans text-sm sm:text-base text-cream-warm/75">
              Review your handcrafted items, adjust quantities, and proceed to secure checkout.
            </p>
          </div>

          {cart.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-cream-warm/70 font-sans">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-1.5 rounded-lg border border-red-400/30 hover:border-red-400 transition-colors font-sans cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* Free Shipping Progress Indicator */}
        {cart.length > 0 && (
          <div className="p-4 rounded-2xl bg-forest-deep border border-gold-antique/30 shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-2 text-cream-warm">
                <Truck className="w-4 h-4 text-gold-antique" />
                {isFreeShipping ? (
                  <span className="font-semibold text-gold-antique flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Congratulations! You've unlocked FREE Pan-India Shipping!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-gold-antique font-mono">₹{amountNeededForFreeShipping}</strong> more to qualify for <strong className="text-gold-antique">FREE Shipping</strong> (Rs.3000+)
                  </span>
                )}
              </div>
              <span className="text-gold-antique font-mono font-bold">{freeShippingProgress}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-forest-ink overflow-hidden border border-gold-antique/20">
              <div
                className="h-full bg-gold-antique transition-all duration-500 rounded-full shadow-gold-glow"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Empty Cart State */}
        {cart.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl bg-forest-deep border border-gold-antique/30 space-y-6 max-w-2xl mx-auto shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-forest-ink flex items-center justify-center text-gold-antique mx-auto border border-gold-antique/40 shadow-inner">
              <ShoppingBag className="w-10 h-10 opacity-70" />
            </div>
            <div className="space-y-2">
              <h2 className="font-fraunces text-2xl sm:text-3xl font-bold text-cream-warm">
                Your pantry cart is currently empty
              </h2>
              <p className="font-sans text-sm text-cream-warm/75 max-w-md mx-auto leading-relaxed">
                Discover our signature small-batch thokkus, slow-churned A2 bilona ghee, sprouted health mixes, and authentic masala blends crafted with pure heirloom recipes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-gold-glow flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore Complete Pantry</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop/combos"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-forest-ink hover:bg-forest-moss text-cream-warm border border-gold-antique/40 hover:border-gold-antique font-sans font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer"
              >
                <span>View Special Combos</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Full-Size 2-Column Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Full Cart Items Table / List (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl bg-forest-deep border border-gold-antique/30 overflow-hidden shadow-xl">
                
                {/* Table Header */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-forest-ink/60 border-b border-gold-antique/20 text-xs font-semibold uppercase tracking-wider text-gold-antique font-sans">
                  <div className="col-span-6">Product Details</div>
                  <div className="col-span-2 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-gold-antique/15">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-5 sm:px-6 sm:py-5 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center group hover:bg-forest-ink/40 transition-colors"
                    >
                      {/* Product Info & Thumbnail (6 Cols) */}
                      <div className="col-span-6 flex items-center gap-4 w-full">
                        <div
                          onClick={() => setActiveProductModal(item.product)}
                          className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden flex-shrink-0 border border-gold-antique/30 bg-forest-ink cursor-pointer group-hover:border-gold-antique transition-colors relative"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <VegMark isVeg={item.product.isVeg} size="sm" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-antique/80 font-sans">
                              {item.product.category ? item.product.category.replace('-', ' ') : 'Handcrafted'}
                            </span>
                          </div>

                          <h3
                            onClick={() => setActiveProductModal(item.product)}
                            className="font-fraunces text-base sm:text-lg font-bold text-cream-warm hover:text-gold-antique transition-colors cursor-pointer line-clamp-1"
                          >
                            {item.product.name}
                          </h3>

                          <div className="flex items-center gap-2 text-xs text-cream-warm/65 font-sans">
                            <span className="bg-forest-ink px-2 py-0.5 rounded border border-gold-antique/20 font-medium">
                              {item.product.weight}
                            </span>
                          </div>

                          {/* Mobile Price View */}
                          <div className="sm:hidden flex items-baseline gap-2 pt-1 font-sans">
                            <span className="font-fraunces text-base font-bold text-gold-antique">
                              ₹{item.product.price * item.quantity}
                            </span>
                            {item.product.compareAtPrice && (
                              <span className="text-xs text-cream-warm/50 line-through">
                                ₹{item.product.compareAtPrice * item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unit Price (2 Cols) */}
                      <div className="hidden sm:block col-span-2 text-center font-sans">
                        <span className="font-fraunces text-sm font-bold text-cream-warm block">
                          ₹{item.product.price}
                        </span>
                        {item.product.compareAtPrice && (
                          <span className="text-xs text-cream-warm/50 line-through block">
                            ₹{item.product.compareAtPrice}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls (2 Cols) */}
                      <div className="col-span-2 flex items-center justify-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center rounded-xl bg-forest-ink border border-gold-antique/35 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gold-antique hover:bg-gold-antique/20 rounded-lg transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-fraunces font-bold text-sm text-cream-warm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gold-antique hover:bg-gold-antique/20 rounded-lg transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-cream-warm/50 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 cursor-pointer"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Line Item Total (2 Cols) */}
                      <div className="hidden sm:block col-span-2 text-right font-sans">
                        <span className="font-fraunces text-base font-bold text-gold-antique block">
                          ₹{item.product.price * item.quantity}
                        </span>
                        <span className="text-[10px] text-cream-warm/50 block font-sans">
                          {item.quantity} × ₹{item.product.price}
                        </span>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Card Bottom: Continue Shopping Bar */}
                <div className="p-4 bg-forest-ink/50 border-t border-gold-antique/20 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gold-antique hover:text-gold-champagne transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Continue Shopping Traditional Pantry</span>
                  </Link>

                  <div className="flex items-center gap-2 text-xs text-cream-warm/75">
                    <ShieldCheck className="w-4 h-4 text-gold-antique" />
                    <span>Small-batch authenticity guaranteed</span>
                  </div>
                </div>

              </div>

              {/* Artisanal Freshness & Value Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-forest-deep/70 border border-gold-antique/20 text-center space-y-1">
                  <span className="text-xl">🫙</span>
                  <h4 className="font-fraunces text-sm font-bold text-cream-warm">Small Batch Made</h4>
                  <p className="text-[11px] text-cream-warm/70 font-sans">Prepared with native gingelly oil & Vedic ghee.</p>
                </div>
                <div className="p-4 rounded-2xl bg-forest-deep/70 border border-gold-antique/20 text-center space-y-1">
                  <span className="text-xl">🌿</span>
                  <h4 className="font-fraunces text-sm font-bold text-cream-warm">Zero Preservatives</h4>
                  <p className="text-[11px] text-cream-warm/70 font-sans">No artificial colors, MSG, or chemical additives.</p>
                </div>
                <div className="p-4 rounded-2xl bg-forest-deep/70 border border-gold-antique/20 text-center space-y-1">
                  <span className="text-xl">📦</span>
                  <h4 className="font-fraunces text-sm font-bold text-cream-warm">Fresh Glass Jars</h4>
                  <p className="text-[11px] text-cream-warm/70 font-sans">Safe transit packaging with protective cushioning.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Order Summary & Checkout Card (4 Cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              <div className="rounded-2xl bg-forest-deep border-2 border-gold-antique/40 p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-gold-antique/20 pb-4">
                  <h2 className="font-fraunces text-xl font-bold text-cream-warm">
                    Order Summary
                  </h2>
                  <span className="text-xs text-gold-antique font-mono font-semibold">
                    {itemCount} Items
                  </span>
                </div>

                {/* Calculation Rows */}
                <div className="space-y-3 font-sans text-xs sm:text-sm">
                  <div className="flex justify-between text-cream-warm/85">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-bold text-cream-warm">₹{subtotal}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Special Bundle Savings
                      </span>
                      <span className="font-mono">- ₹{totalSavings}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-cream-warm/80">
                    <span>Estimated Shipping</span>
                    <span className="font-mono">
                      {isFreeShipping ? (
                        <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">FREE</span>
                      ) : (
                        <span>Calculated at checkout</span>
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gold-antique/20 flex justify-between items-baseline">
                    <div>
                      <span className="font-fraunces text-lg font-bold text-cream-warm block">
                        Estimated Total
                      </span>
                      <span className="text-[10px] text-cream-warm/60 font-sans">
                        Inclusive of all applicable taxes
                      </span>
                    </div>
                    <span className="font-fraunces text-2xl sm:text-3xl font-bold text-gold-antique font-mono">
                      ₹{subtotal}
                    </span>
                  </div>
                </div>

                {/* Proceed to Full-Size Checkout CTA */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/checkout')}
                    className="w-full py-4 px-6 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Full Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="p-3 rounded-xl bg-forest-ink/60 border border-gold-antique/20 text-center space-y-1">
                    <p className="text-[11px] text-cream-warm/75 font-sans">
                      🔒 256-Bit SSL Encrypted Razorpay Checkout
                    </p>
                    <p className="text-[10px] text-cream-warm/55 font-sans">
                      UPI, Google Pay, PhonePe, Paytm, Cards & Net Banking Supported
                    </p>
                  </div>
                </div>

              </div>

              {/* Kitchen Support Note */}
              <div className="p-4 rounded-2xl bg-forest-deep/60 border border-gold-antique/25 text-center space-y-2">
                <p className="font-caveat text-xl text-gold-antique">
                  Questions about your order?
                </p>
                <p className="text-xs text-cream-warm/70 font-sans">
                  Connect directly with our family kitchen on WhatsApp for instant assistance.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gold-antique hover:underline pt-1 font-sans"
                >
                  <span>Contact Kitchen Support</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
