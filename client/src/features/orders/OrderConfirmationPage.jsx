import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, QrCode, Building, Send, Check } from 'lucide-react';
import apiClient from '../../lib/apiClient';

export const OrderConfirmationPage = () => {
  const location = useLocation();
  const orders = location.state?.orders || [];
  const message = location.state?.message || 'Your orders have been successfully placed!';

  const [utrInputs, setUtrInputs] = useState({});
  const [submittedUtrs, setSubmittedUtrs] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const handleUtrSubmit = async (orderId) => {
    const utr = utrInputs[orderId];
    if (!utr || utr.trim().length < 4) return;

    setSubmittingId(orderId);
    try {
      const res = await apiClient.post(`/orders/${orderId}/submit-utr`, { utrReference: utr.trim() });
      if (res.data.success) {
        setSubmittedUtrs({ ...submittedUtrs, [orderId]: utr.trim() });
      }
    } catch (err) {
      alert('Failed to submit UTR: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-ink-dark">No Recent Orders Found</h2>
        <Link to="/my-orders" className="inline-block px-5 py-2.5 bg-brand-500 text-white font-bold rounded-xl text-xs">
          View My Orders History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Banner */}
      <div className="bg-surface-pure rounded-3xl border border-surface-border p-8 text-center space-y-4 shadow-subtle">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-dark">Order Confirmed!</h1>
        <p className="text-xs sm:text-sm text-ink-muted max-w-lg mx-auto">
          {message} Each seller will independently prepare, package, and dispatch your items.
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <h3 className="font-extrabold text-base text-ink-dark">
          Created Orders ({orders.length} {orders.length === 1 ? 'Wholesaler' : 'Wholesalers'})
        </h3>

        {orders.map((order) => {
          const isUpi = order.paymentMethod === 'MANUAL_UPI';
          const isSubmitted = Boolean(submittedUtrs[order._id] || order.paymentDetails?.utrReference);
          const upiString = `upi://pay?pa=${encodeURIComponent(order.paymentDetails?.sellerUpiId || 'seller@upi')}&pn=${encodeURIComponent(order.sellerBusinessName)}&am=${order.grandTotal}&tr=${order.orderNumber}&cu=INR`;

          return (
            <div
              key={order._id}
              className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-ink-dark">{order.sellerBusinessName}</h4>
                    <span className="text-[11px] font-mono text-ink-muted">Order ID: {order.orderNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-brand-50 text-brand-700 font-bold px-2.5 py-1 rounded-md">
                    {order.fulfilmentMethod}
                  </span>
                  <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-md">
                    {order.paymentMethod} • {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 text-ink-secondary">
                    <span>{item.name} × {item.quantity} {item.packSizeUnit}</span>
                    <span className="font-bold text-ink-dark">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Price Row */}
              <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs font-bold text-ink-dark">
                <span>Grand Total (incl. delivery ₹{order.deliveryFee})</span>
                <span className="text-base font-black text-brand-700">₹{order.grandTotal}</span>
              </div>

              {/* UPI Verification Form if Manual UPI */}
              {isUpi && (
                <div className="p-4 bg-brand-50/60 border border-brand-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-brand-800 font-bold text-xs">
                    <QrCode className="w-4 h-4 text-brand-600" />
                    <span>Pay Seller via UPI: {order.paymentDetails?.sellerUpiId || 'seller@upi'}</span>
                  </div>

                  <p className="text-[11px] text-ink-secondary">
                    Scan using Google Pay, PhonePe, or Paytm and transfer exactly <strong>₹{order.grandTotal}</strong> to seller account.
                  </p>

                  {isSubmitted ? (
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>UTR Submitted: {submittedUtrs[order._id] || order.paymentDetails?.utrReference}. Awaiting seller verification.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter 12-digit UPI UTR / Transaction No."
                        value={utrInputs[order._id] || ''}
                        onChange={(e) => setUtrInputs({ ...utrInputs, [order._id]: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl border border-surface-border bg-white text-xs text-ink-dark outline-none focus:border-brand-500 font-mono"
                      />
                      <button
                        type="button"
                        disabled={submittingId === order._id}
                        onClick={() => handleUtrSubmit(order._id)}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Submit UTR
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/my-orders"
          className="w-full sm:w-auto px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-card text-center"
        >
          View in My Orders
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-6 py-3.5 bg-surface-pure hover:bg-surface-warm text-ink-dark font-bold text-xs sm:text-sm rounded-xl transition border border-surface-border text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
