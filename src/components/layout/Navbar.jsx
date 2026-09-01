import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { products } from '../../data/products';
import {
  ShoppingBag, Sun, Moon, X, ArrowRight,
  ChevronDown, Heart, Search, ArrowUpRight, Menu,
  Truck, Package, Leaf, Sparkles, Home, User
} from 'lucide-react';

export const Navbar = () => {
  const { toggleTheme, isDark } = useTheme();
  const { itemCount, subtotal, setActiveProductModal } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopDropdownOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  // ESC & click-outside close search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
    };
    const onClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Live product search results
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.ingredients && p.ingredients.some(i => i.toLowerCase().includes(q)))
      )
      .slice(0, 6);
  }, [searchQuery]);

  const subCategories = [
    { name: 'All Products', path: '/shop' },
    { name: 'Thokku Varieties', path: '/shop/thokku' },
    { name: 'Health Mix & Grains', path: '/shop/health-mix' },
    { name: 'Ghee', path: '/shop/ghee' },
    { name: 'Masalas', path: '/shop/masalas' },
    { name: 'Skin & Hair Care', path: '/shop/skin-hair' },
    { name: 'Special Combos', path: '/shop/combos' },
  ];

  const isCategoriesActive = (location.pathname === '/shop' || location.pathname.startsWith('/shop/')) && !location.pathname.includes('combo');
  const isSpecialComboActive = location.pathname === '/shop/combos' || location.pathname.includes('combo');

  return (
    <>
      {/* ─────────────────────────── UNIFIED FIXED HEADER ─────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
        {/* ── TOP RUNNING ANNOUNCEMENT MARQUEE ── */}
        <div className="w-full bg-forest-deep/95 backdrop-blur-md border-b border-gold-antique/25 py-1 sm:py-1.5 overflow-hidden text-gold-antique select-none">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-[11px] sm:text-xs font-semibold tracking-wider uppercase font-sans">
            {[...Array(2)].map((_, loopIdx) => (
              <div key={loopIdx} className="flex items-center gap-8">
                <span className="flex items-center gap-1.5 text-cream-warm">
                  <Truck className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Free shipping above Rs.3000</span>
                </span>
                <span className="text-gold-antique/40">•</span>
                <span className="flex items-center gap-1.5 text-cream-warm">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                  <span>Handcrafted with traditional love</span>
                </span>
                <span className="text-gold-antique/40">•</span>
                <span className="flex items-center gap-1.5 text-cream-warm">
                  <Package className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Delivery in 5-7 days</span>
                </span>
                <span className="text-gold-antique/40">•</span>
                <span className="flex items-center gap-1.5 text-cream-warm">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No preservative</span>
                </span>
                <span className="text-gold-antique/40">•</span>
                <span className="flex items-center gap-1.5 text-cream-warm">
                  <Sparkles className="w-3.5 h-3.5 text-gold-champagne" />
                  <span>A taste of home</span>
                </span>
                <span className="text-gold-antique/40">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN NAVBAR ── */}
        <div
          className={`w-full transition-all duration-300 ${isScrolled
              ? 'bg-forest-ink/95 backdrop-blur-md border-b border-gold-antique/25 shadow-lg py-2 sm:py-2.5'
              : 'bg-forest-ink/80 backdrop-blur-md border-b border-gold-antique/15 py-3 sm:py-3.5'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">

              {/* ── Brand ── */}
              <Link
                to="/"
                aria-label="Chandra Naturals Homepage"
                className="flex-shrink-0 transition-transform duration-200 hover:scale-[1.02]"
              >
                <BrandLogo size="md" />
              </Link>

              {/* ── Desktop Nav Links (hidden on mobile) Order: Home, Categories, Special Combo, About Us, Contact ── */}
              <nav className="hidden lg:flex items-center gap-7 xl:gap-8 text-sm font-medium">

                {/* 1. Home */}
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `relative py-1 font-sans transition-colors duration-200 ${isActive
                      ? 'text-gold-antique font-bold after:w-full'
                      : 'text-cream-warm/85 hover:text-gold-antique after:w-0'
                    } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-gold-antique after:transition-all after:duration-300 hover:after:w-full`
                  }
                >
                  Home
                </NavLink>

                {/* 2. Categories dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShopDropdownOpen(true)}
                  onMouseLeave={() => setShopDropdownOpen(false)}
                >
                  <NavLink
                    to="/shop"
                    className={`relative flex items-center gap-1 py-1 font-sans transition-colors duration-200 ${isCategoriesActive
                        ? 'text-gold-antique font-bold after:w-full'
                        : 'text-cream-warm/85 hover:text-gold-antique after:w-0'
                      } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-gold-antique after:transition-all after:duration-300 hover:after:w-full`}
                  >
                    <span>Categories</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${shopDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </NavLink>

                  {shopDropdownOpen && (
                    <div className="absolute top-full left-0 w-56 pt-3 z-50 animate-fade-in">
                      <div className="p-1.5 rounded-2xl bg-forest-deep border border-gold-antique/40 shadow-2xl">
                        {subCategories.map(sub => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setShopDropdownOpen(false)}
                            className="block px-4 py-2 rounded-xl text-xs font-semibold text-cream-warm hover:text-gold-antique hover:bg-forest-ink/70 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Special Combo */}
                <NavLink
                  to="/shop/combos"
                  className={`relative flex items-center gap-1.5 py-1 font-sans transition-colors duration-200 ${isSpecialComboActive
                      ? 'text-gold-antique font-bold after:w-full'
                      : 'text-cream-warm/85 hover:text-gold-antique after:w-0'
                    } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-gold-antique after:transition-all after:duration-300 hover:after:w-full`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Special Combo</span>
                </NavLink>

                {/* 4. About Us */}
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `relative py-1 font-sans transition-colors duration-200 ${isActive
                      ? 'text-gold-antique font-bold after:w-full'
                      : 'text-cream-warm/85 hover:text-gold-antique after:w-0'
                    } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-gold-antique after:transition-all after:duration-300 hover:after:w-full`
                  }
                >
                  About Us
                </NavLink>

                {/* 5. Contact */}
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `relative py-1 font-sans transition-colors duration-200 ${isActive
                      ? 'text-gold-antique font-bold after:w-full'
                      : 'text-cream-warm/85 hover:text-gold-antique after:w-0'
                    } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-gold-antique after:transition-all after:duration-300 hover:after:w-full`
                  }
                >
                  Contact
                </NavLink>

              </nav>

              {/* ── Right Action Icons ── */}
              <div className="flex items-center gap-1.5 sm:gap-2">

                {/* Search (desktop inline dropdown) */}
                <div ref={searchContainerRef} className="relative">
                  <button
                    onClick={() => setSearchOpen(v => !v)}
                    aria-label="Search products"
                    className="p-2.5 rounded-full text-gold-antique bg-forest-deep border border-gold-antique/35 hover:border-gold-antique transition-all duration-200 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {searchOpen && (
                    <div className="fixed top-22 left-3 right-3 sm:absolute sm:top-12 sm:right-0 sm:left-auto sm:w-96 sm:max-w-[390px] bg-forest-deep border border-gold-antique/40 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                      <form onSubmit={handleSearchSubmit} className="p-3 border-b border-gold-antique/20 bg-forest-ink/40">
                        <div className="relative">
                          <Search className="w-4 h-4 text-gold-antique absolute left-3 top-2.5" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search products or ingredients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-14 py-2 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs sm:text-sm font-sans placeholder:text-cream-warm/40"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2.5 top-2 text-xs text-cream-warm/50 hover:text-gold-antique px-1 cursor-pointer font-sans"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </form>

                      {searchQuery.trim().length >= 2 ? (
                        <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-gold-antique/10">
                          {searchResults.length > 0 ? (
                            <>
                              <div className="px-4 py-2 bg-forest-ink/30 text-[10px] uppercase tracking-widest text-gold-antique font-bold font-sans flex items-center justify-between">
                                <span>Search Results</span>
                                <span>{searchResults.length} found</span>
                              </div>
                              {searchResults.map(product => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => {
                                    setActiveProductModal(product);
                                    setSearchOpen(false);
                                    setSearchQuery('');
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-forest-ink/80 transition-colors text-left group cursor-pointer"
                                >
                                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gold-antique/30 bg-forest-ink">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  </div>
                                  <div className="flex-1 min-w-0 pr-1">
                                    <p className="text-xs sm:text-sm font-semibold text-cream-warm truncate group-hover:text-gold-antique font-sans">
                                      {product.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-cream-warm/60 font-sans">
                                      <span className="capitalize">{product.category.replace('-', ' ')}</span>
                                      <span>•</span>
                                      <span>{product.weight}</span>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 text-right">
                                    <span className="text-xs sm:text-sm font-bold text-gold-antique font-sans block">₹{product.price}</span>
                                    <span className="text-[10px] text-gold-antique/70 font-sans group-hover:underline">View</span>
                                  </div>
                                </button>
                              ))}
                              <div className="p-3 bg-forest-ink/40 border-t border-gold-antique/20">
                                <button
                                  type="button"
                                  onClick={handleSearchSubmit}
                                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-gold-antique hover:text-gold-champagne py-1 cursor-pointer font-sans"
                                >
                                  <span>View all results for "{searchQuery}"</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="px-4 py-8 text-center space-y-1">
                              <p className="text-xs sm:text-sm text-cream-warm/70 font-sans font-medium">No products found for "{searchQuery}"</p>
                              <p className="text-[11px] text-cream-warm/45 font-sans">Try searching by "mango", "ghee", "garlic", or "ragi"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-gold-antique font-bold font-sans px-2 pt-1 pb-0.5">
                            Browse Categories
                          </p>
                          {subCategories.slice(1).map(cat => (
                            <Link
                              key={cat.path}
                              to={cat.path}
                              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm text-cream-warm/80 hover:bg-forest-ink/70 hover:text-gold-antique transition-colors font-sans"
                            >
                              <span>{cat.name}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-gold-antique/40" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Account / Login / Register */}
                <Link
                  to="/auth"
                  aria-label={isAuthenticated ? `My Account (${user?.name})` : 'Sign In or Register'}
                  className="relative p-2.5 rounded-full text-gold-antique bg-forest-deep border border-gold-antique/35 hover:border-gold-antique hover:bg-forest-ink transition-all duration-200 cursor-pointer flex items-center gap-2 group"
                  title={isAuthenticated ? `Signed in as ${user?.name}` : 'Login / Register'}
                >
                  <User className="w-4 h-4 text-gold-antique group-hover:scale-110 transition-transform" />
                  {isAuthenticated && (
                    <span className="hidden xl:inline text-xs font-semibold text-cream-warm max-w-[100px] truncate font-sans">
                      {user?.name?.split(' ')[0]}
                    </span>
                  )}
                </Link>

                {/* Wishlist — desktop only */}
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  aria-label={`Wishlist (${wishlistCount})`}
                  className="hidden sm:flex relative p-2.5 rounded-full text-rose-400 bg-forest-deep border border-rose-400/30 hover:border-rose-400 transition-all duration-200 cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {/* Theme toggle — desktop only */}
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="hidden sm:flex p-2.5 rounded-full text-gold-antique bg-forest-deep border border-gold-antique/35 hover:border-gold-antique transition-all duration-200 cursor-pointer"
                >
                  {isDark
                    ? <Sun className="w-4 h-4 text-gold-champagne" />
                    : <Moon className="w-4 h-4" />
                  }
                </button>

                {/* Full-Size Shopping Cart button */}
                <Link
                  to="/cart"
                  aria-label={`Cart (${itemCount} items)`}
                  className="relative flex items-center gap-2 px-3 py-2.5 rounded-full bg-forest-deep border border-gold-antique/40 hover:border-gold-antique text-cream-warm hover:bg-forest-ink transition-all duration-200 group cursor-pointer"
                >
                  <div className="relative">
                    <ShoppingBag className="w-4 h-4 text-gold-antique group-hover:scale-110 transition-transform duration-200" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gold-antique text-forest-ink text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {itemCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase font-sans">
                    {itemCount > 0 ? `₹${subtotal}` : 'Cart'}
                  </span>
                </Link>

                {/* Hamburger — mobile only (lg:hidden) */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                  className="lg:hidden relative p-2.5 rounded-full bg-forest-deep border border-gold-antique/35 text-cream-warm hover:border-gold-antique transition-all duration-200 cursor-pointer"
                >
                  {/* Animated bars */}
                  <div className="w-5 h-4 flex flex-col justify-between">
                    <span className="block h-0.5 bg-gold-antique rounded-full w-full transition-all duration-300" />
                    <span className="block h-0.5 bg-gold-antique rounded-full w-3/4 transition-all duration-300" />
                    <span className="block h-0.5 bg-gold-antique rounded-full w-full transition-all duration-300" />
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────── MOBILE DRAWER MENU ─────────────────────── */}

      {/* Backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`lg:hidden fixed inset-0 z-50 bg-forest-ink/70 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* Drawer Panel — slides in from the right */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm bg-forest-ink border-l border-gold-antique/30 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold-antique/20">
          <BrandLogo size="sm" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-full bg-forest-deep border border-gold-antique/30 text-cream-warm hover:text-gold-antique hover:border-gold-antique transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2 font-sans">

          {/* 1. Home */}
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${isActive
                ? 'bg-gold-antique/15 text-gold-antique border border-gold-antique/30'
                : 'text-cream-warm hover:bg-forest-deep'
              }`
            }
          >
            <span>Home</span>
            <ArrowRight className="w-4 h-4 text-gold-antique/50" />
          </NavLink>

          {/* 2. Categories Section with Subcategories */}
          <div className="rounded-2xl bg-forest-deep/60 border border-gold-antique/25 p-3 space-y-2">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-2 py-1 text-xs uppercase tracking-widest text-gold-antique font-bold hover:text-gold-champagne transition-colors"
            >
              <span>Categories</span>
              <span className="text-[11px] font-sans font-medium text-cream-warm/70">View All →</span>
            </Link>
            <div className="space-y-0.5 pt-1 border-t border-gold-antique/15">
              {subCategories.map(cat => (
                <Link
                  key={cat.path}
                  to={cat.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-cream-warm/85 hover:bg-forest-ink hover:text-gold-antique transition-colors"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-antique/40" />
                </Link>
              ))}
            </div>
          </div>

          {/* 3. Special Combo */}
          <NavLink
            to="/shop/combos"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${isSpecialComboActive || isActive
                ? 'bg-gold-antique/15 text-gold-antique border border-gold-antique/30'
                : 'text-cream-warm hover:bg-forest-deep'
              }`
            }
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-antique" />
              <span>Special Combo</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gold-antique/50" />
          </NavLink>

          {/* 4. About Us */}
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${isActive
                ? 'bg-gold-antique/15 text-gold-antique border border-gold-antique/30'
                : 'text-cream-warm hover:bg-forest-deep'
              }`
            }
          >
            <span>About Us</span>
            <ArrowRight className="w-4 h-4 text-gold-antique/50" />
          </NavLink>

          {/* 5. Contact */}
          <NavLink
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${isActive
                ? 'bg-gold-antique/15 text-gold-antique border border-gold-antique/30'
                : 'text-cream-warm hover:bg-forest-deep'
              }`
            }
          >
            <span>Contact</span>
            <ArrowRight className="w-4 h-4 text-gold-antique/50" />
          </NavLink>

          {/* Account / User Section */}
          <Link
            to="/auth"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-cream-warm hover:bg-forest-deep transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gold-antique" />
              <span>{isAuthenticated ? `My Account (${user?.name?.split(' ')[0]})` : 'Login / Register'}</span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gold-antique/20 text-gold-antique font-bold uppercase tracking-wider">
              {isAuthenticated ? 'Active' : 'Sign In'}
            </span>
          </Link>

          {/* Divider */}
          <div className="h-px bg-gold-antique/15 my-3" />

          {/* Wishlist */}
          <button
            onClick={() => { setIsWishlistOpen(true); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-cream-warm hover:bg-forest-deep transition-colors"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Wishlist</span>
            </div>
            {wishlistCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => { toggleTheme(); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-cream-warm hover:bg-forest-deep transition-colors"
          >
            <div className="flex items-center gap-3">
              {isDark
                ? <Sun className="w-4 h-4 text-gold-champagne" />
                : <Moon className="w-4 h-4 text-gold-antique" />
              }
              <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
            </div>
          </button>
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-4 border-t border-gold-antique/20 space-y-3">
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-bold text-sm transition-all cursor-pointer shadow-gold-glow"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>View Full Cart</span>
            </div>
            <span className="font-mono text-forest-ink/80 text-xs">
              {itemCount > 0 ? `${itemCount} items · ₹${subtotal}` : 'Empty'}
            </span>
          </Link>
          <p className="text-center font-caveat text-gold-antique text-base">
            Tradition, preserved in every jar.
          </p>
        </div>
      </div>
    </>
  );
};
