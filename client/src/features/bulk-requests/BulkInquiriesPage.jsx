import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Calendar,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  BadgeIndianRupee,
  Check,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import AuthModal from '../../components/common/AuthModal';

export const BulkInquiriesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { pincode: cartPincode } = useCart();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my_inquiries'); // 'my_inquiries' | 'new_inquiry'

  const [formData, setFormData] = useState({
    productOrCategory: '',
    requestedQty: 300,
    requiredDate: '',
    deliveryPincode: cartPincode || '110001',
    deliveryAddressText: 'Banquet Hall Gate 1, Ring Road, Delhi',
    budget: '',
    additionalRequirements: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const fetchMyInquiries = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const res = await apiClient.get('/bulk-requests/my-inquiries');
        if (res.data.success) {
          setInquiries(res.data.inquiries);
        }
      }
    } catch (err) {
      console.error('Failed to load bulk inquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInquiries();
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await apiClient.post('/bulk-requests', formData);
      if (res.data.success) {
        setActiveTab('my_inquiries');
        setFormData({
          productOrCategory: '',
          requestedQty: 300,
          requiredDate: '',
          deliveryPincode: cartPincode || '110001',
          deliveryAddressText: '',
          budget: '',
          additionalRequirements: '',
        });
        fetchMyInquiries();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptQuote = async (inquiryId, quotationId) => {
    if (!window.confirm('Accept this quotation and generate confirmed order?')) return;
    try {
      const res = await apiClient.post(`/bulk-requests/${inquiryId}/accept-quote`, {
        quotationId,
        paymentMethod: 'COD',
      });
      if (res.data.success) {
        alert('Quotation accepted! Created order: ' + res.data.order.orderNumber);
        fetchMyInquiries();
        navigate('/my-orders');
      }
    } catch (err) {
      alert('Failed to accept quotation: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink-dark">Event & Bulk Purchase Quotes</h1>
            <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brand-200">
              Weddings & Banquets
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Submit custom bulk grocery and supplies inquiries directly to regional wholesalers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my_inquiries')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'my_inquiries'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-surface-pure border border-surface-border text-ink-dark hover:bg-surface-warm'
            }`}
          >
            My Inquiries ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('new_inquiry')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'new_inquiry'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-surface-pure border border-surface-border text-ink-dark hover:bg-surface-warm'
            }`}
          >
            <Plus className="w-4 h-4" />
            New Bulk Request
          </button>
        </div>
      </div>

      {/* Tab: New Bulk Request Form */}
      {activeTab === 'new_inquiry' && (
        <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="font-extrabold text-lg text-ink-dark">Submit New Bulk Requirement</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Wholesalers will examine your quantity, venue PIN code, and deliver competitive quotes
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">
                Product or Requirement Description
              </label>
              <input
                type="text"
                required
                value={formData.productOrCategory}
                onChange={(e) => setFormData({ ...formData, productOrCategory: e.target.value })}
                placeholder="e.g. 300 paper plates, 200 water bottles, and 50 kg basmati rice for wedding"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 text-ink-dark"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Requested Total Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.requestedQty}
                  onChange={(e) => setFormData({ ...formData, requestedQty: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold text-ink-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Required by Date</label>
                <input
                  type="date"
                  required
                  value={formData.requiredDate}
                  onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold text-ink-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Delivery Destination PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={formData.deliveryPincode}
                  onChange={(e) => setFormData({ ...formData, deliveryPincode: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold font-mono text-ink-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Approximate Budget (₹ Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 text-ink-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">Delivery Venue / Full Address</label>
              <textarea
                rows={2}
                required
                value={formData.deliveryAddressText}
                onChange={(e) => setFormData({ ...formData, deliveryAddressText: e.target.value })}
                placeholder="e.g. Grand Banquet Hall, Gate No. 2, Outer Ring Road, Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 text-ink-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">Special Packaging or Delivery Instructions</label>
              <textarea
                rows={2}
                value={formData.additionalRequirements}
                onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                placeholder="e.g. Require delivery before 10 AM, biodegrable materials preferred..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 text-ink-dark"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-card flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting to Wholesalers...' : 'Submit Bulk Inquiry to Market'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab: My Bulk Inquiries List */}
      {activeTab === 'my_inquiries' && (
        <div className="space-y-6">
          {!isAuthenticated ? (
            <div className="p-8 bg-surface-pure rounded-3xl border border-surface-border text-center space-y-3">
              <h3 className="font-bold text-sm text-ink-dark">Sign in to view your bulk inquiries</h3>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-xl"
              >
                Sign In
              </button>
            </div>
          ) : loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="bg-surface-pure rounded-3xl border border-surface-border p-12 text-center space-y-4">
              <Layers className="w-12 h-12 text-ink-muted mx-auto" />
              <h3 className="font-extrabold text-base text-ink-dark">No Bulk Inquiries Submitted Yet</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Need large quantities for a wedding, banquet, or community feast? Create your first inquiry.
              </p>
              <button
                onClick={() => setActiveTab('new_inquiry')}
                className="px-5 py-2.5 bg-brand-500 text-white font-bold rounded-xl text-xs"
              >
                Create Bulk Request
              </button>
            </div>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq._id}
                className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-ink-dark">{inq.productOrCategory}</h3>
                    <span className="text-[11px] text-ink-muted font-mono">Inquiry ID: {inq.inquiryNumber}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-brand-50 text-brand-700 font-bold text-xs px-2.5 py-1 rounded-md">
                      Qty: {inq.requestedQty} units
                    </span>
                    <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-1 rounded-md">
                      {inq.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink-secondary">
                  <div><strong>Required Date:</strong> {new Date(inq.requiredDate).toLocaleDateString()}</div>
                  <div><strong>Venue PIN:</strong> {inq.deliveryPincode}</div>
                  <div><strong>Budget:</strong> ₹{inq.budget || 'Open'}</div>
                </div>

                {inq.deliveryAddressText && (
                  <p className="text-xs text-ink-muted bg-surface-warm p-2.5 rounded-xl">
                    <strong>Delivery Venue:</strong> {inq.deliveryAddressText}
                  </p>
                )}

                {/* Received Quotes Section */}
                <div className="pt-3 border-t border-surface-border space-y-3">
                  <span className="font-extrabold text-xs text-ink-dark block uppercase tracking-wide">
                    Wholesaler Quotations ({inq.quotes?.length || 0} Offers)
                  </span>

                  {(!inq.quotes || inq.quotes.length === 0) ? (
                    <p className="text-xs text-ink-muted italic">
                      Wholesalers are reviewing your requirement. Quotations will appear here.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {inq.quotes.map((quote) => (
                        <div
                          key={quote.quotationId}
                          className="p-3.5 rounded-2xl bg-surface-warm/60 border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-brand-500" />
                              <strong className="text-ink-dark text-sm">{quote.sellerBusinessName}</strong>
                              {quote.status === 'ACCEPTED' && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Winning Quote
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-ink-muted block">
                              Unit Rate: ₹{quote.unitPrice} • Delivery Fee: ₹{quote.deliveryFee} • Timeline: {quote.estimatedDays}
                            </span>
                            {quote.quotationNotes && (
                              <p className="text-[11px] text-ink-secondary italic">"{quote.quotationNotes}"</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-xs text-ink-muted block">Total Quote</span>
                              <span className="text-base font-black text-brand-700">₹{quote.totalPrice}</span>
                            </div>

                            {inq.status !== 'ACCEPTED' && (
                              <button
                                onClick={() => handleAcceptQuote(inq._id, quote.quotationId)}
                                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm"
                              >
                                Accept & Order
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default BulkInquiriesPage;
