import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products, productCategories } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductReviews } from '../components/reviews/ProductReviews';
import { VegMark } from '../components/common/VegMark';
import {
  ChevronRight, Star, Heart, Plus, Minus, ShoppingBag,
  Zap, MessageSquare, ShieldCheck, Truck, Sparkles,
  Utensils, Clock, Check, ArrowRight, Package
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  // Locate product by slug or id
  const product = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase().trim();
    return (
      products.find(p => p.id === cleanSlug || p.id.replace(/-/g, '') === cleanSlug.replace(/-/g, '')) ||
      products.find(p => p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug) ||
      products.find(p => String(p.id).toLowerCase() === cleanSlug) ||
      null
    );
  }, [slug]);

  // Weight Variants configuration
  const weightOptions = useMemo(() => {
    if (!product) return [];
    if (product.weightOptions && product.weightOptions.length > 0) {
      return product.weightOptions;
    }
    const baseWeight = product.weight || '250g';
    if (baseWeight.includes('g') && !baseWeight.includes('k')) {
      const num = parseInt(baseWeight, 10) || 250;
      return [
        { label: `${num}g`, multiplier: 1.0 },
        { label: `${num * 2}g`, multiplier: 1.9 },
        { label: '1 kg', multiplier: 3.6 }
      ];
    }
    return [{ label: baseWeight, multiplier: 1.0 }];
  }, [product]);

  const [selectedWeight, setSelectedWeight] = useState(weightOptions[0] || { label: '250g', multiplier: 1.0 });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [addedToast, setAddedToast] = useState(false);

  // Sync default weight on product change
  useEffect(() => {
    if (weightOptions.length > 0) {
      setSelectedWeight(weightOptions[0]);
    }
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [slug, weightOptions]);

  if (!product) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 bg-forest-ink text-cream-warm pt-32 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gold-antique/15 border border-gold-antique/30 flex items-center justify-center text-gold-antique mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream-warm">Pantry Item Not Found</h1>
        <p className="text-sm text-cream-warm/75 max-w-md mx-auto">
          The requested traditional food treasure could not be found or may have moved to another small-batch seasonal collection.
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-antique text-[#0F1D12] font-bold font-sans text-sm hover:bg-gold-champagne transition-all shadow-md"
          >
            <span>Browse All Pantry Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Calculate dynamic price based on weight multiplier
  const calculatedPrice = Math.round(product.price * (selectedWeight.multiplier || 1.0));
  const calculatedOriginalPrice = product.originalPrice
    ? Math.round(product.originalPrice * (selectedWeight.multiplier || 1.0))
    : Math.round(calculatedPrice * 1.18);
  const discountPercent = Math.round(((calculatedOriginalPrice - calculatedPrice) / calculatedOriginalPrice) * 100);

  // Category object
  const categoryInfo = productCategories.find(c => c.id === product.category);
  const wishlisted = isWishlisted(product.id);

  // Handlers
  const handleAddToCart = () => {
    const customizedProduct = {
      ...product,
      weight: selectedWeight.label,
      price: calculatedPrice
    };
    addToCart(customizedProduct, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  const handleBuyNow = () => {
    const customizedProduct = {
      ...product,
      weight: selectedWeight.label,
      price: calculatedPrice
    };
    addToCart(customizedProduct, quantity);
    navigate('/checkout');
  };

  const generateWhatsAppUrl = () => {
    const text = `Namaste Chandra Naturals, I am interested in ordering: ${product.name} (${selectedWeight.label}, Qty: ${quantity}) priced at ₹${calculatedPrice * quantity}. Could you assist me with delivery?`;
    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  // Related products from same category
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-forest-ink bg-botanical-mesh text-cream-warm pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Toast Confirmation */}
      {addedToast && (
        <div className="fixed top-24 right-5 z-50 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-forest-deep border border-gold-antique text-cream-warm shadow-2xl text-xs sm:text-sm font-semibold backdrop-blur-md">
            <Check className="w-5 h-5 text-gold-antique shrink-0" />
            <span>Added {quantity} × {product.name} ({selectedWeight.label}) to your cart!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-cream-warm/70 font-sans flex-wrap">
          <Link to="/" className="hover:text-gold-antique transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-cream-warm/40" />
          <Link to="/shop" className="hover:text-gold-antique transition-colors">Shop</Link>
          {categoryInfo && (
            <>
              <ChevronRight className="w-3 h-3 text-cream-warm/40" />
              <Link to={`/shop/${categoryInfo.id}`} className="hover:text-gold-antique transition-colors">
                {categoryInfo.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-cream-warm/40" />
          <span className="text-gold-antique font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* 2-COLUMN PRODUCT SHOWCASE                                         */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Product Visual Showcase (6 Cols) */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-28">
            <div className="relative rounded-3xl overflow-hidden bg-forest-deep border-2 border-gold-antique/30 shadow-2xl aspect-square flex items-center justify-center p-6 group">
              
              {/* Product Image */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />

              {/* Veg Indicator Badge */}
              <div className="absolute top-5 left-5 z-10 bg-forest-ink/90 backdrop-blur-sm p-1.5 rounded-xl border border-gold-antique/30 shadow-md">
                <VegMark size="md" />
              </div>

              {/* Seasonal / Signature Badge */}
              {product.badge && (
                <div className="absolute top-5 right-16 z-10 bg-gold-antique text-[#0F1D12] text-xs font-bold px-3 py-1 rounded-full shadow-md font-sans">
                  {product.badge}
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`absolute top-5 right-5 z-10 p-2.5 rounded-full border transition-all duration-200 cursor-pointer ${
                  wishlisted
                    ? 'bg-rose-500 border-rose-400 text-white shadow-md'
                    : 'bg-forest-ink/85 border-gold-antique/40 text-cream-warm hover:text-rose-400 hover:border-rose-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
              </button>

              {/* Heritage Stamp Overlay */}
              <div className="absolute bottom-5 left-5 right-5 bg-forest-ink/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gold-antique/25 flex items-center justify-between text-xs font-sans">
                <span className="flex items-center gap-1.5 text-gold-antique font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Small-Batch Stone Ground
                </span>
                <span className="text-cream-warm/75 font-mono">
                  FSSAI: {siteConfig.fssaiNumber}
                </span>
              </div>
            </div>

            {/* Quick Guarantees Bar */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-sans">
              <div className="p-2.5 rounded-xl bg-forest-deep border border-gold-antique/20 space-y-0.5">
                <ShieldCheck className="w-4 h-4 text-gold-antique mx-auto" />
                <span className="font-bold text-cream-warm block">Zero Preservatives</span>
                <span className="text-[10px] text-cream-warm/70">100% pure kitchen</span>
              </div>
              <div className="p-2.5 rounded-xl bg-forest-deep border border-gold-antique/20 space-y-0.5">
                <Utensils className="w-4 h-4 text-gold-antique mx-auto" />
                <span className="font-bold text-cream-warm block">Cold-Pressed Oil</span>
                <span className="text-[10px] text-cream-warm/70">Wood churned</span>
              </div>
              <div className="p-2.5 rounded-xl bg-forest-deep border border-gold-antique/20 space-y-0.5">
                <Truck className="w-4 h-4 text-gold-antique mx-auto" />
                <span className="font-bold text-cream-warm block">Pan-India Express</span>
                <span className="text-[10px] text-cream-warm/70">Glass safe packaging</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Purchasing & Specs (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Category & Title */}
            <div className="space-y-2">
              <Link
                to={`/shop/${product.category}`}
                className="inline-block text-xs uppercase tracking-widest text-gold-antique font-bold font-sans hover:underline"
              >
                {categoryInfo?.name || product.category}
              </Link>
              
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-warm tracking-tight">
                {product.name}
              </h1>

              {product.tamilName && (
                <p className="font-serif text-lg sm:text-xl text-gold-antique font-medium italic">
                  {product.tamilName}
                </p>
              )}

              {/* Star Rating snippet */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 text-gold-antique">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-antique" />
                  ))}
                </div>
                <span className="text-xs text-cream-warm/80 font-sans font-medium">
                  <strong>4.9</strong> / 5.0 (34 reviews)
                </span>
                <span className="text-cream-warm/40">•</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-sans font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Fresh Batch in Stock
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-cream-warm/85 font-sans leading-relaxed">
              {product.description}
            </p>

            {/* Pricing Section */}
            <div className="p-5 rounded-2xl bg-forest-deep border border-gold-antique/30 space-y-1 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-gold-antique">
                  ₹{calculatedPrice}
                </span>
                {calculatedOriginalPrice > calculatedPrice && (
                  <span className="font-sans text-lg text-cream-warm/50 line-through">
                    ₹{calculatedOriginalPrice}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-sans">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-cream-warm/65 font-sans">
                Inclusive of all taxes (GST). Free delivery across India on orders above ₹3,000.
              </p>
            </div>

            {/* Weight / Pack Variant Selector */}
            <div className="space-y-2.5 font-sans">
              <label className="block text-xs font-bold uppercase tracking-wider text-cream-warm">
                Select Package Weight:
              </label>
              <div className="flex flex-wrap gap-3">
                {weightOptions.map((opt) => {
                  const isSelected = selectedWeight.label === opt.label;
                  const optPrice = Math.round(product.price * opt.multiplier);
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedWeight(opt)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gold-antique text-[#0F1D12] border-gold-antique font-bold shadow-md'
                          : 'bg-forest-deep text-cream-warm border-gold-antique/30 hover:border-gold-antique'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className={`text-[11px] font-mono ${isSelected ? 'text-[#0F1D12]' : 'text-gold-antique'}`}>
                        ₹{optPrice}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Buy Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cream-warm font-sans">
                  Quantity:
                </span>
                <div className="inline-flex items-center rounded-xl bg-forest-deep border border-gold-antique/35 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-cream-warm/70 hover:text-gold-antique transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-bold text-cream-warm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-cream-warm/70 hover:text-gold-antique transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Primary Buying CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 rounded-2xl bg-forest-deep hover:bg-gold-antique hover:text-[#0F1D12] border-2 border-gold-antique text-cream-warm font-sans font-bold text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Pantry</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gold-antique hover:bg-gold-champagne text-[#0F1D12] font-sans font-bold text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-[#0F1D12]" />
                  <span>Instant Buy Now</span>
                </button>
              </div>

              {/* Direct WhatsApp Ordering */}
              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/60 text-[#25D366] text-xs font-bold uppercase tracking-wider transition-colors font-sans"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Inquire or Order on WhatsApp</span>
              </a>
            </div>

            {/* Micro Details */}
            <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/20 space-y-1.5 text-xs text-cream-warm/80 font-sans">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gold-antique shrink-0" />
                <span>Shelf Life: <strong>{product.shelfLife || '6 Months (Store with dry spoon)'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-gold-antique shrink-0" />
                <span>Dispatches within 24–48 hours in cushioned glass packaging.</span>
              </div>
            </div>

          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TABS: INGREDIENTS, BENEFITS, HOW TO ENJOY, STORAGE               */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <section className="p-6 sm:p-8 md:p-10 rounded-3xl bg-forest-deep border border-gold-antique/25 shadow-md space-y-6">
          
          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 border-b border-gold-antique/20 pb-4">
            {[
              { id: 'ingredients', label: 'Ingredients & Purity' },
              { id: 'benefits', label: 'Health & Wellness' },
              { id: 'usage', label: 'How to Enjoy' },
              { id: 'storage', label: 'Storage & Care' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold font-sans transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gold-antique text-[#0F1D12] font-bold shadow-sm'
                    : 'text-cream-warm/80 hover:bg-forest-ink/60 hover:text-cream-warm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="font-sans text-sm sm:text-base leading-relaxed text-cream-warm/85 min-h-[120px]">
            {activeTab === 'ingredients' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-serif text-lg font-bold text-cream-warm">Authentic Ingredients</h3>
                <p>
                  {product.ingredients || 'Handpicked country farm ingredients, wood cold-pressed gingelly oil, whole mustard seeds, fenugreek, rock salt, and stone-ground spices.'}
                </p>
                <div className="p-4 rounded-xl bg-forest-ink/60 border border-gold-antique/20 text-xs space-y-1">
                  <span className="font-bold text-gold-antique uppercase tracking-wider block">Zero Chemicals:</span>
                  <p className="text-cream-warm/75">
                    No artificial food coloring, no synthetic vinegar, and no chemical stabilizers. Made strictly following heirloom kitchen traditions.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-serif text-lg font-bold text-cream-warm">Traditional Wellness Benefits</h3>
                <p>
                  {product.benefits || 'Packed with natural digestive benefits, wholesome antioxidants, and traditional bio-nutrients. Supports daily vitality, gut wellness, and metabolic balance.'}
                </p>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-serif text-lg font-bold text-cream-warm">Serving Suggestions</h3>
                <p>
                  {product.usage || 'Mix 1–2 teaspoons with steaming hot ponni or seeraga samba rice alongside a spoonful of cow ghee or gingelly oil. Also pairs divinely with dosas, idlis, chapatis, and curd rice.'}
                </p>
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-serif text-lg font-bold text-cream-warm">Storage Instructions</h3>
                <ul className="list-disc pl-5 space-y-2 text-cream-warm/80">
                  <li>Always use a completely dry, clean stainless steel or wooden spoon.</li>
                  <li>Do not leave wet spoons inside the jar.</li>
                  <li>Store in a cool, dry pantry away from direct moisture and humidity.</li>
                  <li>Refrigeration is optional after opening to extend freshness during peak summer months.</li>
                </ul>
              </div>
            )}
          </div>

        </section>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* CUSTOMER REVIEWS & RATINGS SECTION                                */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <ProductReviews product={product} />

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* RELATED PRODUCTS                                                  */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-gold-antique/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gold-antique font-sans">
                  From the Same Pantry
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cream-warm">
                  You May Also Relish
                </h2>
              </div>
              <Link
                to={`/shop/${product.category}`}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gold-antique hover:text-gold-champagne font-sans"
              >
                <span>View Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map(rel => (
                <div
                  key={rel.id}
                  className="rounded-2xl p-4 bg-forest-deep border border-gold-antique/25 flex flex-col justify-between space-y-4 shadow-sm hover:border-gold-antique/45 transition-all group"
                >
                  <div className="space-y-3">
                    <Link to={`/product/${rel.id}`} className="block relative aspect-square rounded-xl overflow-hidden bg-forest-ink">
                      <img
                        src={rel.image}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div>
                      <Link to={`/product/${rel.id}`} className="font-serif text-base font-bold text-cream-warm hover:text-gold-antique transition-colors block">
                        {rel.name}
                      </Link>
                      <p className="text-xs text-cream-warm/70 font-sans mt-0.5 line-clamp-2">
                        {rel.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gold-antique/15">
                    <span className="font-serif text-lg font-bold text-gold-antique">
                      ₹{rel.price}
                    </span>
                    <Link
                      to={`/product/${rel.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-gold-antique text-[#0F1D12] text-xs font-bold font-sans hover:bg-gold-champagne transition-all shadow-sm"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
