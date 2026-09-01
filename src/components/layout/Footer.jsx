import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { siteConfig } from '../../config/siteConfig';
import { MessageSquare, ShieldCheck, ExternalLink, QrCode } from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export const Footer = () => {
  return (
    <footer className="relative bg-forest-ink text-cream-warm border-t border-gold-antique/25 pt-20 pb-12 overflow-hidden">
      {/* Background Subtle Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-antique/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-forest-moss/40 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-gold-antique/20">
          
          {/* Column 1: Brand & Philosophy (5 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <BrandLogo size="lg" asLink={true} />
            <p className="text-sm font-sans leading-relaxed text-cream-warm/80 max-w-sm">
              Rooted in heirloom family kitchens and slow-crafted in small batches. We bring authentic, preservative-free traditional food treasures to your everyday dining table.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <span className="font-caveat text-2xl text-gold-antique">
                Handmade with care & purity
              </span>
            </div>

            {/* FSSAI Registration Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-forest-deep border border-gold-antique/30 text-xs shadow-sm">
              <ShieldCheck className="w-5 h-5 text-gold-antique flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gold-antique font-semibold block font-sans">Food Safety Verified</span>
                <span className="font-mono text-cream-warm font-semibold">
                  FSSAI No: {siteConfig.fssaiNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-fraunces text-base font-semibold text-gold-antique tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm font-sans">
              <li>
                <Link to="/" className="hover:text-gold-antique transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold-antique transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-gold-antique transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-gold-antique transition-colors">
                  My Account / Register
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold-antique transition-colors">
                  About Our Kitchen
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-antique transition-colors">
                  Contact & Map
                </Link>
              </li>
              <li>
                <Link to="/shop/combos" className="hover:text-gold-antique transition-colors">
                  Special Combos
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Collections (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-fraunces text-base font-semibold text-gold-antique tracking-wider uppercase">
              Pantry Categories
            </h4>
            <ul className="space-y-2.5 text-sm font-sans">
              <li>
                <Link to="/shop/thokku" className="hover:text-gold-antique transition-colors flex items-center justify-between">
                  <span>🫙 Thokku Varieties</span>
                  <span className="text-xs text-gold-antique/70 font-mono">6 items</span>
                </Link>
              </li>
              <li>
                <Link to="/shop/health-mix" className="hover:text-gold-antique transition-colors flex items-center justify-between">
                  <span>🌾 Health Mix & Grains</span>
                  <span className="text-xs text-gold-antique/70 font-mono">4 items</span>
                </Link>
              </li>
              <li>
                <Link to="/shop/ghee" className="hover:text-gold-antique transition-colors flex items-center justify-between">
                  <span>🧈 Ghee</span>
                  <span className="text-xs text-gold-antique/70 font-mono">3 items</span>
                </Link>
              </li>
              <li>
                <Link to="/shop/masalas" className="hover:text-gold-antique transition-colors flex items-center justify-between">
                  <span>🌶️ Masalas</span>
                  <span className="text-xs text-gold-antique/70 font-mono">4 items</span>
                </Link>
              </li>
              <li>
                <Link to="/shop/skin-hair" className="hover:text-gold-antique transition-colors flex items-center justify-between">
                  <span>🌿 Skin & Hair Care</span>
                  <span className="text-xs text-gold-antique/70 font-mono">4 items</span>
                </Link>
              </li>
              <li>
                <Link to="/shop/combos" className="hover:text-gold-antique transition-colors flex items-center justify-between">
                  <span>🎁 Combo Sets & Value Packs</span>
                  <span className="text-xs text-gold-antique/70 font-mono">4 sets</span>
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-forest-deep border border-gold-antique/25 text-xs space-y-1">
                <span className="text-gold-antique font-semibold block font-sans">🌱 Small Batch Promise</span>
                <p className="text-cream-warm/75 text-[11px] leading-relaxed font-sans">
                  Prepared in micro-quantities to ensure zero compromise on taste, aroma, and natural longevity.
                </p>
              </div>
            </div>
          </div>

          {/* Column 4: Instagram QR & Direct WhatsApp (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-fraunces text-base font-semibold text-gold-antique tracking-wider uppercase">
              Connect With Us
            </h4>

            {/* Instagram QR Code Placeholder Box */}
            <div className="p-4 rounded-2xl bg-forest-deep border-2 border-dashed border-gold-antique/40 flex flex-col items-center text-center space-y-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gold-antique font-sans">
                <InstagramIcon className="w-4 h-4" />
                <span>Scan to follow on Instagram</span>
              </div>
              
              {/* Artistic QR Placeholder visual */}
              <div className="w-28 h-28 bg-[#FFFDF8] p-2 rounded-xl border border-gold-antique/50 flex flex-col items-center justify-center relative shadow-inner">
                <QrCode className="w-20 h-20 text-[#0F1D12]" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 rounded-full bg-forest-ink flex items-center justify-center border border-gold-antique shadow-sm">
                    <span className="font-fraunces text-[9px] text-gold-antique font-bold">CN</span>
                  </div>
                </div>
              </div>

              {/* REPLACE_WITH_INSTAGRAM */}
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-antique hover:text-gold-champagne transition-colors font-sans"
              >
                <span>{siteConfig.instagram}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Direct WhatsApp Action */}
            <div className="pt-1">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hello Chandra Naturals, I have a query about your products.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/60 text-[#25D366] text-xs font-semibold uppercase tracking-wider transition-colors font-sans"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Note */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-warm/60 font-sans">
          <p>© {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Crafted with traditional love & authentic kitchen recipes</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
