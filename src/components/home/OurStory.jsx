import React from 'react';
import { Leaf, Heart, Sparkles, Sun } from 'lucide-react';

export const OurStory = () => {
  return (
    <section id="our-story" className="py-24 relative bg-botanical-mesh border-t border-gold-antique/20 overflow-hidden">
      {/* Background Decorative Moon Glow */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gold-antique/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Editorial Story Visuals (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative">
              {/* Main Artisanal Image */}
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border-2 border-gold-antique/40 shadow-2xl relative group">
                <img
                  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop"
                  alt="Traditional Indian spices and mortar pestle"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-ink/90 via-forest-ink/20 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 text-cream-ivory space-y-1">
                  <span className="font-caveat text-2xl text-gold-champagne block">Crafted in Small Batches</span>
                  <p className="font-sans text-xs text-cream-warm/80">Every single jar is filled and labeled by hand with generational devotion.</p>
                </div>
              </div>

              {/* Floating Testimonial Quote Tag */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 max-w-xs p-4 rounded-xl bg-forest-deep border border-gold-antique shadow-2xl">
                <p className="font-caveat text-lg sm:text-xl text-gold-antique leading-tight">
                  "Food should nourish the soul, comfort the heart, and honor our ancestors."
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Narrative (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Handwritten Section Tag */}
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-antique" />
              <span className="font-caveat text-2xl sm:text-3xl text-gold-antique font-semibold">
                Our Story
              </span>
            </div>

            <h2 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-cream-warm leading-tight">
              Rooted in familiar flavours and made with the{' '}
              <span className="italic font-normal text-gold-gradient">
                care of a home kitchen.
              </span>
            </h2>

            <div className="space-y-4 font-sans text-sm sm:text-base text-cream-warm/85 leading-relaxed">
              <p>
                Chandra Naturals was born from a simple yearning: to rediscover the genuine aroma of grandmother’s kitchen, where spices were hand-pounded, oils were wood-pressed, and pickles were nurtured like family heirlooms.
              </p>

              <p>
                In an era of industrial shortcuts and mass manufacturing, we choose the slow road. Our thokkus are gently simmered in brass vessels, our A2 cow ghee is clarified over low firewood embers, and our sprouted multi-millet mixes are solar-dried to preserve their natural bio-availability.
              </p>
            </div>

            {/* Core Values Grid */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gold-antique/25">
              <div className="p-3.5 rounded-xl bg-forest-deep border border-gold-antique/25 space-y-1 shadow-sm">
                <Leaf className="w-5 h-5 text-gold-antique mb-1" />
                <h4 className="font-fraunces font-bold text-sm text-cream-warm">Purity First</h4>
                <p className="text-[11px] text-cream-warm/75 font-sans">No artificial coloring or synthetic flavoring ever.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-forest-deep border border-gold-antique/25 space-y-1 shadow-sm">
                <Sun className="w-5 h-5 text-gold-antique mb-1" />
                <h4 className="font-fraunces font-bold text-sm text-cream-warm">Heirloom Wisdom</h4>
                <p className="text-[11px] text-cream-warm/75 font-sans">Honoring traditional Vedic cooking methods.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-forest-deep border border-gold-antique/25 space-y-1 shadow-sm">
                <Heart className="w-5 h-5 text-gold-antique mb-1" />
                <h4 className="font-fraunces font-bold text-sm text-cream-warm">Made with Devotion</h4>
                <p className="text-[11px] text-cream-warm/75 font-sans">Prepared in micro-batches with mindful care.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
