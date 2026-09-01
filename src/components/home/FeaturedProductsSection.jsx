import React from 'react';
import { ProductCard } from './ProductCard';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products } from '../../data/products';

export const FeaturedProductsSection = () => {
  // Curate 8 top signature products spanning the brand's key offerings
  const featuredProductIds = [
    'tomato-thokku',
    'curry-leaf-thokku',
    'mudakathan-thokku',
    'pirandai-thokku',
    'poondu-milagu-thokku',
    'mulaikattiya-payaru-thokku',
    'a2-bilona-ghee',
    'karuppu-kavuni-mix'
  ];

  // Pick the 8 featured items (with fallback to first 8 products if any id differs)
  const featuredList = featuredProductIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  const finalProducts = featuredList.length >= 8 ? featuredList.slice(0, 8) : products.slice(0, 8);

  return (
    <section id="featured-products" className="py-16 sm:py-20 relative bg-forest-deep/40 border-b border-gold-antique/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-forest-deep border border-gold-antique/35 text-gold-antique shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-caveat text-xl sm:text-2xl font-semibold tracking-wide">
              Handpicked Kitchen Bestsellers
            </span>
          </div>

          <h2 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-cream-warm">
            Our Featured Products
          </h2>

          <p className="font-sans text-xs sm:text-sm md:text-base text-cream-warm/80 leading-relaxed max-w-2xl mx-auto">
            Small-batch woodfire thokkus, cultured Vedic A2 ghee, and sprouted heritage grain mixes prepared with grandmother's authentic recipes.
          </p>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold-antique to-transparent mx-auto pt-1" />
        </div>

        {/* 8 Products Grid: 2 Columns on Mobile, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {finalProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA to explore all categories */}
        <div className="text-center pt-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-gold-glow group hover:scale-[1.02] active:scale-95"
          >
            <span>Explore Complete Pantry</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};
