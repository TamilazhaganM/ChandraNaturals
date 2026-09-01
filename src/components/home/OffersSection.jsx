import React from 'react';
import { comboOffers } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { Sparkles, Plus, Gift } from 'lucide-react';
import { VegMark } from '../common/VegMark';

export const OffersSection = () => {
  const { addToCart } = useCart();

  const handleAddCombo = (combo) => {
    const comboProduct = {
      id: combo.id,
      name: combo.name,
      price: combo.price,
      compareAtPrice: combo.compareAtPrice,
      weight: combo.weight,
      image: combo.image,
      isVeg: true,
      category: "combo"
    };

    addToCart(comboProduct, 1);
  };

  return (
    <section id="offers" className="py-20 relative bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-antique/15 text-gold-antique text-xs font-semibold uppercase tracking-wider font-sans">
            <Gift className="w-3.5 h-3.5" />
            <span>Artisanal Bundles & Combos</span>
          </div>

          <h2 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-cream-warm">
            Curated Gift Sets & Family Packs
          </h2>

          <p className="font-sans text-sm sm:text-base text-cream-warm/80 leading-relaxed">
            Thoughtfully paired collections designed for wholesome gifting, family pantry restocking, and seasonal nourishment.
          </p>
        </div>

        {/* 3 Combo Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {comboOffers.map((combo) => (
            <div
              key={combo.id}
              className="relative rounded-2xl bg-forest-deep border-2 border-gold-antique/40 hover:border-gold-antique transition-all duration-300 p-6 flex flex-col justify-between shadow-xl group hover:-translate-y-1.5"
            >
              {/* Savings Ribbon */}
              <div className="absolute -top-3.5 right-6 bg-gold-antique text-forest-ink text-xs font-bold px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 font-sans">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{combo.savings}</span>
              </div>

              <div>
                {/* Top Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <VegMark isVeg={combo.isVeg} size="sm" />
                  <span className="text-[11px] font-sans font-semibold tracking-wider text-gold-antique uppercase">
                    {combo.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-fraunces text-2xl font-bold text-cream-warm mb-1">
                  {combo.name}
                </h3>
                <span className="font-caveat text-xl text-gold-champagne block mb-4">
                  {combo.subtitle}
                </span>

                {/* Image */}
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 border border-gold-antique/30">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 bg-forest-ink/95 text-cream-ivory text-[11px] font-medium px-2.5 py-1 rounded-md border border-gold-antique/30 font-sans">
                    {combo.weight}
                  </div>
                </div>

                {/* Description */}
                <p className="font-sans text-xs sm:text-sm text-cream-warm/75 leading-relaxed mb-6">
                  {combo.description}
                </p>
              </div>

              {/* Price & Add to Order CTA */}
              <div className="pt-4 border-t border-gold-antique/25 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-fraunces text-2xl font-bold text-gold-antique">
                      ₹{combo.price}
                    </span>
                    <span className="text-xs text-cream-warm/50 line-through font-sans">
                      ₹{combo.compareAtPrice}
                    </span>
                  </div>
                  <span className="text-[10px] text-cream-warm/65 uppercase tracking-wider block font-sans">
                    Complete Bundle
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddCombo(combo)}
                  className="px-4 py-2.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-gold-glow flex items-center gap-1.5 active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Combo</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
