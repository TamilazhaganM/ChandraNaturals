import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Package,
  Layers,
  BarChart3,
  Store,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  ChefHat,
  Sparkles,
  ExternalLink,
  Clock
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    {
      to: '/admin/orders',
      label: 'Kitchen & Orders',
      icon: Package,
      badge: 'Live'
    },
    {
      to: '/admin/inventory',
      label: 'Inventory & Batches',
      icon: Layers
    },
    {
      to: '/admin/dashboard',
      label: 'Dashboard & Metrics',
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-forest-ink text-cream-warm flex flex-col font-sans transition-colors duration-300">
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Top Operations Header                                                         */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-forest-deep/95 backdrop-blur-md border-b border-gold-antique/25 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Brand & Operations Title */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/admin/orders"
                className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-forest-ink border border-gold-antique flex items-center justify-center text-gold-antique shadow-md group-hover:scale-105 transition-transform">
                  <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base sm:text-lg font-bold text-cream-warm tracking-wide group-hover:text-gold-antique transition-colors">
                      Chandra Naturals
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-antique/20 border border-gold-antique/40 text-gold-antique hidden sm:inline">
                      Store Ops
                    </span>
                  </div>
                  <p className="text-[11px] text-cream-warm/60 font-sans hidden sm:block">
                    Kitchen Fulfillment & Small-Batch Dispatch Control
                  </p>
                </div>
              </Link>
            </div>

            {/* Right: Actions, Theme, Storefront Link, Admin Badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Storefront Link */}
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-ink hover:bg-forest-moss/40 border border-gold-antique/30 text-gold-antique hover:text-gold-champagne text-xs font-semibold transition-all shadow-sm"
                title="Open Public Storefront in new tab"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden md:inline">View Store</span>
                <ExternalLink className="w-3 h-3 text-gold-antique/60" />
              </Link>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-forest-ink border border-gold-antique/30 text-gold-antique hover:text-gold-champagne transition-all cursor-pointer"
                title="Toggle Dark / Light Theme"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Admin Profile & Sign Out */}
              <div className="flex items-center gap-2 pl-2 border-l border-gold-antique/20">
                <div className="hidden lg:block text-right">
                  <span className="text-xs font-bold text-cream-warm block">
                    {user?.name || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-gold-antique font-mono uppercase tracking-wider">
                    {user?.role || 'Admin'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-forest-ink hover:bg-rose-500/15 border border-gold-antique/30 hover:border-rose-400 text-cream-warm/80 hover:text-rose-400 transition-all cursor-pointer"
                  title="Sign out of Admin Portal"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 border-t border-gold-antique/15">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-gold-antique text-[#0F1D12] font-bold shadow-md shadow-gold-antique/20'
                        : 'text-cream-warm/80 hover:text-cream-warm hover:bg-forest-ink/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Main Outlet Body Area                                                         */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
        <Outlet />
      </main>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Discrete Admin Footer                                                         */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gold-antique/15 bg-forest-deep/60 py-4 text-center text-xs text-cream-warm/50 font-sans">
        <p>
          Chandra Naturals Operations Hub • Small Batch Artisanal Foods • Coimbatore, Tamil Nadu
        </p>
      </footer>
    </div>
  );
};
