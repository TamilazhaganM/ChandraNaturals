import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { siteConfig } from '../config/siteConfig';
import { Leaf, Heart, Sparkles, ShieldCheck, Sun, Flame, Utensils, CheckCircle2, ArrowRight, Award, Star, Quote } from 'lucide-react';
import heroImg from '../assets/hero.png';
import ceoImg from '../assets/ceo_photo.jpg';

export const AboutPage = () => {
  const pillars = [
    {
      icon: Flame,
      title: "Woodfire Slow Cooking",
      desc: "We slow-simmer our thokkus in traditional heavy brass and stone urns over woodfire, allowing the natural aromas and oils to fuse without scorching."
    },
    {
      icon: Award,
      title: "Vedic A2 Bilona Method",
      desc: "Our cultured ghee is churned from the milk of grass-fed native indigenous cows using two-way wooden bilona churners to yield nutrient-dense granular makkhan."
    },
    {
      icon: Leaf,
      title: "Unrefined Native Oils",
      desc: "Cold-pressed wood-pressed (marachekku) sesame and groundnut oils serve as nature’s protective blankets, guaranteeing genuine taste and longevity."
    },
    {
      icon: ShieldCheck,
      title: "100% Preservative Free",
      desc: "No synthetic chemical stabilizers (INS 211 / benzoates), artificial flavor enhancers, or artificial food colorings are ever used in our kitchen."
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Editorial Hero Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-forest-deep border border-gold-antique/40 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-antique" />
              <span className="font-caveat text-2xl text-gold-antique font-semibold">
                Our Story & Philosophy
              </span>
            </div>

            <h1 className="font-fraunces text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-cream-warm leading-tight">
              Preserving the sacred warmth of the{' '}
              <span className="italic font-normal text-gold-gradient">
                Indian home kitchen.
              </span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-cream-warm/85 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              At Chandra Naturals, we believe real food should taste like family heritage. We recreate the authentic flavors of our grandmothers’ pantries using heirloom recipes, wood-pressed oils, and traditional slow cooking.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold uppercase tracking-wider text-gold-antique">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-deep border border-gold-antique/30">
                <CheckCircle2 className="w-4 h-4" /> Small-Batch Made
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-deep border border-gold-antique/30">
                <CheckCircle2 className="w-4 h-4" /> 100% Traditional
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-deep border border-gold-antique/30">
                <CheckCircle2 className="w-4 h-4" /> FSSAI Certified
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-dashed border-gold-antique/60 shadow-2xl p-4 bg-forest-deep flex items-center justify-center">
              <img
                src={heroImg}
                alt="Chandra Naturals Heritage Kitchen"
                className="w-full h-full object-cover rounded-2xl drop-shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-ink/90 via-transparent to-transparent pointer-events-none rounded-3xl" />
              <div className="absolute bottom-6 left-6 right-6 text-center text-cream-warm font-caveat text-2xl text-gold-antique">
                "Pure ingredients, honest methods, timeless flavor."
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Section: The Heritage */}
        <div className="p-8 sm:p-12 rounded-3xl bg-forest-deep border border-gold-antique/30 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4 border-b lg:border-b-0 lg:border-r border-gold-antique/20 pb-8 lg:pb-0 lg:pr-8">
            <BrandLogo size="lg" showText={true} />
            <p className="font-caveat text-2xl text-gold-antique">
              Founded on Love & Tradition
            </p>
            <div className="p-3 rounded-xl bg-forest-ink border border-gold-antique/25 text-xs text-cream-warm/80 font-sans space-y-1">
              <span className="text-gold-antique font-semibold block">FSSAI Registration</span>
              <span className="font-mono">{siteConfig.fssaiNumber}</span>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 font-sans text-sm sm:text-base text-cream-warm/85 leading-relaxed">
            <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-cream-warm">
              Why We Choose the Slow, Traditional Path
            </h3>
            <p>
              In modern commercial food manufacturing, speed and shelf-life are prized above nutrition and flavor. Industrial acids, synthetic preservatives, and cheap palm oils replace the natural goodness of fresh harvests and wood-pressed gingelly oils.
            </p>
            <p>
              We founded Chandra Naturals to offer families an authentic alternative. Every jar that leaves our kitchen is made the way our grandmothers prepared it: sun-cured with unrefined sea salt, seasoned with roasted whole spices, and simmered slowly until the rich oil rises to the surface.
            </p>
          </div>
        </div>

        {/* 4 Pillars of Craftsmanship */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-caveat text-2xl sm:text-3xl text-gold-antique font-semibold block">
              Our Core Standards
            </span>
            <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-cream-warm">
              The 4 Pillars of Chandra Naturals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-forest-deep border border-gold-antique/30 hover:border-gold-antique transition-all duration-300 space-y-3 group shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-antique/15 text-gold-antique flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-fraunces text-lg font-bold text-cream-warm">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-cream-warm/75 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meet Our Founder Section */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-caveat text-2xl sm:text-3xl text-gold-antique font-semibold block">
              The Heart Behind Every Jar
            </span>
            <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-cream-warm">
              Meet Our Founder
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* CEO Card */}
            <div className="relative p-6 sm:p-10 rounded-3xl bg-forest-deep border-2 border-gold-antique/40 hover:border-gold-antique transition-all duration-300 shadow-xl flex flex-col gap-6 group">
              {/* Decorative quote mark */}
              <div className="absolute top-5 right-6 text-gold-antique/15 font-serif text-8xl font-bold leading-none select-none pointer-events-none">
                &ldquo;
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-gold-antique/60 shadow-lg">
                    <img
                      src={ceoImg}
                      alt="Chandra Devi, Founder & CEO of Chandra Naturals"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gold-antique flex items-center justify-center shadow-md">
                    <Star className="w-4 h-4 text-forest-ink fill-forest-ink" />
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-cream-warm">
                    Chandra Devi
                  </h3>
                  <span className="font-caveat text-xl text-gold-antique block">
                    Founder & Chief Experience Officer
                  </span>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                    <span className="px-3 py-1 rounded-full bg-gold-antique/15 text-gold-antique text-xs font-semibold font-sans uppercase tracking-wider border border-gold-antique/30">
                      Artisan Chef
                    </span>
                    <span className="px-3 py-1 rounded-full bg-forest-ink text-cream-warm/75 text-xs font-semibold font-sans uppercase tracking-wider border border-gold-antique/20">
                      22+ Years Experience
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 font-sans text-sm sm:text-base text-cream-warm/85 leading-relaxed">
                <p>
                  Chandra grew up watching her grandmother slow-simmer thokku in brass urns every summer. Determined to preserve that flavor for every Indian family, she left her corporate career in 2019 to build Chandra Naturals — cooking every batch by hand, refusing to add a single preservative.
                </p>
                <p>
                  Her mission is simple: <em className="text-gold-antique not-italic font-semibold">"Every jar should taste like your grandmother made it."</em> Today, she personally oversees every recipe, every sourcing decision, and every shipment.
                </p>
              </div>

              <div className="pt-4 border-t border-gold-antique/20 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: '25+', sub: 'Unique Recipes' },
                  { label: '3500+', sub: 'Happy Families' },
                  { label: '100%', sub: 'Pure & Natural' },
                ].map(stat => (
                  <div key={stat.label}>
                    <span className="font-fraunces text-xl sm:text-2xl font-bold text-gold-antique block">{stat.label}</span>
                    <span className="text-[10px] sm:text-xs text-cream-warm/65 font-sans uppercase tracking-wider">{stat.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="p-8 sm:p-12 rounded-3xl bg-forest-deep border-2 border-gold-antique/50 text-center space-y-6 shadow-2xl">
          <span className="font-caveat text-3xl text-gold-antique block">
            Experience the Taste of Authentic Tradition
          </span>
          <h2 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold text-cream-warm">
            Ready to bring Chandra Naturals into your home?
          </h2>
          <p className="font-sans text-sm sm:text-base text-cream-warm/80 max-w-xl mx-auto">
            Browse our small-batch thokkus, Vedic ghee, and wellness powders. Each order is prepared fresh and shipped with utmost care.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/shop"
              className="px-8 py-3.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-gold-glow flex items-center gap-2 group"
            >
              <span>Explore Our Shop</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-xl bg-forest-ink hover:bg-forest-moss text-cream-warm border border-gold-antique/40 hover:border-gold-antique font-sans font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all"
            >
              <span>Contact Us</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
