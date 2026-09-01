import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2, Heart } from 'lucide-react';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya Ramachandran",
      location: "Chennai, Tamil Nadu",
      product: "Kili Mooku Mango Thokku",
      rating: 5,
      comment: "The mango thokku took me straight back to my grandmother's summer house in Madurai. The cold-pressed gingelly oil aroma and the authentic balance of spice and tang is something you simply cannot get from store-bought commercial pickles. Truly exceptional!",
    },
    {
      id: 2,
      name: "Anand Krishnamoorthy",
      location: "Bengaluru, Karnataka",
      product: "A2 Desi Cow Bilona Ghee",
      rating: 5,
      comment: "The nutty aroma that fills the kitchen when you open the jar of this bilona ghee is unforgettable. You can see the authentic granular texture immediately. We drizzle a spoonful over hot rice and dal daily. Best ghee I have ordered online!",
    },
    {
      id: 3,
      name: "Deepa Sundar",
      location: "Coimbatore, Tamil Nadu",
      product: "Sprouted 14-Grain Sathu Maavu",
      rating: 5,
      comment: "My toddler and elderly parents both love this porridge! It's so gentle on the stomach and deeply nourishing because the millets are sprouted and roasted. No sugar or preservatives. Chandra Naturals is now a pantry staple for our family.",
    },
    {
      id: 4,
      name: "Suresh Babu",
      location: "Hyderabad, Telangana",
      product: "Mountain Garlic (Malai Poondu) Thokku",
      rating: 5,
      comment: "The hill garlic cloves are so tender and packed with intense flavor without burning your stomach. Excellent with curd rice and idlis. Packaging was safe in glass jars and delivery was super fast.",
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play sliding
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIdx((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      className="py-16 sm:py-20 bg-forest-deep/60 border-t border-gold-antique/20 relative overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Decorative Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold-antique/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Section Heading with Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-forest-deep border border-gold-antique/30">
              <Heart className="w-3.5 h-3.5 text-gold-antique fill-gold-antique/30" />
              <span className="font-caveat text-xl sm:text-2xl text-gold-antique font-semibold">
                Loved by Families Across India
              </span>
            </div>

            <h2 className="font-fraunces text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-cream-warm">
              Voices from Our Community
            </h2>
          </div>

          {/* Left / Right Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevTestimonial}
              aria-label="Previous Testimonial"
              className="p-2.5 rounded-full bg-forest-deep hover:bg-forest-ink text-gold-antique border border-gold-antique/40 hover:border-gold-antique transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextTestimonial}
              aria-label="Next Testimonial"
              className="p-2.5 rounded-full bg-forest-deep hover:bg-forest-ink text-gold-antique border border-gold-antique/40 hover:border-gold-antique transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sliding Testimonial Carousel Track */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIdx * 100}%)` }}
          >
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="w-full flex-shrink-0 px-1 sm:px-2"
              >
                <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-forest-deep border-2 border-gold-antique/40 shadow-xl space-y-6 relative group">
                  
                  {/* Decorative Background Quote */}
                  <Quote className="absolute top-6 right-6 w-12 h-12 text-gold-antique/10 pointer-events-none" />

                  {/* Stars */}
                  <div className="flex items-center gap-1.5">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-gold-antique text-gold-antique" />
                    ))}
                    <span className="text-xs font-bold text-gold-antique ml-2 font-sans">
                      Verified Review
                    </span>
                  </div>

                  {/* Review Quote */}
                  <p className="font-sans text-sm sm:text-base md:text-lg text-cream-warm/90 leading-relaxed italic">
                    "{item.comment}"
                  </p>

                  {/* Author & Product Info */}
                  <div className="pt-4 border-t border-gold-antique/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-fraunces text-base sm:text-lg font-bold text-cream-warm">
                          {item.name}
                        </h4>
                        <CheckCircle2 className="w-4 h-4 text-gold-antique" title="Verified Customer" />
                      </div>
                      <span className="text-xs text-cream-warm/60 font-sans block">
                        {item.location}
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-forest-ink border border-gold-antique/30 text-xs font-semibold text-gold-antique font-sans">
                      {item.product}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIdx
                  ? 'w-8 bg-gold-antique'
                  : 'w-2 bg-gold-antique/30 hover:bg-gold-antique/60'
              }`}
            />
          ))}
        </div>

        {/* Trust Metric Strip */}
        <div className="p-5 sm:p-6 rounded-2xl bg-forest-ink border border-gold-antique/25 max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center shadow-md">
          <div className="space-y-0.5">
            <span className="font-fraunces text-xl sm:text-2xl font-bold text-gold-antique block">4.9 / 5</span>
            <span className="text-[10px] sm:text-xs text-cream-warm/65 font-sans">500+ Verified Reviews</span>
          </div>

          <div className="border-x border-gold-antique/25 space-y-0.5 px-2">
            <span className="font-fraunces text-xl sm:text-2xl font-bold text-gold-antique block">10,000+</span>
            <span className="text-[10px] sm:text-xs text-cream-warm/65 font-sans">Jars Delivered</span>
          </div>

          <div className="space-y-0.5">
            <span className="font-fraunces text-xl sm:text-2xl font-bold text-gold-antique block">98%</span>
            <span className="text-[10px] sm:text-xs text-cream-warm/65 font-sans">Repeat Order Rate</span>
          </div>
        </div>

      </div>
    </section>
  );
};

