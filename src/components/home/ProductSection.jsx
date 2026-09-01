import React from 'react';
import { ProductCard } from './ProductCard';
import { Leaf } from 'lucide-react';

export const ProductSection = ({ category, products, isAltBackground = false }) => {
  return (
    <section
      id={category.id}
      className={`py-20 relative transition-colors duration-300 ${
        isAltBackground
          ? 'bg-forest-deep/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          {/* Handwritten Category Accent */}
          <div className="inline-flex items-center gap-1.5 text-gold-antique">
            <Leaf className="w-4 h-4" />
            <span className="font-caveat text-2xl sm:text-3xl font-semibold tracking-wide">
              {category.subtitle}
            </span>
          </div>

          <h2 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-cream-warm">
            {category.name}
          </h2>

          <p className="font-sans text-sm sm:text-base text-cream-warm/80 leading-relaxed">
            {category.description}
          </p>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold-antique to-transparent mx-auto pt-2" />
        </div>

        {/* Product Cards Grid: 2 Columns on Mobile, 3 Columns on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
