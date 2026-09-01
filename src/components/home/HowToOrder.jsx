import React from 'react';
import { Search, ShoppingBag, ClipboardCheck, CreditCard, ArrowRight } from 'lucide-react';

export const HowToOrder = () => {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Choose Your Favourites",
      description: "Browse our signature small-batch thokkus, wood-fired A2 ghee, and sprouted wellness mixes."
    },
    {
      number: "02",
      icon: ShoppingBag,
      title: "Add Them to Order",
      description: "Select items and customize quantities effortlessly using our quick tied-tag order buttons."
    },
    {
      number: "03",
      icon: ClipboardCheck,
      title: "Review Order & Details",
      description: "Check your order summary and fill in your delivery name, address, and city."
    },
    {
      number: "04",
      icon: CreditCard,
      title: "Pay Securely Online",
      description: "Complete your order through our secure Razorpay checkout — UPI, cards, and net banking all accepted."
    }
  ];

  return (
    <section id="how-to-order" className="py-20 relative bg-forest-deep border-t border-gold-antique/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-caveat text-2xl sm:text-3xl text-gold-antique font-semibold block">
            Simple & Transparent
          </span>

          <h2 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-cream-warm">
            How to Order from Us
          </h2>

          <p className="font-sans text-sm sm:text-base text-cream-warm/80 leading-relaxed">
            No complicated registrations. Choose your products, fill delivery details, and pay securely via Razorpay — UPI, cards, and net banking all supported.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-forest-ink/80 border border-gold-antique/30 hover:border-gold-antique transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                {/* Step Number Watermark */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-antique/15 text-gold-antique flex items-center justify-center border border-gold-antique/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-fraunces text-3xl font-extrabold text-gold-antique/30 select-none">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-fraunces text-lg font-bold text-cream-warm">
                    {step.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-cream-warm/75 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-gold-antique/40">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};
