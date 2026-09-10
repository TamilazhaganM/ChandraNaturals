import React, { useState, useEffect } from 'react';
import { ArrowDown, Sparkles, ChevronLeft, ChevronRight, ShoppingBag, Star, ShieldCheck, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { productCategories } from '../../data/products';

import bannerTomatoMix from '../../assets/Banners/tomato_mix_banner_1788165188730.jpg';
import bannerGhee from '../../assets/Banners/Ghee.png';
import bannerPirandaiMudakathan from '../../assets/Banners/Pirandai and mudakathan.png';
import bannerTomatoPoondu from '../../assets/Banners/Tomato and poondu.png';

export const Hero = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const bannerSlides = [
    {
      id: 1,
      tag: "Signature Relish",
      title: "Country Tomato (Thakkali) Thokku",
      subtitle: "Slow-simmered in small batches with native cold-pressed gingelly oil and hand-roasted spices.",
      badge: "Signature Pick",
      image: bannerTomatoMix,
      link: "/shop/thokku",
      linkText: "Explore Collection"
    },
    {
      id: 2,
      tag: "Vedic Tradition",
      title: "Cultured A2 Bilona Ghee",
      subtitle: "Handcrafted from grass-fed native indigenous cow curd using traditional wooden bilona churning.",
      badge: "Pure A2 Ghee",
      image: bannerGhee,
      link: "/shop/ghee",
      linkText: "Explore Collection"
    },
    {
      id: 3,
      tag: "Medicinal Greens",
      title: "Pirandai & Mudakathan Thokku",
      subtitle: "Wild-harvested medicinal greens for natural joint comfort, digestive wellness, and bone vitality.",
      badge: "Joint & Gut Care",
      image: bannerPirandaiMudakathan,
      link: "/shop/thokku",
      linkText: "Explore Collection"
    },
    {
      id: 4,
      tag: "Immunity & Flavor",
      title: "Tomato & Poondu (Garlic) Thokku",
      subtitle: "Slow-simmered country tomatoes with whole roasted garlic cloves and native wood-pressed gingelly oil.",
      badge: "Bestseller Combo",
      image: bannerTomatoPoondu,
      link: "/shop/thokku",
      linkText: "Explore Collection"
    }
  ];

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, bannerSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  // 6 balanced categories for even 3x2 on mobile, 6x1 on desktop
  const allHeroCategories = [
    ...productCategories,
    {
      id: 'combos',
      name: 'Combo Sets',
      subtitle: 'Value Sets',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop'
    }
  ];

  return (
    <section id="home" className="relative pt-28 sm:pt-32 pb-12 overflow-hidden bg-botanical-mesh">
      {/* Ambient Glowing Orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gold-antique/10 rounded-full filter blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-36 right-10 w-72 h-72 bg-forest-moss/50 rounded-full filter blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-forest-deep/80 rounded-full filter blur-[90px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 space-y-10">
        
        {/* Full-Width Brand Banner Carousel (100% Full Content Visible, No Cropping) */}
        <div
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-forest-deep border-2 border-gold-antique/40 shadow-2xl group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Slides Track: Taller height on mobile for clear visibility, widescreen aspect ratio on tablet & desktop */}
          <div className="relative w-full min-h-[260px] sm:min-h-0 aspect-[4/3] sm:aspect-[1376/768] overflow-hidden bg-forest-ink">
            {bannerSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide
                    ? 'opacity-100 z-10'
                    : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                <Link
                  to={slide.link}
                  aria-label={`Explore ${slide.title}`}
                  className="block w-full h-full relative group/banner cursor-pointer"
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </Link>
              </div>
            ))}
          </div>

          {/* Slider Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous Banner Slide"
            className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-forest-ink/85 hover:bg-forest-ink text-gold-antique border border-gold-antique/50 hover:border-gold-antique transition-all shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Banner Slide"
            className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-forest-ink/85 hover:bg-forest-ink text-gold-antique border border-gold-antique/50 hover:border-gold-antique transition-all shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Progress Bar / Indicators */}
          <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2">
            {bannerSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to banner slide ${idx + 1}`}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? 'w-6 sm:w-8 bg-gold-antique shadow-gold-glow'
                    : 'w-1.5 sm:w-2 bg-gold-antique/40 hover:bg-gold-antique/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Brand Editorial & Trust Messaging Section Below Banner */}
        <div className="space-y-6 text-center max-w-4xl mx-auto pt-2">
          
          {/* Top Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-deep border border-gold-antique/30 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-gold-antique animate-pulse" />
            <span className="font-caveat text-xl sm:text-2xl text-gold-antique font-semibold tracking-wide">
              From Our Hearth to Your Table
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="font-fraunces text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] text-cream-warm">
              Tradition, preserved in{' '}
              <span className="italic font-normal text-gold-gradient relative inline-block">
                every jar.
                <svg className="absolute -bottom-1.5 left-0 w-full h-2.5 text-gold-antique/50" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 10 Q50 20 100 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="font-sans text-sm sm:text-base md:text-lg text-cream-warm/85 leading-relaxed max-w-2xl mx-auto font-normal">
              Handcrafted small-batch thokkus, Vedic A2 bilona ghee, and multi-millet porridge mixes prepared with authentic heirloom recipes. Zero preservatives, 100% pure taste.
            </p>
          </div>
        </div>

        {/* Circular Categories Showcase Strip */}
        <div className="pt-6 border-t border-gold-antique/20 space-y-5">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-antique" />
              <h2 className="font-fraunces text-xl sm:text-2xl font-bold text-cream-warm">
                Explore by Category
              </h2>
            </div>
          </div>

          {/* Round Categories Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-6 justify-items-center">
            {allHeroCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop/${cat.id}`}
                className="group flex flex-col items-center text-center space-y-2.5 cursor-pointer w-full max-w-[120px] sm:max-w-[140px]"
              >
                {/* Round Image Frame */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-1 border-2 border-gold-antique/40 group-hover:border-gold-antique bg-forest-deep shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-gold-glow">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Category Label */}
                <span className="font-sans text-xs sm:text-sm font-semibold text-cream-warm group-hover:text-gold-antique transition-colors leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Down Scroll Indicator */}
      <div
        className="mt-8 flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => scrollTo('#trust-badges')}
      >
        <span className="text-[10px] tracking-widest uppercase font-semibold text-gold-antique font-sans">Scroll</span>
        <ArrowDown className="w-4 h-4 text-gold-antique animate-bounce" />
      </div>
    </section>
  );
};

