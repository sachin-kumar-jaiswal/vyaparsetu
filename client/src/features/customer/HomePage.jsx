import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Package,
  CalendarCheck,
  CheckCircle,
  Truck,
  Building,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import ProductCard from '../../components/common/ProductCard';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dailyEssentials, setDailyEssentials] = useState([]);
  const [freshProduce, setFreshProduce] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/products?limit=30'),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }

        if (prodRes.data.success) {
          const prods = prodRes.data.products;
          setFeaturedProducts(prods.filter((p) => p.categorySlug === 'atta-staples' || p.categorySlug === 'cooking-essentials').slice(0, 4));
          setDailyEssentials(prods.filter((p) => p.categorySlug === 'dairy-breakfast' || p.categorySlug === 'snacks-packaged-food').slice(0, 4));
          setFreshProduce(prods.filter((p) => p.categorySlug === 'fruits' || p.categorySlug === 'vegetables').slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-card">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-800/80 border border-brand-500/40 text-accent-saffron text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DIRECT WHOLESALE & RETAIL MARKETPLACE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Ek Platform.<br />
              <span className="text-accent-saffron">Har Vyapar.</span>
            </h1>

            <p className="text-sm sm:text-base text-brand-100 max-w-lg leading-relaxed">
              Order fresh daily essentials in retail quantities or purchase commercial grocery supplies directly from verified Indian wholesalers with guaranteed tier discounts.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-xl bg-accent-saffron hover:bg-accent-gold text-ink-dark font-extrabold text-sm transition shadow-card flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop Daily Groceries
              </Link>

              <Link
                to="/bulk-inquiries"
                className="px-6 py-3.5 rounded-xl bg-brand-800/80 hover:bg-brand-900 text-white font-bold text-sm transition border border-brand-400/40 flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-accent-saffron" />
                Event & Bulk Inquiry
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-brand-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-accent-saffron" />
                Verified GSTIN Sellers
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-accent-saffron" />
                Zero Commission Direct Pricing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-accent-saffron" />
                COD & Manual UPI Supported
              </span>
            </div>
          </div>

          {/* Decorative Background Accents */}
          <div className="absolute right-[-40px] top-[-40px] w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          <div className="absolute right-10 bottom-6 opacity-10 lg:opacity-20 pointer-events-none hidden sm:block">
            <img src="/images/branding/logo-mark.svg" alt="" className="w-96 h-96" />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink-dark">Explore Grocery & Wholesale Categories</h2>
            <p className="text-xs text-ink-muted mt-0.5">Direct catalogue access from local distributors</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              className="group bg-surface-pure hover:bg-brand-50/50 p-4 rounded-2xl border border-surface-border hover:border-brand-300 transition duration-200 flex flex-col items-center text-center shadow-subtle hover:shadow-card"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-warm group-hover:scale-105 transition duration-300 p-2 mb-3">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-ink-dark group-hover:text-brand-700 transition">
                {cat.name}
              </span>
              <span className="text-[10px] text-ink-muted mt-1 line-clamp-1">
                {cat.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Wholesale Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-light text-accent-gold flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-ink-dark">Wholesale Deals: Atta, Rice & Oils</h2>
              <p className="text-xs text-ink-muted">Commercial pack sizes with steep quantity discounts</p>
            </div>
          </div>
          <Link to="/products?category=atta-staples" className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1">
            See More <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Wedding & Event Bulk Purchasing CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-accent-saffron/20 via-accent-light to-amber-100/50 border border-accent-gold/30 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-3 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-accent-gold text-white font-extrabold text-[10px] tracking-wider uppercase">
              Weddings, Functions & Banquets
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-ink-dark">
              Planning a Wedding or Community Feast?
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
              Submit your bulk requirement for 300+ paper plates, 200+ water bottles, napkins, tea supplies, or snacks. Approved regional wholesalers submit custom quotes directly to you.
            </p>
          </div>

          <Link
            to="/bulk-inquiries"
            className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm transition shadow-card shrink-0 flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4 text-accent-saffron" />
            Request Bulk Quotation
          </Link>
        </div>
      </section>

      {/* Daily Essentials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-ink-dark">Daily Essentials: Milk, Dahi & Breakfast</h2>
              <p className="text-xs text-ink-muted">Delivered fresh from local distribution hubs</p>
            </div>
          </div>
          <Link to="/products?category=dairy-breakfast" className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1">
            See More <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dailyEssentials.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Fresh Produce */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-ink-dark">Farm Fresh Produce: Fruits & Vegetables</h2>
              <p className="text-xs text-ink-muted">Handpicked harvest directly from APMC mandis</p>
            </div>
          </div>
          <Link to="/products?category=vegetables" className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1">
            See More <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {freshProduce.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Verified Seller Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-subtle">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-lg text-ink-dark">Bharat Wholesale Bazaar Pvt Ltd</h4>
                <span className="bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> FSSAI & GSTIN Verified
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-1 max-w-lg">
                Azadpur Mandi, Delhi • 12 Years in Business • Servicing 17 Central & East Delhi PIN Codes with same-day temperature-controlled dispatch.
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="px-5 py-2.5 rounded-xl border border-brand-500 text-brand-700 hover:bg-brand-50 font-bold text-xs transition shrink-0"
          >
            Browse Seller Catalogue
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
