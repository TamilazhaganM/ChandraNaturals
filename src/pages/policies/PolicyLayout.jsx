import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, ChevronRight, Mail, Phone, MapPin, FileText, Lock, Truck, RotateCcw } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

const POLICY_LINKS = [
  { path: '/privacy-policy', label: 'Privacy Policy', icon: Lock },
  { path: '/terms', label: 'Terms & Conditions', icon: FileText },
  { path: '/shipping-policy', label: 'Shipping & Delivery', icon: Truck },
  { path: '/refund-policy', label: 'Refunds & Returns', icon: RotateCcw },
];

export const PolicyLayout = ({
  title,
  subtitle,
  lastUpdated = 'September 2026',
  badgeText = 'Legal Transparency & Consumer Trust',
  children
}) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-forest-ink bg-botanical-mesh text-cream-warm pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-cream-warm/70 font-sans">
          <Link to="/" className="hover:text-gold-antique transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-cream-warm/40" />
          <span className="text-cream-warm/80">Policies</span>
          <ChevronRight className="w-3.5 h-3.5 text-cream-warm/40" />
          <span className="text-gold-antique font-semibold">{title}</span>
        </nav>

        {/* Hero Editorial Header Banner */}
        <header className="relative overflow-hidden rounded-3xl bg-forest-deep border border-gold-antique/30 p-6 sm:p-10 shadow-lg dark:shadow-2xl">
          {/* Decorative blurs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gold-antique/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-forest-moss/25 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-gold-antique/15 text-gold-antique border border-gold-antique/30 font-sans">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{badgeText}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream-warm font-bold tracking-tight">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-cream-warm/80 font-sans leading-relaxed">
              {subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-cream-warm/65 font-mono">
              <span>Effective Date: 1st January 2026</span>
              <span>•</span>
              <span>Last Revised: {lastUpdated}</span>
              <span>•</span>
              <span className="text-gold-antique">FSSAI Lic: {siteConfig.fssaiNumber}</span>
            </div>
          </div>
        </header>

        {/* 2-Column Grid: Policy Navigation Sidebar + Policy Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Quick Policies Navigation & Grievance Card (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6 sticky top-28">
            
            {/* Policy Switcher */}
            <div className="p-4 sm:p-5 rounded-2xl bg-forest-deep border border-gold-antique/25 shadow-md space-y-2">
              <h3 className="px-2 pb-1 text-xs font-bold uppercase tracking-wider text-gold-antique font-sans">
                Our Legal Policies
              </h3>
              <div className="space-y-1">
                {POLICY_LINKS.map(link => {
                  const isActive = location.pathname === link.path;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-gold-antique text-[#0F1D12] font-bold shadow-sm'
                          : 'text-cream-warm/80 hover:bg-forest-moss/40 hover:text-cream-warm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#0F1D12]' : 'text-cream-warm/40'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Consumer Grievance & Legal Officer Card */}
            <div className="p-5 rounded-2xl bg-forest-deep border border-gold-antique/25 shadow-md space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-gold-antique font-bold font-sans block">
                Nodal Grievance Officer
              </span>
              <p className="text-xs text-cream-warm/80 leading-relaxed font-sans">
                In compliance with Consumer Protection (E-Commerce) Rules and Information Technology Act, you may reach our designated compliance team:
              </p>
              
              <div className="space-y-2 pt-1 text-xs font-sans">
                <div className="flex items-center gap-2 text-cream-warm/90">
                  <Mail className="w-3.5 h-3.5 text-gold-antique shrink-0" />
                  <a href={`mailto:${siteConfig.supportEmail}`} className="hover:underline text-gold-antique">
                    {siteConfig.supportEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-cream-warm/90">
                  <Phone className="w-3.5 h-3.5 text-gold-antique shrink-0" />
                  <span>{siteConfig.phoneDisplay} (Mon-Sat, 9AM-6PM IST)</span>
                </div>
                <div className="flex items-start gap-2 text-cream-warm/80">
                  <MapPin className="w-3.5 h-3.5 text-gold-antique shrink-0 mt-0.5" />
                  <span>{siteConfig.locationDisplay}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Policy Document Prose (8 Cols) */}
          <main className="lg:col-span-8">
            <article className="p-6 sm:p-10 rounded-3xl bg-forest-deep border border-gold-antique/25 shadow-md space-y-8 font-sans leading-relaxed text-sm sm:text-base text-cream-warm/85">
              {children}
            </article>
          </main>

        </div>
      </div>
    </div>
  );
};

export default PolicyLayout;
