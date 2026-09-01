import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { products, productCategories, comboOffers } from '../data/products';
import { ProductCard } from '../components/home/ProductCard';
import { VegMark } from '../components/common/VegMark';
import { useCart } from '../context/CartContext';
import { Search, Filter, Sparkles, Plus, ArrowLeft, SlidersHorizontal, Gift, Check, ShoppingBag } from 'lucide-react';

export const ShopPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(categoryId || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [filterVegOnly, setFilterVegOnly] = useState(false);

  // Sync state if URL param changes
  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    } else if (
      location.pathname === '/combos' ||
      location.pathname === '/special-combo' ||
      location.pathname === '/special-combos'
    ) {
      setSelectedCategory('combos');
    } else {
      setSelectedCategory('all');
    }
  }, [categoryId, location.pathname]);

  // Sync search query from URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      navigate('/shop');
    } else {
      navigate(`/shop/${catId}`);
    }
  };

  // Category Info Object
  const currentCategoryInfo = useMemo(() => {
    if (selectedCategory === 'all') {
      return {
        name: "Complete Artisanal Pantry",
        subtitle: "Traditional & Handcrafted",
        description: "Explore our full range of small-batch thokkus, slow-churned A2 bilona ghee, sprouted multi-millet porridge mixes, handcrafted masalas, and herbal skin & hair care."
      };
    }
    if (selectedCategory === 'combos') {
      return {
        name: "Artisanal Bundles & Gift Sets",
        subtitle: "Curated Sets & Special Savings",
        description: "Thoughtfully paired kitchen collections and heritage gift packs with exclusive savings."
      };
    }
    return (
      productCategories.find(c => c.id === selectedCategory) || {
        name: "Artisanal Pantry",
        subtitle: "Traditional Kitchen",
        description: "Small-batch authentic Indian kitchen delicacies."
      }
    );
  }, [selectedCategory]);

  // Filtered & Sorted Products
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'combos') {
      return comboOffers.filter(combo => {
        const matchesSearch =
          combo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          combo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          combo.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });
    }

    let items = products;

    // Category filter
    if (selectedCategory !== 'all') {
      items = items.filter(p => p.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        (p.ingredients && p.ingredients.some(ing => ing.toLowerCase().includes(q)))
      );
    }

    // Veg filter
    if (filterVegOnly) {
      items = items.filter(p => p.isVeg);
    }

    // Sort
    const sorted = [...items];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    }

    return sorted;
  }, [selectedCategory, searchQuery, sortBy, filterVegOnly]);

  const categoriesTabList = [
    { id: 'all', label: 'All Products', count: products.length },
    { id: 'thokku', label: 'Thokku Varieties', count: products.filter(p => p.category === 'thokku').length },
    { id: 'health-mix', label: 'Health Mix & Grains', count: products.filter(p => p.category === 'health-mix').length },
    { id: 'ghee', label: 'Ghee', count: products.filter(p => p.category === 'ghee').length },
    { id: 'masalas', label: 'Masalas', count: products.filter(p => p.category === 'masalas').length },
    { id: 'skin-hair', label: 'Skin & Hair Care', count: products.filter(p => p.category === 'skin-hair').length },
    { id: 'combos', label: 'Combo Bundles', count: comboOffers.length },
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Breadcrumb & Page Heading Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-antique">
            <Link to="/" className="hover:underline flex items-center gap-1">
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-cream-warm">Shop</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-gold-antique capitalize">{selectedCategory.replace(/-/g, ' ')}</span>
              </>
            )}
          </div>

          <div className="space-y-2">
            <span className="font-caveat text-2xl sm:text-3xl text-gold-antique font-semibold block">
              {currentCategoryInfo.subtitle}
            </span>
            <h1 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold text-cream-warm">
              {currentCategoryInfo.name}
            </h1>
            <p className="font-sans text-sm sm:text-base text-cream-warm/80 leading-relaxed max-w-2xl mx-auto">
              {currentCategoryInfo.description}
            </p>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 border-y border-gold-antique/20 py-4">
          {categoriesTabList.map(tab => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleCategorySelect(tab.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-gold-antique text-forest-ink shadow-gold-glow font-bold'
                    : 'bg-forest-deep text-cream-warm border border-gold-antique/30 hover:border-gold-antique'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-forest-ink/20 text-forest-ink font-bold'
                      : 'bg-forest-ink/60 text-gold-antique font-mono'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter & Sort Controls Bar */}
        <div className="p-4 rounded-2xl bg-forest-deep border border-gold-antique/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gold-antique absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name or ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs sm:text-sm font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-cream-warm/50 hover:text-gold-antique"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Veg Toggle */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* Veg Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-cream-warm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterVegOnly}
                onChange={(e) => setFilterVegOnly(e.target.checked)}
                className="rounded text-gold-antique focus:ring-0 w-4 h-4 accent-gold-antique cursor-pointer"
              />
              <VegMark isVeg={true} size="sm" />
              <span>100% Veg Only</span>
            </label>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gold-antique hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-forest-ink border border-gold-antique/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-cream-warm focus:outline-none focus:border-gold-antique cursor-pointer font-sans"
              >
                <option value="featured">Featured / Default</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid / Combo Grid */}
        {selectedCategory === 'combos' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((combo) => (
              <div
                key={combo.id}
                className="relative rounded-2xl bg-forest-deep border-2 border-gold-antique/40 hover:border-gold-antique transition-all duration-300 p-6 flex flex-col justify-between shadow-xl group hover:-translate-y-1.5"
              >
                <div className="absolute -top-3.5 right-6 bg-gold-antique text-forest-ink text-xs font-bold px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 font-sans">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{combo.savings}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <VegMark isVeg={combo.isVeg} size="sm" />
                    <span className="text-[11px] font-sans font-semibold tracking-wider text-gold-antique uppercase">
                      {combo.badge}
                    </span>
                  </div>

                  <h3 className="font-fraunces text-2xl font-bold text-cream-warm mb-1">
                    {combo.name}
                  </h3>
                  <span className="font-caveat text-xl text-gold-champagne block mb-4">
                    {combo.subtitle}
                  </span>

                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 border border-gold-antique/30">
                    <img
                      src={combo.image}
                      alt={combo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 bg-forest-ink/95 text-cream-ivory text-[11px] font-medium px-2.5 py-1 rounded-md border border-gold-antique/30 font-sans">
                      {combo.weight}
                    </div>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-cream-warm/75 leading-relaxed mb-6">
                    {combo.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gold-antique/25 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-fraunces text-2xl font-bold text-gold-antique">
                        ₹{combo.price}
                      </span>
                      <span className="text-xs text-cream-warm/50 line-through font-sans">
                        ₹{combo.compareAtPrice}
                      </span>
                    </div>
                    <span className="text-[10px] text-cream-warm/65 uppercase tracking-wider block font-sans">
                      Complete Bundle
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addToCart({
                        id: combo.id,
                        name: combo.name,
                        price: combo.price,
                        compareAtPrice: combo.compareAtPrice,
                        weight: combo.weight,
                        image: combo.image,
                        isVeg: true,
                        category: "combo"
                      }, 1);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-gold-glow flex items-center gap-1.5 active:scale-95 flex-shrink-0 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 p-8 rounded-3xl bg-forest-deep border border-gold-antique/30 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-forest-ink flex items-center justify-center text-gold-antique mx-auto border border-gold-antique/30">
              <Search className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1">
              <h3 className="font-fraunces text-xl font-bold text-cream-warm">No matching items found</h3>
              <p className="font-sans text-xs sm:text-sm text-cream-warm/70">
                We couldn't find any products matching "{searchQuery}". Try searching for another ingredient or clearing your filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterVegOnly(false);
                navigate('/shop');
              }}
              className="px-6 py-2.5 rounded-xl bg-gold-antique text-forest-ink font-bold text-xs uppercase tracking-wider font-sans cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
