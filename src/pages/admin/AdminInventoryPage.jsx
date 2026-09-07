import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { productAPI, adminAPI } from '../../services/api';
import { products as fallbackProducts, productCategories } from '../../data/products';
import { AddProductModal } from '../../components/admin/AddProductModal';
import {
  Layers,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Save,
  Filter,
  Flame,
  Sparkles,
  Package
} from 'lucide-react';

export const AdminInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savingId, setSavingId] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.search.includes('action=new')) {
      setIsAddModalOpen(true);
    }
  }, [location.search]);

  // Local pending batch stock edits: { [productId]: number }
  const [stockEdits, setStockEdits] = useState({});

  // Show temporary toast
  const triggerToast = (msg, isError = false) => {
    setFeedbackToast({ msg, isError });
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleProductCreated = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    triggerToast(`"${newProduct.name}" added to artisanal catalog.`);
  };

  // Fetch catalog from backend or fallback to static data
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getProducts('limit=100');
      if (res.data?.products?.length > 0) {
        setProducts(res.data.products);
      } else {
        // Fallback to static products if backend database empty
        setProducts(
          fallbackProducts.map((p, idx) => ({
            _id: p.id || `prod_${idx}`,
            id: p.id,
            name: p.name,
            slug: p.slug || p.id,
            category: p.category,
            price: p.price,
            weight: p.weight,
            image: p.image,
            available: p.available !== false,
            stock: p.stock !== undefined ? p.stock : 25
          }))
        );
      }
    } catch (err) {
      console.warn('Using local fallback catalog for inventory:', err.message);
      setProducts(
        fallbackProducts.map((p, idx) => ({
          _id: p.id || `prod_${idx}`,
          id: p.id,
          name: p.name,
          slug: p.slug || p.id,
          category: p.category,
          price: p.price,
          weight: p.weight,
          image: p.image,
          available: p.available !== false,
          stock: p.stock !== undefined ? p.stock : 25
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 1. Toggle Product In-Stock / Out-of-Stock
  const handleToggleStock = async (product) => {
    const newAvailable = !product.available;
    const newStock = newAvailable ? Math.max(product.stock || 10, 10) : 0;

    // Optimistic UI update
    setProducts(prev =>
      prev.map(p =>
        (p._id === product._id || p.id === product.id)
          ? { ...p, available: newAvailable, stock: newStock }
          : p
      )
    );

    try {
      if (product._id && !product._id.startsWith('prod_') && !product._id.includes('-')) {
        await adminAPI.updateProduct(product._id, {
          available: newAvailable,
          stock: newStock
        });
      }
      triggerToast(
        `${product.name} is now marked as ${newAvailable ? 'IN STOCK' : 'OUT OF STOCK'}.`
      );
    } catch (err) {
      console.warn('Backend stock toggle synced locally:', err.message);
      triggerToast(`${product.name} stock updated in local session.`);
    }
  };

  // 2. Adjust Batch Stock Stepper
  const handleStockInputChange = (id, currentVal, delta) => {
    const current = stockEdits[id] !== undefined ? stockEdits[id] : currentVal;
    const updated = Math.max(0, current + delta);
    setStockEdits(prev => ({ ...prev, [id]: updated }));
  };

  const handleStockManualInput = (id, val) => {
    const num = parseInt(val, 10);
    setStockEdits(prev => ({ ...prev, [id]: isNaN(num) ? 0 : Math.max(0, num) }));
  };

  // 3. Save Batch Stock
  const handleSaveBatch = async (product) => {
    const targetStock =
      stockEdits[product._id] !== undefined
        ? stockEdits[product._id]
        : product.stock;

    setSavingId(product._id);

    // Optimistic update
    setProducts(prev =>
      prev.map(p =>
        p._id === product._id
          ? {
              ...p,
              stock: targetStock,
              available: targetStock > 0
            }
          : p
      )
    );

    try {
      if (product._id && !product._id.startsWith('prod_') && !product._id.includes('-')) {
        await adminAPI.updateStock(product._id, { stock: targetStock });
      }
      triggerToast(`Batch quantity for ${product.name} updated to ${targetStock} jars.`);
    } catch (err) {
      console.warn('Stock update saved locally:', err.message);
      triggerToast(`Batch quantity for ${product.name} updated.`);
    } finally {
      setSavingId(null);
      setStockEdits(prev => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
    }
  };

  // Inventory KPI Counters
  const metrics = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.available && (p.stock || 0) > 0).length;
    const outOfStock = products.filter(p => !p.available || (p.stock || 0) === 0).length;
    const lowStock = products.filter(p => p.available && (p.stock || 0) > 0 && (p.stock || 0) <= 15).length;
    return { total, inStock, outOfStock, lowStock };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = (p.category || '').toLowerCase();
        if (selectedCategory === 'combos' && !p.isCombo && !cat.includes('combo')) {
          return false;
        } else if (selectedCategory !== 'combos' && cat !== selectedCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const sku = (p.sku || p.slug || '').toLowerCase();
        return name.includes(q) || cat.includes(q) || sku.includes(q);
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {feedbackToast && (
        <div className="fixed top-24 right-5 z-50 animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-deep border border-gold-antique text-cream-warm shadow-2xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-gold-antique" />
            <span>{feedbackToast.msg}</span>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Top Banner                                                                    */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream-warm">
              Small-Batch Inventory & Stock Control
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold-antique/20 border border-gold-antique/40 text-gold-antique">
              Kitchen Pantry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-cream-warm/70 font-sans mt-1">
            Toggle product availability for customers and adjust fresh stone-ground batch counts in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-[#0F1D12] text-xs sm:text-sm font-bold font-sans transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            type="button"
            onClick={fetchInventory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-deep hover:bg-forest-ink border border-gold-antique/30 hover:border-gold-antique text-gold-antique text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Stock</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Metric Counters                                                               */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-forest-deep border border-gold-antique/25 shadow-sm">
          <span className="text-xs text-cream-warm/65 font-sans font-medium block">
            Total Artisanal SKUs
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-cream-warm mt-1 block">
            {loading ? '—' : metrics.total}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-forest-deep border border-gold-antique/25 shadow-sm">
          <span className="text-xs text-emerald-400 font-sans font-medium block flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            In Stock & Active
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-400 mt-1 block">
            {loading ? '—' : metrics.inStock}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-forest-deep border border-gold-antique/25 shadow-sm">
          <span className="text-xs text-amber-400 font-sans font-medium block flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Batch Alerts (&le;15)
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-400 mt-1 block">
            {loading ? '—' : metrics.lowStock}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-forest-deep border border-gold-antique/25 shadow-sm">
          <span className="text-xs text-rose-400 font-sans font-medium block flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Out of Stock
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-rose-400 mt-1 block">
            {loading ? '—' : metrics.outOfStock}
          </span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Search & Category Filter                                                      */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-forest-deep border border-gold-antique/25 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-antique/70 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, category, or SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/25 text-cream-warm placeholder:text-cream-warm/35 text-xs sm:text-sm font-sans focus:outline-none focus:border-gold-antique transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gold-antique" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/25 text-cream-warm text-xs font-semibold font-sans focus:outline-none focus:border-gold-antique"
          >
            <option value="all">All Categories</option>
            <option value="thokku">Thokku Varieties</option>
            <option value="health-mix">Health Mix & Grains</option>
            <option value="ghee">Cultured Ghee</option>
            <option value="masalas">Heirloom Masalas</option>
            <option value="skin-hair">Botanical Care</option>
            <option value="combos">Special Combos</option>
          </select>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* Products Stock Cards & Table                                                  */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-24 rounded-2xl bg-forest-deep border border-gold-antique/20 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-forest-deep border border-gold-antique/25 space-y-3">
          <Layers className="w-8 h-8 text-gold-antique mx-auto" />
          <h3 className="font-serif text-lg font-bold text-cream-warm">
            No products match this filter
          </h3>
          <p className="text-xs text-cream-warm/60 font-sans">
            Try resetting the category filter or checking your search terms.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => {
            const isAvailable = product.available && (product.stock || 0) > 0;
            const isLowStock = isAvailable && (product.stock || 0) <= 15;
            const currentStockValue =
              stockEdits[product._id] !== undefined
                ? stockEdits[product._id]
                : (product.stock || 0);

            const hasPendingStockEdit =
              stockEdits[product._id] !== undefined &&
              stockEdits[product._id] !== product.stock;

            return (
              <div
                key={product._id || product.id}
                className={`p-4 sm:p-5 rounded-2xl bg-forest-deep border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  !isAvailable
                    ? 'border-rose-500/30 bg-rose-950/10'
                    : isLowStock
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-gold-antique/25 hover:border-gold-antique/40'
                }`}
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-forest-ink border border-gold-antique/30 overflow-hidden shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-opacity ${
                        !isAvailable ? 'opacity-40 grayscale' : 'opacity-100'
                      }`}
                    />
                  </div>

                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-cream-warm truncate">
                        {product.name}
                      </h3>
                      {/* Status Badges */}
                      {!isAvailable ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          Low Batch ({product.stock} left)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                          In Stock
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-cream-warm/65 font-sans truncate">
                      {product.category?.replace('-', ' ')} • {product.weight || 'Standard'} • <span className="font-bold text-gold-antique">₹{product.price}</span>
                    </p>
                  </div>
                </div>

                {/* Stock Controls: Toggle & Quantity Stepper */}
                <div className="flex flex-wrap items-center gap-4 self-end md:self-auto shrink-0">
                  {/* Stock Availability Toggle Switch */}
                  <div className="flex items-center gap-2.5 bg-forest-ink px-3 py-2 rounded-xl border border-gold-antique/20">
                    <span className="text-xs font-semibold text-cream-warm/80 font-sans">
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleStock(product)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isAvailable ? 'bg-emerald-500' : 'bg-gray-600'
                      }`}
                      aria-label="Toggle in stock"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isAvailable ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Batch Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-forest-ink p-1 rounded-xl border border-gold-antique/25">
                    <button
                      type="button"
                      onClick={() => handleStockInputChange(product._id, product.stock || 0, -1)}
                      className="p-1.5 rounded-lg hover:bg-forest-moss/40 text-cream-warm/70 hover:text-cream-warm transition-colors cursor-pointer"
                      title="Decrease batch count"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={currentStockValue}
                      onChange={(e) => handleStockManualInput(product._id, e.target.value)}
                      className="w-14 text-center font-mono text-sm font-bold bg-transparent text-gold-antique focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleStockInputChange(product._id, product.stock || 0, 1)}
                      className="p-1.5 rounded-lg hover:bg-forest-moss/40 text-cream-warm/70 hover:text-cream-warm transition-colors cursor-pointer"
                      title="Increase batch count"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {hasPendingStockEdit && (
                      <button
                        type="button"
                        onClick={() => handleSaveBatch(product)}
                        disabled={savingId === product._id}
                        className="ml-1 px-3 py-1 rounded-lg bg-gold-antique hover:bg-gold-champagne text-[#0F1D12] text-xs font-bold font-sans transition-all flex items-center gap-1 cursor-pointer animate-pulse"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
};

