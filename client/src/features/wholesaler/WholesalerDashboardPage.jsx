import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  CheckCircle,
  Truck,
  Building,
  Layers,
  Clock,
  ShieldCheck,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

export const WholesalerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'inventory' | 'orders' | 'inquiries' | 'settings'

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Product Modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Atta & Staples',
    brand: 'VyaparSetu Verified',
    packSizeUnit: '1 kg',
    retailPrice: '',
    wholesalePrice: '',
    minWholesaleQty: 5,
    stock: 100,
    description: '',
    quantityTiers: [],
  });

  // Quote Modal state
  const [quoteModalInquiry, setQuoteModalInquiry] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    proposedQty: 100,
    unitPrice: '',
    deliveryFee: 50,
    estimatedDays: '2 Business Days',
    quotationNotes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.status === 'APPROVED') {
        const [statsRes, prodRes, ordRes, inqRes] = await Promise.all([
          apiClient.get('/sellers/dashboard-stats'),
          apiClient.get('/products/seller/my-products'),
          apiClient.get('/orders/seller/incoming'),
          apiClient.get('/bulk-requests/market'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (prodRes.data.success) setProducts(prodRes.data.products);
        if (ordRes.data.success) setOrders(ordRes.data.orders);
        if (inqRes.data.success) setInquiries(inqRes.data.inquiries);
      }
    } catch (err) {
      console.error('Failed to load wholesaler dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Product Actions
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Atta & Staples',
      brand: 'VyaparSetu Verified',
      packSizeUnit: '1 kg',
      retailPrice: '',
      wholesalePrice: '',
      minWholesaleQty: 5,
      stock: 100,
      description: '',
      quantityTiers: [],
    });
    setProductModalOpen(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      packSizeUnit: prod.packSizeUnit,
      retailPrice: prod.retailPrice,
      wholesalePrice: prod.wholesalePrice,
      minWholesaleQty: prod.minWholesaleQty,
      stock: prod.stock,
      description: prod.description || '',
      quantityTiers: prod.quantityTiers || [],
    });
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct._id}`, productForm);
      } else {
        await apiClient.post('/products', productForm);
      }
      setProductModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error saving product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleProductStatus = async (id) => {
    try {
      await apiClient.patch(`/products/${id}/toggle-status`);
      fetchData();
    } catch (err) {
      alert('Error toggling status');
    }
  };

  const handleUpdateStock = async (id, newStock) => {
    try {
      await apiClient.patch(`/products/${id}/stock`, { stock: Number(newStock) });
      fetchData();
    } catch (err) {
      alert('Error updating stock');
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleVerifyPayment = async (orderId, isVerified) => {
    try {
      await apiClient.patch(`/orders/${orderId}/verify-payment`, { isVerified });
      fetchData();
    } catch (err) {
      alert('Failed to verify payment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRespondCancellation = async (orderId, approve) => {
    try {
      await apiClient.patch(`/orders/${orderId}/cancellation-response`, { approve });
      fetchData();
    } catch (err) {
      alert('Error responding to cancellation: ' + (err.response?.data?.message || err.message));
    }
  };

  // Quote Submission
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteModalInquiry) return;
    try {
      await apiClient.post(`/bulk-requests/${quoteModalInquiry._id}/quote`, quoteForm);
      setQuoteModalInquiry(null);
      fetchData();
    } catch (err) {
      alert('Failed to submit quote: ' + (err.response?.data?.message || err.message));
    }
  };

  // If not approved, show pending approval screen
  if (user?.status !== 'APPROVED') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-subtle">
          <Clock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Application Status: {user?.status || 'PENDING_APPROVAL'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-ink-dark">
            Wholesaler Application Under Verification
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
            Your business profile has been received. Super Admin review is currently underway to verify your GSTIN and trade registrations.
          </p>
        </div>

        <div className="p-5 bg-surface-pure rounded-2xl border border-surface-border max-w-md mx-auto text-xs text-left space-y-2 text-ink-secondary">
          <span className="font-bold text-ink-dark block">Onboarding Progress Checklist:</span>
          <div className="flex items-center gap-2 text-emerald-700">
            <Check className="w-4 h-4" /> Account Information Submitted
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <Check className="w-4 h-4" /> Business & Mandi Details Registered
          </div>
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <Clock className="w-4 h-4" /> Awaiting Super Admin Portal Approval
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            to="/wholesaler/onboarding"
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Review Onboarding Application
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink-dark">Wholesaler Operations Hub</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Approved Seller
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Manage product catalogue, incoming buyer orders, volume pricing, and bulk quotations
          </p>
        </div>

        <button
          onClick={openAddProduct}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          List New Product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-1 text-xs font-bold text-ink-secondary overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: LayoutDashboard },
          { id: 'inventory', label: `My Products (${products.length})`, icon: Package },
          { id: 'orders', label: `Incoming Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'inquiries', label: `Market Bulk Requests (${inquiries.length})`, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'hover:bg-surface-warm text-ink-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-surface-pure p-5 rounded-2xl border border-surface-border shadow-subtle">
              <span className="text-xs font-bold text-ink-muted block">Active Products</span>
              <span className="text-2xl font-black text-ink-dark mt-1 block">{stats?.activeProducts ?? products.length}</span>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Live in catalogue</span>
            </div>

            <div className="bg-surface-pure p-5 rounded-2xl border border-surface-border shadow-subtle">
              <span className="text-xs font-bold text-ink-muted block">Low Stock Alert</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{stats?.lowStockProducts ?? 0}</span>
              <span className="text-[10px] text-ink-muted font-semibold mt-1 block">&lt; 15 units remaining</span>
            </div>

            <div className="bg-surface-pure p-5 rounded-2xl border border-surface-border shadow-subtle">
              <span className="text-xs font-bold text-ink-muted block">Pending Orders</span>
              <span className="text-2xl font-black text-brand-600 mt-1 block">{stats?.pendingOrders ?? 0}</span>
              <span className="text-[10px] text-brand-700 font-semibold mt-1 block">Awaiting packaging</span>
            </div>

            <div className="bg-surface-pure p-5 rounded-2xl border border-surface-border shadow-subtle">
              <span className="text-xs font-bold text-ink-muted block">Total Sales Volume</span>
              <span className="text-2xl font-black text-ink-dark mt-1 block">₹{stats?.totalSales ?? 0}</span>
              <span className="text-[10px] text-ink-muted font-semibold mt-1 block">Across confirmed orders</span>
            </div>

            <div className="bg-surface-pure p-5 rounded-2xl border border-surface-border shadow-subtle">
              <span className="text-xs font-bold text-ink-muted block">Open Bulk Requests</span>
              <span className="text-2xl font-black text-accent-gold mt-1 block">{inquiries.length}</span>
              <span className="text-[10px] text-accent-gold font-semibold mt-1 block">Ready for quote</span>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-ink-dark">Recent Incoming Orders</h3>
              <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-brand-600 hover:underline">
                View All Orders
              </button>
            </div>

            {orders.slice(0, 3).map((o) => (
              <div key={o._id} className="p-4 rounded-2xl bg-surface-warm/50 border border-surface-border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-ink-dark block">Order #{o.orderNumber}</span>
                  <span className="text-ink-muted">Buyer: {o.buyerName} • {o.items.length} items</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-brand-700 block">₹{o.grandTotal}</span>
                  <span className="text-[10px] font-bold text-amber-700">{o.orderStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Inventory Management */}
      {activeTab === 'inventory' && (
        <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-ink-dark">Product Listings & Pricing</h3>
            <span className="text-xs text-ink-muted">{products.length} products listed under your seller account</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-border text-ink-muted uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-2">Product</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Pack Size</th>
                  <th className="py-3 px-2">Retail</th>
                  <th className="py-3 px-2">Wholesale</th>
                  <th className="py-3 px-2">Stock</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-warm/40 transition">
                    <td className="py-3 px-2 flex items-center gap-2">
                      <img src={p.images?.[0] || '/images/products/placeholder.svg'} alt="" className="w-10 h-10 rounded-lg object-contain bg-white p-1 border" />
                      <span className="font-bold text-ink-dark max-w-[200px] truncate">{p.name}</span>
                    </td>
                    <td className="py-3 px-2 text-ink-secondary">{p.category}</td>
                    <td className="py-3 px-2 font-semibold text-brand-700">{p.packSizeUnit}</td>
                    <td className="py-3 px-2 font-bold text-ink-dark">₹{p.retailPrice}</td>
                    <td className="py-3 px-2 font-bold text-brand-600">₹{p.wholesalePrice}</td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue={p.stock}
                        onBlur={(e) => handleUpdateStock(p._id, e.target.value)}
                        className="w-16 px-2 py-1 rounded border border-surface-border font-bold text-xs"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleToggleProductStatus(p._id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => openEditProduct(p)}
                        className="p-1.5 text-ink-muted hover:text-brand-600 rounded-lg hover:bg-surface-warm"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Incoming Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-base text-ink-dark">Incoming Orders Assigned to Your Enterprise</h3>

          {orders.length === 0 ? (
            <div className="bg-surface-pure rounded-3xl border border-surface-border p-12 text-center text-xs text-ink-muted">
              No orders assigned yet.
            </div>
          ) : (
            orders.map((o) => (
              <div key={o._id} className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-ink-dark">Order #{o.orderNumber}</h4>
                    <span className="text-[11px] text-ink-muted">
                      Buyer: {o.buyerName} ({o.buyerPhone}) • Role: {o.buyerRole}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-brand-50 text-brand-700 font-bold px-2.5 py-1 rounded-md">
                      {o.orderStatus}
                    </span>
                    <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-md">
                      {o.paymentMethod} • {o.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 text-xs text-ink-secondary">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-surface-border/50">
                      <span>{item.name} × {item.quantity} {item.packSizeUnit}</span>
                      <span className="font-bold text-ink-dark">₹{item.subtotal}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 font-bold text-ink-dark text-sm">
                    <span>Grand Total</span>
                    <span className="text-brand-700 font-black">₹{o.grandTotal}</span>
                  </div>
                </div>

                {/* Address */}
                {o.deliveryAddress && (
                  <div className="p-3 bg-surface-warm rounded-xl text-xs text-ink-secondary">
                    <strong>Delivery Destination:</strong> {o.deliveryAddress.houseNo}, {o.deliveryAddress.street}, {o.deliveryAddress.city} — PIN {o.deliveryAddress.pincode}
                  </div>
                )}

                {/* Cancellation Request */}
                {o.cancellation?.isRequested && o.cancellation.status === 'REQUESTED' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-2">
                    <strong>Buyer requested cancellation:</strong> "{o.cancellation.reason}"
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespondCancellation(o._id, true)}
                        className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg text-xs"
                      >
                        Approve Cancellation & Restock
                      </button>
                      <button
                        onClick={() => handleRespondCancellation(o._id, false)}
                        className="px-3 py-1 bg-surface-muted text-ink-dark font-bold rounded-lg text-xs"
                      >
                        Decline (Already Dispatched)
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Status Transition Controls */}
                <div className="pt-2 border-t border-surface-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink-muted">Update Status:</span>
                    {['CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'DELIVERED', 'READY_FOR_PICKUP', 'COLLECTED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(o._id, st)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                          o.orderStatus === st
                            ? 'bg-brand-500 text-white border-brand-500'
                            : 'bg-surface-warm text-ink-dark border-surface-border hover:bg-brand-50'
                        }`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Payment Verification */}
                  {o.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => handleVerifyPayment(o._id, true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Verify Payment Received
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Market Bulk Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-base text-ink-dark">Active Wholesale & Event Quote Requests</h3>

          {inquiries.length === 0 ? (
            <div className="bg-surface-pure rounded-3xl border border-surface-border p-12 text-center text-xs text-ink-muted">
              No active bulk inquiries matching your market category.
            </div>
          ) : (
            inquiries.map((inq) => (
              <div key={inq._id} className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                  <div>
                    <h4 className="font-extrabold text-sm text-ink-dark">{inq.productOrCategory}</h4>
                    <span className="text-[11px] text-ink-muted">Requester: {inq.requesterName} • Role: {inq.requesterRole}</span>
                  </div>
                  <span className="bg-accent-light text-accent-gold font-bold text-xs px-2.5 py-1 rounded-md">
                    Req Qty: {inq.requestedQty} units
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink-secondary">
                  <div><strong>Required Date:</strong> {new Date(inq.requiredDate).toLocaleDateString()}</div>
                  <div><strong>Destination PIN:</strong> {inq.deliveryPincode}</div>
                  <div><strong>Budget:</strong> ₹{inq.budget || 'Open for quotes'}</div>
                </div>

                {inq.additionalRequirements && (
                  <p className="text-xs text-ink-muted bg-surface-warm p-2.5 rounded-xl">
                    "{inq.additionalRequirements}"
                  </p>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setQuoteModalInquiry(inq);
                      setQuoteForm({
                        proposedQty: inq.requestedQty,
                        unitPrice: '',
                        deliveryFee: 50,
                        estimatedDays: '2 Business Days',
                        quotationNotes: '',
                      });
                    }}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl"
                  >
                    Submit Custom Wholesale Quote
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-pure rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-surface-border shadow-float my-8">
            <h3 className="font-extrabold text-lg text-ink-dark mb-1">
              {editingProduct ? 'Edit Product Listing' : 'List New Wholesale Product'}
            </h3>
            <p className="text-xs text-ink-muted mb-4">Set retail and bulk quantity tier prices</p>

            <form onSubmit={handleProductSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Aashirvaad Shudh Chakki Atta"
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold"
                  >
                    <option value="Dairy & Breakfast">Dairy & Breakfast</option>
                    <option value="Atta & Staples">Atta & Staples</option>
                    <option value="Cooking Essentials">Cooking Essentials</option>
                    <option value="Snacks & Packaged Food">Snacks & Packaged Food</option>
                    <option value="Fresh Fruits">Fresh Fruits</option>
                    <option value="Fresh Vegetables">Fresh Vegetables</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Household Essentials">Household Essentials</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Event & Bulk Supplies">Event & Bulk Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Pack Size / Unit</label>
                  <input
                    type="text"
                    required
                    value={productForm.packSizeUnit}
                    onChange={(e) => setProductForm({ ...productForm, packSizeUnit: e.target.value })}
                    placeholder="e.g. 1 kg, 500 ml, Pack of 6"
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Retail MRP (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.retailPrice}
                    onChange={(e) => setProductForm({ ...productForm, retailPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Wholesale Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.wholesalePrice}
                    onChange={(e) => setProductForm({ ...productForm, wholesalePrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold text-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Available Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Key product highlights, ingredients, or storage guidelines..."
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quote Submission Modal */}
      {quoteModalInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm p-4">
          <div className="bg-surface-pure rounded-3xl p-6 sm:p-8 max-w-md w-full border border-surface-border shadow-float">
            <h3 className="font-extrabold text-base text-ink-dark mb-1">Submit Wholesale Quotation</h3>
            <p className="text-xs text-ink-muted mb-4">{quoteModalInquiry.productOrCategory}</p>

            <form onSubmit={handleQuoteSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Proposed Qty</label>
                  <input
                    type="number"
                    required
                    value={quoteForm.proposedQty}
                    onChange={(e) => setQuoteForm({ ...quoteForm, proposedQty: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quoteForm.unitPrice}
                    onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={quoteForm.deliveryFee}
                    onChange={(e) => setQuoteForm({ ...quoteForm, deliveryFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Delivery Timeline</label>
                  <input
                    type="text"
                    value={quoteForm.estimatedDays}
                    onChange={(e) => setQuoteForm({ ...quoteForm, estimatedDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Quotation Remarks</label>
                <textarea
                  rows={2}
                  value={quoteForm.quotationNotes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, quotationNotes: e.target.value })}
                  placeholder="e.g. Price includes transport to venue gate. Valid for 7 days."
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setQuoteModalInquiry(null)}
                  className="px-4 py-2 text-xs font-bold text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl"
                >
                  Send Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WholesalerDashboardPage;
