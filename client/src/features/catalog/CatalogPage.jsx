import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import ProductCard from '../../components/common/ProductCard';

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters from URL
  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentInStock = searchParams.get('inStock') === 'true';

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiClient.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products on query change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        params.set('limit', '20');

        const res = await apiClient.get(`/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error('Failed to load catalogue products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // reset to page 1
    setSearchParams(next);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('minPrice', minPrice);
    else next.delete('minPrice');
    if (maxPrice) next.set('maxPrice', maxPrice);
    else next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-dark">
            {currentCategory !== 'all'
              ? categories.find((c) => c.slug === currentCategory)?.name || 'Category Products'
              : currentSearch
              ? `Search results for "${currentSearch}"`
              : 'All Products & Wholesale Catalogue'}
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Showing {products.length} of {total} verified items with real-time stock
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-pure border border-surface-border text-xs font-bold text-ink-dark"
          >
            <Filter className="w-4 h-4 text-brand-500" />
            Filters
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted hidden sm:inline font-medium">Sort by:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-pure border border-surface-border text-xs font-bold text-ink-dark outline-none focus:border-brand-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_desc">Highest Stock Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(currentSearch || currentCategory !== 'all' || currentInStock || searchParams.get('minPrice')) && (
        <div className="flex flex-wrap items-center gap-2 py-3">
          <span className="text-xs text-ink-muted font-semibold">Active filters:</span>
          {currentSearch && (
            <span className="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-bold">
              "{currentSearch}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('search', '')} />
            </span>
          )}
          {currentCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-bold">
              {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('category', 'all')} />
            </span>
          )}
          {currentInStock && (
            <span className="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-bold">
              In Stock Only
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('inStock', 'false')} />
            </span>
          )}
          <button onClick={clearAllFilters} className="text-xs text-red-600 font-bold hover:underline ml-2">
            Clear All
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-6">
        {/* Sidebar Filters */}
        <aside className={`${isMobileFiltersOpen ? 'block' : 'hidden'} md:block md:col-span-1 space-y-6 bg-surface-pure p-5 rounded-2xl border border-surface-border h-fit`}>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-ink-dark mb-3">Categories</h4>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam('category', 'all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition ${
                  currentCategory === 'all'
                    ? 'bg-brand-500 text-white'
                    : 'text-ink-dark hover:bg-surface-warm'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    currentCategory === cat.slug
                      ? 'bg-brand-500 text-white font-bold'
                      : 'text-ink-secondary hover:bg-surface-warm'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-surface-border">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-ink-dark mb-3">Price Range (₹)</h4>
            <form onSubmit={handlePriceApply} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark outline-none focus:border-brand-500"
                />
                <span className="text-ink-muted text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark outline-none focus:border-brand-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-surface-muted hover:bg-brand-500 hover:text-white text-ink-dark rounded-xl text-xs font-bold transition"
              >
                Apply Range
              </button>
            </form>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-4 border-t border-surface-border">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-ink-dark">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : 'false')}
                className="rounded border-surface-border text-brand-500 focus:ring-brand-400 w-4 h-4"
              />
              <span>In Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface-pure rounded-2xl border border-surface-border p-4 h-72 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-surface-pure rounded-3xl border border-surface-border p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-ink-dark">No Products Found</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                We couldn't find any products matching your selected filters or search keyword.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => updateParam('page', (currentPage - 1).toString())}
                    className="p-2 rounded-xl border border-surface-border bg-surface-pure disabled:opacity-40 text-ink-dark hover:bg-surface-warm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-ink-dark">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => updateParam('page', (currentPage + 1).toString())}
                    className="p-2 rounded-xl border border-surface-border bg-surface-pure disabled:opacity-40 text-ink-dark hover:bg-surface-warm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
