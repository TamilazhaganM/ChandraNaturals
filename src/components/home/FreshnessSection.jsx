import React from 'react';
import { ThermometerSnowflake, Utensils, SunDim, ShieldCheck } from 'lucide-react';
import { WordReveal } from '../common/WordReveal';

export const FreshnessSection = () => {
  const guidelines = [
    {
      icon: SunDim,
      title: "Store in a Cool, Dry Place",
      desc: "Keep jars tucked away from direct heat, sunlight, and humid countertops in your pantry."
    },
    {
      icon: Utensils,
      title: "Always Use a Clean, Dry Spoon",
      desc: "Water drops are the natural enemy of oil-cured thokku. Always scoop with a completely dry spoon."
    },
    {
      icon: ThermometerSnowflake,
      title: "Refrigerate After Breaking the Seal",
      desc: "Since we avoid synthetic chemical preservatives, chilling after opening extends the delightful fresh aroma."
    },
    {
      icon: ShieldCheck,
      title: "Keep the Oil Blanket Intact",
      desc: "Native cold-pressed gingelly oil acts as nature's protective seal. Ensure the top layer stays gently coated."
    }
  ];

  return (
    <section id="freshness" className="py-20 relative bg-forest-deep/80 border-y border-gold-antique/25 overflow-hidden">
      {/* Background Decorative Moon Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-antique/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-caveat text-2xl sm:text-3xl text-gold-antique font-semibold block">
            Artisanal Care Guide
          </span>
          
          <h2 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-cream-warm">
            Freshness matters.{' '}
            <span className="italic font-normal text-gold-gradient block sm:inline">
              Every jar deserves the right care.
            </span>
          </h2>

          <WordReveal
            text="Our products are prepared in the spirit of home cooking without artificial chemical stabilizers. A few mindful habits ensure every spoonful tastes like day one."
            className="font-sans text-sm sm:text-base text-cream-warm/80 leading-relaxed pt-2"
          />
        </div>

        {/* 4 Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guidelines.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-forest-ink/70 border border-gold-antique/30 hover:border-gold-antique transition-all duration-300 flex flex-col items-center text-center space-y-3 group shadow-md"
              >
                <div className="w-14 h-14 rounded-full bg-gold-antique/15 text-gold-antique flex items-center justify-center border border-gold-antique/30 group-hover:scale-110 group-hover:bg-gold-antique/25 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-fraunces text-lg font-bold text-cream-warm">
                  {item.title}
                </h3>
                
                <p className="font-sans text-xs sm:text-sm text-cream-warm/75 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
