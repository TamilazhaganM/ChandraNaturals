import React from 'react';
import { Hero } from '../components/home/Hero';
import { TrustBadges } from '../components/home/TrustBadges';
import { FeaturedProductsSection } from '../components/home/FeaturedProductsSection';
import { FreshnessSection } from '../components/home/FreshnessSection';
import { HowToOrder } from '../components/home/HowToOrder';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="space-y-0">
      {/* 1. Hero Section with Banner Slider & Circular Categories */}
      <Hero />

      {/* 2. Trust Badges (4 Balanced Pillars) */}
      <TrustBadges />

      {/* 3. Curated Featured Products (8 Signature Items, 2-Col Mobile / 4-Col Desktop) */}
      <FeaturedProductsSection />

      {/* 4. Testimonials from Customers Carousel */}
      <TestimonialsSection />

      {/* 5. Storage & Freshness Information */}
      <FreshnessSection />

      {/* 9. How to Order Guide */}
      <HowToOrder />

      {/* 10. Direct Pantry Callout Banner */}
      <section className="py-16 bg-forest-deep border-t border-gold-antique/25 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          <span className="font-caveat text-3xl text-gold-antique font-semibold block">
            Pure ingredients • Timeless heritage
          </span>
          <h2 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold text-cream-warm">
            Ready to stock your kitchen with genuine traditional flavours?
          </h2>
          <p className="font-sans text-sm sm:text-base text-cream-warm/80 max-w-xl mx-auto">
            Order your small-batch favourites directly from our kitchen on WhatsApp with quick delivery across India.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/shop"
              className="px-8 py-3.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-gold-glow flex items-center gap-2 group"
            >
              <Sparkles className="w-4 h-4" />
              <span>Browse Complete Pantry</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-xl bg-forest-ink hover:bg-forest-moss text-cream-warm border border-gold-antique/40 hover:border-gold-antique font-sans font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all"
            >
              <span>Contact Our Kitchen</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
