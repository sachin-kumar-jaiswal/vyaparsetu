import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Clock,
  ShieldCheck,
  TrendingDown,
  ShoppingBag,
  Package,
  Layers,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/common/ProductCard';

export const RetailerDashboardPage = () => {
  const { user } = useAuth();
  const [wholesaleProducts, setWholesaleProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRetailerData = async () => {
      setLoading(true);
      try {
        if (user?.status === 'APPROVED') {
          const [prodRes, ordRes] = await Promise.all([
            apiClient.get('/products?limit=12'),
            apiClient.get('/orders/my-orders?limit=5'),
          ]);
          if (prodRes.data.success) setWholesaleProducts(prodRes.data.products);
          if (ordRes.data.success) setMyOrders(ordRes.data.orders);
        }
      } catch (err) {
        console.error('Failed to load retailer hub:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRetailerData();
  }, [user]);

  // If Retailer is awaiting Super Admin verification
  if (user?.status !== 'APPROVED') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-subtle">
          <Clock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Retailer Application Status: {user?.status || 'PENDING_APPROVAL'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-ink-dark">
            Retail Business Verification in Progress
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
            Your retailer application has been submitted to Super Admin for trade verification. Once approved, you will unlock privileged wholesale tier rates and bulk restocking discounts.
          </p>
        </div>

        <div className="p-4 bg-surface-pure rounded-2xl border border-surface-border text-xs text-left max-w-sm mx-auto space-y-2">
          <span className="font-bold text-ink-dark block">Approval Unlocks:</span>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="w-4 h-4" /> 15-30% Wholesale Margin Discounts
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="w-4 h-4" /> Commercial Pack Sizes & Grain Bags
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="w-4 h-4" /> Custom Bulk Event Quotations
          </div>
        </div>

        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl"
        >
          Browse Standard Retail Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink-dark">Retailer Wholesale Portal</h1>
            <span className="bg-accent-light text-accent-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-accent-gold/40">
              Approved Kirana Retailer
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Direct procurement from master distributors and APMC mandis with commercial tier margins
          </p>
        </div>

        <Link
          to="/bulk-inquiries"
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
        >
          <Layers className="w-4 h-4" />
          Request Custom Bulk Quote
        </Link>
      </div>

      {/* Perks Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-50 via-emerald-50 to-brand-100/40 p-6 border border-brand-200 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="font-extrabold text-sm text-brand-800 block">
            ⭐ Your Wholesale Purchasing Privileges Active
          </span>
          <p className="text-xs text-ink-secondary">
            All prices below show your discounted wholesale unit prices when meeting minimum order quantities (MOQ).
          </p>
        </div>
        <Link
          to="/products?category=atta-staples"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl"
        >
          Order Staples & Atta
        </Link>
      </div>

      {/* Wholesale Product Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-ink-dark">Fast-Moving Commercial Inventory</h3>
          <Link to="/products" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
            Browse Full Catalogue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wholesaleProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>

      {/* Recent Wholesale Invoices */}
      {myOrders.length > 0 && (
        <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-ink-dark">Recent Wholesale Purchases</h3>
            <Link to="/my-orders" className="text-xs font-bold text-brand-600 hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="divide-y divide-surface-border">
            {myOrders.map((o) => (
              <div key={o._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-ink-dark block">Order #{o.orderNumber}</span>
                  <span className="text-ink-muted">Seller: {o.sellerBusinessName} • {o.items.length} items</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-brand-700 block text-sm">₹{o.grandTotal}</span>
                  <span className="text-[10px] font-bold text-amber-700">{o.orderStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerDashboardPage;
