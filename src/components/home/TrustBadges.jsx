import React from 'react';
import { Flame, Sparkles, Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

export const TrustBadges = () => {
  const badges = [
    {
      icon: Flame,
      title: "Woodfire Cooking",
      description: "Slow-simmered small batches",
    },
    {
      icon: Sparkles,
      title: "Heirloom Recipes",
      description: "Grandmother's authentic methods",
    },
    {
      icon: Award,
      title: "Cold-Pressed Oils",
      description: "Unrefined gingelly & A2 ghee",
    },
    {
      icon: ShieldCheck,
      title: "Zero Preservatives",
      description: "100% pure natural ingredients",
    }
  ];

  return (
    <section id="trust-badges" className="relative py-6 bg-forest-deep border-y border-gold-antique/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-center">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-forest-ink/60 border border-gold-antique/20 hover:border-gold-antique/50 transition-all duration-200 group shadow-sm"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gold-antique/15 text-gold-antique flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-gold-antique/25 transition-all duration-300">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-fraunces font-bold text-xs sm:text-sm text-cream-warm truncate block">
                    {badge.title}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-sans text-cream-warm/75 truncate block">
                    {badge.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
