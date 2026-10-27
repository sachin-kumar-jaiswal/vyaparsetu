import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Building,
  AlertTriangle,
  RotateCcw,
  XCircle,
  QrCode,
  Send,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

export const MyOrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals for actions
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [issueModalOrder, setIssueModalOrder] = useState(null);
  const [issueData, setIssueData] = useState({ issueType: 'DAMAGED_ITEM', description: '' });

  const [utrModalOrder, setUtrModalOrder] = useState(null);
  const [utrValue, setUtrValue] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'all' ? `/orders/my-orders?status=${statusFilter}` : '/orders/my-orders';
      const res = await apiClient.get(url);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated, statusFilter]);

  const handleCancelRequest = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    try {
      await apiClient.post(`/orders/${cancelModalOrder._id}/cancellation-request`, { reason: cancelReason });
      setCancelModalOrder(null);
      setCancelReason('');
      fetchOrders();
    } catch (err) {
      alert('Error requesting cancellation: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueModalOrder) return;
    try {
      await apiClient.post(`/orders/${issueModalOrder._id}/return-issue`, issueData);
      setIssueModalOrder(null);
      setIssueData({ issueType: 'DAMAGED_ITEM', description: '' });
      fetchOrders();
    } catch (err) {
      alert('Error submitting issue: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUtrSubmit = async (e) => {
    e.preventDefault();
    if (!utrModalOrder || !utrValue.trim()) return;
    try {
      await apiClient.post(`/orders/${utrModalOrder._id}/submit-utr`, { utrReference: utrValue.trim() });
      setUtrModalOrder(null);
      setUtrValue('');
      fetchOrders();
    } catch (err) {
      alert('Error submitting UTR: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'COLLECTED':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-md">{status}</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-md">{status}</span>;
      case 'OUT_FOR_DELIVERY':
      case 'READY_FOR_DISPATCH':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-md">{status.replace(/_/g, ' ')}</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-md">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-dark">My Orders</h1>
          <p className="text-xs text-ink-muted mt-0.5">Track multi-seller fulfilment and payment verification</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-surface-muted rounded-xl text-xs font-bold text-ink-muted">
          {['all', 'PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                statusFilter === s ? 'bg-surface-pure text-ink-dark shadow-sm' : 'hover:text-ink-dark'
              }`}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-surface-pure rounded-3xl border border-surface-border p-12 text-center space-y-4">
          <Package className="w-12 h-12 text-ink-muted mx-auto" />
          <h3 className="font-extrabold text-base text-ink-dark">No orders found</h3>
          <p className="text-xs text-ink-muted">You haven't placed any orders under this filter.</p>
          <Link to="/products" className="inline-block px-5 py-2.5 bg-brand-500 text-white font-bold rounded-xl text-xs">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isDelivered = ['DELIVERED', 'COLLECTED'].includes(order.orderStatus);
            const isCancelled = order.orderStatus === 'CANCELLED';

            return (
              <div
                key={order._id}
                className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-ink-dark">{order.sellerBusinessName}</h4>
                      <span className="text-[11px] font-mono text-ink-muted">Order ID: {order.orderNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.orderStatus)}
                    <span className="text-[11px] font-bold text-ink-muted bg-surface-warm px-2 py-1 rounded">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-surface-warm/50 border border-surface-border">
                      <img
                        src={item.image || '/images/products/placeholder.svg'}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-surface-border"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-ink-dark truncate block">{item.name}</span>
                        <span className="text-[11px] text-ink-muted block">
                          Qty: {item.quantity} {item.packSizeUnit} • ₹{item.unitPrice}
                        </span>
                      </div>
                      <span className="font-extrabold text-xs text-ink-dark shrink-0">
                        ₹{item.subtotal}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summary Row */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-surface-border text-xs gap-3">
                  <div className="flex items-center gap-3 text-ink-secondary">
                    <span>Fulfilment: <strong>{order.fulfilmentMethod}</strong></span>
                    <span>•</span>
                    <span>Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                    {order.paymentDetails?.utrReference && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-brand-700 font-bold">UTR: {order.paymentDetails.utrReference}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-muted">Grand Total:</span>
                    <span className="font-black text-base text-brand-700">₹{order.grandTotal}</span>
                  </div>
                </div>

                {/* Cancellation / Return Request Status Notice */}
                {order.cancellation?.isRequested && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <strong>Cancellation Status: {order.cancellation.status}</strong>
                    <p className="text-[11px] mt-0.5">{order.cancellation.reason} — {order.cancellation.responseNote || 'Awaiting response'}</p>
                  </div>
                )}

                {order.returnIssue?.isReported && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                    <strong>Reported Issue: {order.returnIssue.issueType} ({order.returnIssue.status})</strong>
                    <p className="text-[11px] mt-0.5">{order.returnIssue.description}</p>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {order.paymentMethod === 'MANUAL_UPI' && order.paymentStatus === 'PENDING_VERIFICATION' && (
                    <button
                      onClick={() => { setUtrModalOrder(order); setUtrValue(order.paymentDetails?.utrReference || ''); }}
                      className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      {order.paymentDetails?.utrReference ? 'Update UTR' : 'Submit UPI UTR'}
                    </button>
                  )}

                  {!isCancelled && !isDelivered && !order.cancellation?.isRequested && (
                    <button
                      onClick={() => setCancelModalOrder(order)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Request Cancellation
                    </button>
                  )}

                  {isDelivered && !order.returnIssue?.isReported && (
                    <button
                      onClick={() => setIssueModalOrder(order)}
                      className="px-3 py-1.5 bg-surface-muted hover:bg-surface-warm text-ink-dark border border-surface-border font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Report Return / Issue
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UTR Modal */}
      {utrModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm p-4">
          <div className="bg-surface-pure rounded-3xl p-6 max-w-md w-full border border-surface-border shadow-float">
            <h3 className="font-extrabold text-base text-ink-dark mb-1">Submit UPI Payment Reference</h3>
            <p className="text-xs text-ink-muted mb-4">
              Seller: {utrModalOrder.sellerBusinessName} (UPI: {utrModalOrder.paymentDetails?.sellerUpiId || 'seller@upi'})
            </p>
            <form onSubmit={handleUtrSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">12-Digit Transaction UTR</label>
                <input
                  type="text"
                  required
                  value={utrValue}
                  onChange={(e) => setUtrValue(e.target.value)}
                  placeholder="e.g. 320148902026"
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUtrModalOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl"
                >
                  Save UTR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm p-4">
          <div className="bg-surface-pure rounded-3xl p-6 max-w-md w-full border border-surface-border shadow-float">
            <h3 className="font-extrabold text-base text-ink-dark mb-1">Request Order Cancellation</h3>
            <p className="text-xs text-ink-muted mb-4">
              Order {cancelModalOrder.orderNumber} with {cancelModalOrder.sellerBusinessName}
            </p>
            <form onSubmit={handleCancelRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Reason for cancellation</label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Ordered incorrect pack size, address change, or item no longer required..."
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-ink-muted"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {issueModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm p-4">
          <div className="bg-surface-pure rounded-3xl p-6 max-w-md w-full border border-surface-border shadow-float">
            <h3 className="font-extrabold text-base text-ink-dark mb-1">Report Return / Issue</h3>
            <p className="text-xs text-ink-muted mb-4">Order {issueModalOrder.orderNumber}</p>
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Issue Category</label>
                <select
                  value={issueData.issueType}
                  onChange={(e) => setIssueData({ ...issueData, issueType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold"
                >
                  <option value="DAMAGED_ITEM">Damaged or Leaking Item</option>
                  <option value="WRONG_ITEM">Incorrect Product Delivered</option>
                  <option value="MISSING_ITEM">Item Missing from Parcel</option>
                  <option value="QUALITY_ISSUE">Product Quality Concern</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Details & Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={issueData.description}
                  onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
                  placeholder="Describe the condition or discrepancy so the seller can resolve..."
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl"
                >
                  Submit Issue Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
