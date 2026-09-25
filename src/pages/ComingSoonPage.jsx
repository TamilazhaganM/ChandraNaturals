import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, Sparkles, ShieldCheck, Lock, Eye } from 'lucide-react';

export function ComingSoonPage({ onUnlockPreview }) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const secretKey = (import.meta.env.VITE_PREVIEW_SECRET || 'chandra').trim().toLowerCase();

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passphrase.trim().toLowerCase() === secretKey) {
      sessionStorage.setItem('cn_preview_access', 'true');
      if (onUnlockPreview) onUnlockPreview();
      else window.location.reload();
    } else {
      setErrorMsg('Invalid access key. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-forest-ink text-cream-warm flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Decorative Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold-antique/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-forest-moss/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-8 flex items-center justify-between border-b border-cream-warm/10">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Chandra Naturals Logo"
            className="w-12 h-12 rounded-full border border-gold-antique/30 shadow-gold-glow object-cover"
          />
          <div>
            <h1 className="font-fraunces text-xl font-bold tracking-wide text-cream-ivory">Chandra Naturals</h1>
            <p className="text-xs text-gold-champagne tracking-wider uppercase">Authentic & Traditional</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-antique/15 text-gold-champagne border border-gold-antique/30">
          <Sparkles className="w-3.5 h-3.5 text-gold-antique animate-pulse" />
          Grand Launch Soon
        </span>
      </header>

      {/* Main Hero Card */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-center my-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-warm/5 border border-cream-warm/15 text-xs text-cream-warm/80 mb-6 backdrop-blur-sm">
          <ShieldCheck className="w-4 h-4 text-gold-antique" />
          <span>Handcrafted Batches in Preparation</span>
        </div>

        <h2 className="font-fraunces text-3xl sm:text-5xl font-extrabold text-cream-ivory leading-tight mb-6 tracking-tight">
          We’re Crafting Something <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-soft via-gold-champagne to-gold-antique">
            Pure & Truly Authentic
          </span>
        </h2>

        <p className="text-cream-warm/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-10 font-sans">
          Our online store is currently in private preparation while we curate small-batch artisanal thokkus, Vedic A2 bilona ghee, and traditional staples. We look forward to welcoming you soon!
        </p>

        {/* Inquiries & Direct Reach */}
        <div className="w-full max-w-md bg-forest-deep/80 backdrop-blur-md border border-gold-antique/20 rounded-2xl p-6 shadow-moon-ambient">
          <p className="text-xs uppercase tracking-widest text-gold-champagne font-semibold mb-4">
            For Early Inquiries & Direct Orders
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://wa.me/917358808966?text=Hi%20Chandra%20Naturals%2C%20I%20would%20like%20to%20inquire%20about%20your%20upcoming%20launch!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:opacity-95 transition-all shadow-md active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>

            <a
              href="tel:+917358808966"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-forest-moss border border-cream-warm/20 text-cream-ivory text-xs font-semibold hover:bg-forest-moss/80 transition-all shadow-md active:scale-95"
            >
              <Phone className="w-4 h-4 text-gold-champagne" />
              +91 73588 08966
            </a>
          </div>

          <div className="mt-4 pt-4 border-t border-cream-warm/10 flex items-center justify-center gap-2 text-xs text-cream-warm/60">
            <Mail className="w-3.5 h-3.5 text-gold-antique" />
            <a href="mailto:chandranaturals1@gmail.com" className="hover:text-gold-champagne transition-colors">
              chandranaturals1@gmail.com
            </a>
          </div>
        </div>
      </main>

      {/* Footer & Secret Preview Unlock */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 border-t border-cream-warm/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-warm/50">
        <div>
          © {new Date().getFullYear()} Chandra Naturals. All rights reserved.
        </div>

        <button
          onClick={() => setShowUnlockModal(true)}
          className="text-cream-warm/25 hover:text-gold-antique transition-colors p-1"
          aria-label="Admin access"
          title=""
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </footer>

      {/* Unlock Passphrase Modal for Store Owners/Admins */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-forest-deep border border-gold-antique/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold-antique" />
                <h3 className="font-fraunces font-bold text-cream-ivory text-base">Authorized Access</h3>
              </div>
              <button
                onClick={() => { setShowUnlockModal(false); setErrorMsg(''); setPassphrase(''); }}
                className="text-cream-warm/50 hover:text-cream-ivory text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-cream-warm/70 mb-4">
              Enter authorized access key to preview the store.
            </p>

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                placeholder="Access key"
                value={passphrase}
                onChange={(e) => { setPassphrase(e.target.value); setErrorMsg(''); }}
                className="w-full px-3 py-2 rounded-lg bg-forest-ink border border-cream-warm/20 text-cream-ivory text-sm focus:outline-none focus:border-gold-antique tracking-wider"
                autoFocus
              />

              {errorMsg && (
                <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-gold-antique text-forest-ink font-semibold text-xs hover:bg-gold-champagne transition-all"
                >
                  Unlock Store
                </button>
                <a
                  href="/admin"
                  className="px-3 py-2 rounded-lg border border-cream-warm/20 text-cream-warm hover:text-cream-ivory text-xs text-center font-medium"
                >
                  Admin
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
