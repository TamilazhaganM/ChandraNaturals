import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, ArrowRight, Sparkles, Store, KeyRound, AlertCircle } from 'lucide-react';

export const AdminGuard = ({ children }) => {
  const { user, isAuthenticated, loading, login } = useAuth();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Loading state during auth restore
  if (loading) {
    return (
      <div className="min-h-screen bg-forest-ink flex flex-col items-center justify-center p-6 text-cream-warm">
        <div className="w-16 h-16 rounded-2xl bg-forest-deep border border-gold-antique/40 flex items-center justify-center animate-spin text-gold-antique shadow-2xl mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <p className="font-serif text-lg font-bold text-gold-antique tracking-wide">
          Chandra Naturals Operations
        </p>
        <p className="text-xs text-cream-warm/60 font-sans mt-1">
          Authenticating secure kitchen & dispatch clearance...
        </p>
      </div>
    );
  }

  // 2. User is already authenticated AND has admin role
  if (isAuthenticated && user?.role === 'admin') {
    return children;
  }

  // 3. User is logged in as a normal customer (not an admin) or completely logged out
  const handleAdminLogin = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const targetIdentifier = identifier.trim() || 'admin@chandranaturals.com';
    const targetPassword = password.trim() || 'AdminPass@Chandra2026';

    const res = await login({ identifier: targetIdentifier, password: targetPassword });
    setSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Invalid administrative credentials.');
    } else if (res.user?.role !== 'admin') {
      setErrorMsg('This account does not have store administrator privileges. Please sign in with an Admin account.');
    }
  };

  const handleQuickDemoLogin = async () => {
    setIdentifier('admin@chandranaturals.com');
    setPassword('AdminPass@Chandra2026');
    setErrorMsg('');
    setSubmitting(true);

    const res = await login({
      identifier: 'admin@chandranaturals.com',
      password: 'AdminPass@Chandra2026'
    });
    setSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Could not authenticate demo admin.');
    }
  };

  return (
    <div className="min-h-screen bg-forest-ink flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-antique/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-forest-moss/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Top Brand Emblem */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forest-deep border-2 border-gold-antique text-gold-antique shadow-2xl mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream-warm tracking-wide">
            Kitchen & Store Operations
          </h1>
          <p className="text-xs sm:text-sm text-cream-warm/75 font-sans max-w-xs mx-auto">
            Protected management portal for order fulfillment, live dispatch tracking, and small-batch inventory.
          </p>
        </div>

        {/* Portal Login Card */}
        <div className="rounded-3xl bg-forest-deep border border-gold-antique/35 p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-sans flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <p>{errorMsg}</p>
            </div>
          )}

          {isAuthenticated && user?.role !== 'admin' && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-sans">
              Currently signed in as customer <span className="font-bold">{user.email}</span>. Please sign in with administrator credentials to access store operations.
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cream-warm/80 font-sans block">
                Admin Email or Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@chandranaturals.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-forest-ink border border-gold-antique/30 text-cream-warm placeholder:text-cream-warm/30 text-sm font-sans focus:outline-none focus:border-gold-antique focus:ring-1 focus:ring-gold-antique transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cream-warm/80 font-sans block">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-forest-ink border border-gold-antique/30 text-cream-warm placeholder:text-cream-warm/30 text-sm font-sans focus:outline-none focus:border-gold-antique focus:ring-1 focus:ring-gold-antique transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gold-antique hover:bg-gold-champagne text-[#0F1D12] font-bold font-sans text-sm transition-all shadow-lg hover:shadow-gold-antique/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0F1D12] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Clearance...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Enter Operations Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-4 border-t border-gold-antique/20 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-cream-warm/60 font-sans">
              <span>Demo Quick Sign-In</span>
              <span className="font-mono text-[10px] text-gold-antique">Admin Role</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={submitting}
              className="w-full py-2.5 px-3 rounded-xl bg-forest-ink hover:bg-forest-moss/30 border border-gold-antique/30 hover:border-gold-antique text-gold-antique text-xs font-semibold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In as Demo Store Administrator</span>
            </button>
          </div>
        </div>

        {/* Back to store navigation */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-cream-warm/70 hover:text-gold-antique transition-colors font-sans"
          >
            <Store className="w-4 h-4" />
            <span>Return to Chandra Naturals Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
