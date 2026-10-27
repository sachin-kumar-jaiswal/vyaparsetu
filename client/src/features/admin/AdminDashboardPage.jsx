import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Building2,
  Store,
  ShoppingBag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  FileCheck,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'wholesalers' | 'retailers' | 'orders' | 'issues'

  const [stats, setStats] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [rejectModalTarget, setRejectModalTarget] = useState(null); // { id, role, name }
  const [rejectReason, setRejectReason] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'SUPER_ADMIN') {
        const [statsRes, sellersRes, retailersRes, ordersRes, issuesRes] = await Promise.all([
          apiClient.get('/admin/overview'),
          apiClient.get('/admin/sellers'),
          apiClient.get('/admin/retailers'),
          apiClient.get('/admin/orders'),
          apiClient.get('/admin/issues'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (sellersRes.data.success) setSellers(sellersRes.data.sellers);
        if (retailersRes.data.success) setRetailers(retailersRes.data.retailers);
        if (ordersRes.data.success) setOrders(ordersRes.data.orders);
        if (issuesRes.data.success) setIssues(issuesRes.data.issues);
      }
    } catch (err) {
      console.error('Failed to load admin overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleApproveSeller = async (id) => {
    try {
      const res = await apiClient.patch(`/admin/sellers/${id}/approve`);
      alert(res.data.message);
      fetchAdminData();
    } catch (err) {
      alert('Approval failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApproveRetailer = async (id) => {
    try {
      const res = await apiClient.patch(`/admin/retailers/${id}/approve`);
      alert(res.data.message);
      fetchAdminData();
    } catch (err) {
      alert('Approval failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalTarget) return;

    try {
      const endpoint = rejectModalTarget.role === 'WHOLESALER'
        ? `/admin/sellers/${rejectModalTarget.id}/reject`
        : `/admin/retailers/${rejectModalTarget.id}/reject`;

      const res = await apiClient.patch(endpoint, { reason: rejectReason });
      alert(res.data.message);
      setRejectModalTarget(null);
      setRejectReason('');
      fetchAdminData();
    } catch (err) {
      alert('Rejection failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await apiClient.patch(`/admin/users/${userId}/toggle-status`);
      alert(res.data.message);
      fetchAdminData();
    } catch (err) {
      alert('Status change failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-2xl font-black text-ink-dark">Access Restricted</h2>
        <p className="text-xs text-ink-muted">
          This portal is reserved for Super Administrators. You do not have permission to view or execute moderation actions.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink-dark">Super Admin Marketplace Governance</h1>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
              Platform Authority
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Seller vetting, retailer privilege approvals, catalogue moderation, and dispute oversight
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-1 text-xs font-bold text-ink-secondary overflow-x-auto">
        {[
          { id: 'overview', label: 'Marketplace Metrics', icon: ShieldAlert },
          { id: 'wholesalers', label: `Wholesaler Applications (${sellers.filter(s => s.status === 'PENDING_APPROVAL').length} Pending)`, icon: Building2 },
          { id: 'retailers', label: `Retailer Applications (${retailers.filter(r => r.status === 'PENDING_APPROVAL').length} Pending)`, icon: Store },
          { id: 'orders', label: `Marketplace Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'issues', label: `Reported Disputes (${issues.length})`, icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'hover:bg-surface-warm text-ink-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Overview Metrics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-pure p-5 rounded-2xl border border-surface-border shadow-subtle">
              <span className="text-xs font-bold text-ink-muted block">Total Platform Users</span>
              <span className="text-2xl font-black text-ink-dark mt-1 block">{stats?.totalUsers ?? 0}</span>
              <span className="text-[10px] text-ink-muted mt-1 block">
                {stats?.customers ?? 0} Customers • {stats?.retailers ?? 0} Retailers • {stats?.wholesalers ?? 0} Sellers
              </span>
            </div>

            <div className="bg-surface-pure p-5 rounded-2xl border border-surface-border shadow-subtle">
              <span className="text-xs font-bold text-amber-700 block">Pending Wholesalers</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">{stats?.pendingWholesalers ?? 0}</span>
              <span className="text-[10px] text-ink-muted mt-1 block">Awaiting GSTIN/Trade check</span>
            </div>

            <div className="bg-surface-pure p-5 rounded-2xl border border-surface-border shadow-subtle">
              <span className="text-xs font-bold text-blue-700 block">Pending Retailers</span>
              <span className="text-2xl font-black text-blue-700 mt-1 block">{stats?.pendingRetailers ?? 0}</span>
              <span className="text-[10px] text-ink-muted mt-1 block">Awaiting wholesale tier gate</span>
            </div>

            <div className="bg-surface-pure p-5 rounded-2xl border border-surface-border shadow-subtle">
              <span className="text-xs font-bold text-ink-muted block">Total Order Turnover</span>
              <span className="text-2xl font-black text-brand-700 mt-1 block">₹{stats?.totalSalesVolume ?? 0}</span>
              <span className="text-[10px] text-ink-muted mt-1 block">{stats?.totalOrders ?? 0} orders created</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Wholesaler Applications */}
      {activeTab === 'wholesalers' && (
        <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-ink-dark">Wholesaler Onboarding Registrations</h3>
            <span className="text-xs text-ink-muted">{sellers.length} registered wholesalers</span>
          </div>

          <div className="divide-y divide-surface-border">
            {sellers.map((s) => (
              <div key={s._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-500" />
                    <strong className="text-sm text-ink-dark">{s.name}</strong>
                    <span className="text-ink-muted">({s.email} • {s.phone})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  {s.profile && (
                    <div className="text-[11px] text-ink-secondary space-y-0.5 pl-6">
                      <div><strong>Business:</strong> {s.profile.businessName} ({s.profile.businessType})</div>
                      <div>
                        <strong>GSTIN:</strong> <code className="font-mono bg-white px-1 rounded border">{s.profile.gstin || 'None provided'}</code>
                        {s.profile.tradeLicense && ` • Trade Lic: ${s.profile.tradeLicense}`}
                        {s.profile.fssaiLicense && ` • FSSAI: ${s.profile.fssaiLicense}`}
                      </div>
                      <div>
                        <strong>Coverage:</strong> {s.profile.deliverySettings?.serviceablePincodes?.length || 0} Delhi PIN codes
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {s.status === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        onClick={() => handleApproveSeller(s._id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve Seller
                      </button>
                      <button
                        onClick={() => setRejectModalTarget({ id: s._id, role: 'WHOLESALER', name: s.name })}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleToggleUserStatus(s._id)}
                    className="px-3 py-1.5 border border-surface-border text-ink-dark hover:bg-surface-warm font-semibold rounded-xl text-xs"
                  >
                    {s.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Account'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Retailer Applications */}
      {activeTab === 'retailers' && (
        <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-ink-dark">Retailer Kirana Applications</h3>
            <span className="text-xs text-ink-muted">{retailers.length} registered retailers</span>
          </div>

          <div className="divide-y divide-surface-border">
            {retailers.map((r) => (
              <div key={r._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-accent-gold" />
                    <strong className="text-sm text-ink-dark">{r.name}</strong>
                    <span className="text-ink-muted">({r.email} • {r.phone})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {r.status === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        onClick={() => handleApproveRetailer(r._id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve Retailer
                      </button>
                      <button
                        onClick={() => setRejectModalTarget({ id: r._id, role: 'RETAILER', name: r.name })}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleToggleUserStatus(r._id)}
                    className="px-3 py-1.5 border border-surface-border text-ink-dark hover:bg-surface-warm font-semibold rounded-xl text-xs"
                  >
                    {r.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Marketplace Orders */}
      {activeTab === 'orders' && (
        <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4">
          <h3 className="font-extrabold text-base text-ink-dark">Marketplace Orders Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-border text-ink-muted uppercase font-bold text-[10px]">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Wholesaler</th>
                  <th className="py-3 px-2">Buyer</th>
                  <th className="py-3 px-2">Total Amount</th>
                  <th className="py-3 px-2">Payment</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="py-3 px-2 font-mono font-bold text-ink-dark">{o.orderNumber}</td>
                    <td className="py-3 px-2 font-semibold text-brand-700">{o.sellerBusinessName}</td>
                    <td className="py-3 px-2 text-ink-dark">{o.buyerName} ({o.buyerRole})</td>
                    <td className="py-3 px-2 font-black text-ink-dark">₹{o.grandTotal}</td>
                    <td className="py-3 px-2 font-semibold">{o.paymentMethod} • {o.paymentStatus}</td>
                    <td className="py-3 px-2">
                      <span className="bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Disputes and Reported Issues */}
      {activeTab === 'issues' && (
        <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4">
          <h3 className="font-extrabold text-base text-ink-dark">Reported Customer Issues & Returns</h3>
          {issues.length === 0 ? (
            <p className="text-xs text-ink-muted italic">No open disputes reported.</p>
          ) : (
            issues.map((iss) => (
              <div key={iss._id} className="p-4 rounded-2xl bg-surface-warm border border-surface-border space-y-2 text-xs">
                <div className="flex justify-between font-bold text-ink-dark">
                  <span>Order #{iss.orderNumber} • Seller: {iss.sellerBusinessName}</span>
                  <span className="text-red-600 uppercase text-[10px]">{iss.returnIssue?.issueType}</span>
                </div>
                <p className="text-ink-secondary">"{iss.returnIssue?.description}"</p>
                <span className="text-[10px] text-ink-muted">Reported on: {new Date(iss.returnIssue?.reportedAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm p-4">
          <div className="bg-surface-pure rounded-3xl p-6 max-w-md w-full border border-surface-border shadow-float">
            <h3 className="font-extrabold text-base text-ink-dark mb-1">
              Reject {rejectModalTarget.role} Application
            </h3>
            <p className="text-xs text-ink-muted mb-4">{rejectModalTarget.name}</p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Invalid GSTIN or unverifiable trade address..."
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalTarget(null)}
                  className="px-4 py-2 text-xs font-bold text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
