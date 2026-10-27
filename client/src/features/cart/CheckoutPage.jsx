import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  Building,
  CreditCard,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Store,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../../components/common/AuthModal';

export const CheckoutPage = () => {
  const { sellerGroups, totalSubtotal, clearCart, pincode: defaultPincode } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [manualAddress, setManualAddress] = useState({
    recipientName: user?.name || '',
    phone: user?.phone || '',
    houseNo: '',
    street: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: defaultPincode || '110001',
  });
  const [useManual, setUseManual] = useState(false);

  // Per-seller settings
  const [fulfilmentMethods, setFulfilmentMethods] = useState({}); // { [sellerId]: 'DELIVERY' | 'PICKUP' }
  const [paymentMethods, setPaymentMethods] = useState({});       // { [sellerId]: 'COD' | 'MANUAL_UPI' | 'DIRECT_PICKUP' }
  const [sellerProfiles, setSellerProfiles] = useState({});
  const [customerNotes, setCustomerNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Fetch saved addresses and seller delivery settings
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        const addrRes = await apiClient.get('/addresses');
        if (addrRes.data.success) {
          const list = addrRes.data.addresses;
          setAddresses(list);
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          } else {
            setUseManual(true);
          }
        }

        // Fetch seller public profiles to get delivery settings & serviceable PIN codes
        const profileMap = {};
        for (const group of sellerGroups) {
          try {
            const pRes = await apiClient.get(`/sellers/profile/${group.sellerId}`);
            if (pRes.data.success) {
              profileMap[group.sellerId] = pRes.data.profile;
            }
          } catch {
            // Fallback default settings
            profileMap[group.sellerId] = {
              deliverySettings: {
                deliveryEnabled: true,
                pickupEnabled: true,
                deliveryFee: 40,
                serviceablePincodes: ['110001', '110002', '110003', '110004', '110005', '110033', '110036', '110092'],
                codAvailable: true,
                upiId: 'seller@upi',
              },
            };
          }
        }
        setSellerProfiles(profileMap);
      } catch (err) {
        console.error('Failed to load checkout pre-requisites:', err);
      }
    };

    loadData();
  }, [isAuthenticated, sellerGroups]);

  // Current active PIN code
  const activePincode = useManual
    ? manualAddress.pincode
    : addresses.find((a) => a._id === selectedAddressId)?.pincode || defaultPincode;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const allCartItems = sellerGroups.flatMap((g) =>
        g.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );

      const payload = {
        items: allCartItems,
        deliveryAddressId: useManual ? null : selectedAddressId,
        manualAddress: useManual ? manualAddress : null,
        fulfilmentMethods,
        paymentMethods,
        customerNotes,
      };

      const res = await apiClient.post('/orders/checkout', payload);

      if (res.data.success) {
        clearCart();
        navigate('/order-confirmation', {
          state: {
            orders: res.data.orders,
            message: res.data.message,
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please inspect your items and delivery settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-ink-dark">Sign in to Checkout</h2>
        <p className="text-xs text-ink-muted">
          Please sign in to your customer or retailer account to select your delivery address and confirm your orders.
        </p>
        <button
          onClick={() => setIsAuthOpen(true)}
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition"
        >
          Sign In / Create Account
        </button>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-dark">Multi-Seller Checkout</h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Review destination addresses, fulfilment methods, and seller payment terms
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Delivery or Checkout Validation Issue</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Multi-Seller Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Destination Address */}
          <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" />
                <h3 className="font-black text-base text-ink-dark">1. Delivery Address</h3>
              </div>
              <button
                type="button"
                onClick={() => setUseManual(!useManual)}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                {useManual ? 'Choose Saved Address' : '+ Enter Manual Address'}
              </button>
            </div>

            {!useManual && addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      selectedAddressId === addr._id
                        ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                        : 'border-surface-border hover:bg-surface-warm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-xs text-ink-dark">{addr.recipientName}</span>
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded">
                          {addr.addressType}
                        </span>
                      </div>
                      <p className="text-xs text-ink-secondary leading-snug">
                        {addr.houseNo}, {addr.street}, {addr.city}, {addr.state} — <strong className="text-ink-dark">{addr.pincode}</strong>
                      </p>
                      <span className="text-[11px] text-ink-muted block mt-1">Phone: {addr.phone}</span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-surface-border flex items-center gap-2">
                      <input
                        type="radio"
                        name="addressChoice"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-xs font-bold text-ink-dark">Deliver Here</span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={manualAddress.recipientName}
                      onChange={(e) => setManualAddress({ ...manualAddress, recipientName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={manualAddress.phone}
                      onChange={(e) => setManualAddress({ ...manualAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-1">House / Flat / Shop No.</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 301, Tower B"
                      value={manualAddress.houseNo}
                      onChange={(e) => setManualAddress({ ...manualAddress, houseNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-1">Street / Locality</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Main Ring Road"
                      value={manualAddress.street}
                      onChange={(e) => setManualAddress({ ...manualAddress, street: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={manualAddress.city}
                      onChange={(e) => setManualAddress({ ...manualAddress, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={manualAddress.state}
                      onChange={(e) => setManualAddress({ ...manualAddress, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-1">PIN Code (6 digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={manualAddress.pincode}
                      onChange={(e) => setManualAddress({ ...manualAddress, pincode: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Per-Seller Fulfilment & Payment Selection */}
          <div className="space-y-6">
            <h3 className="font-black text-base text-ink-dark flex items-center gap-2">
              <Store className="w-5 h-5 text-brand-500" />
              <span>2. Fulfilment & Payment per Wholesaler</span>
            </h3>

            {sellerGroups.map((group) => {
              const profile = sellerProfiles[group.sellerId] || {};
              const delivery = profile.deliverySettings || {
                deliveryEnabled: true,
                pickupEnabled: true,
                deliveryFee: 40,
                serviceablePincodes: ['110001', '110002', '110003', '110004', '110005'],
                codAvailable: true,
                upiId: 'seller@upi',
              };

              const currentFulfilment = fulfilmentMethods[group.sellerId] || 'DELIVERY';
              const currentPayment = paymentMethods[group.sellerId] || (delivery.codAvailable ? 'COD' : 'MANUAL_UPI');

              // Verify PIN code coverage
              const isPincodeServiceable = (delivery.serviceablePincodes || []).includes(activePincode);

              return (
                <div
                  key={group.sellerId}
                  className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-brand-600" />
                      <div>
                        <h4 className="font-extrabold text-sm text-ink-dark">{group.sellerBusinessName}</h4>
                        <span className="text-[11px] text-ink-muted">{group.items.length} items • Subtotal: ₹{group.subtotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Coverage Warning if not serviceable */}
                  {!isPincodeServiceable && currentFulfilment === 'DELIVERY' && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">Delivery not serviceable to PIN {activePincode}</strong>
                        <span>
                          {group.sellerBusinessName} only delivers to specific Delhi PIN codes ({delivery.serviceablePincodes?.slice(0, 4).join(', ')}...).
                          Please switch this seller to <strong>Warehouse Pickup</strong> or change your delivery PIN.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Fulfilment Choice */}
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                      Fulfilment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFulfilmentMethods({ ...fulfilmentMethods, [group.sellerId]: 'DELIVERY' })}
                        className={`p-3 rounded-xl border text-left transition ${
                          currentFulfilment === 'DELIVERY'
                            ? 'border-brand-500 bg-brand-50 text-brand-800 font-bold'
                            : 'border-surface-border text-ink-dark hover:bg-surface-warm'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-brand-500" />
                          <span className="text-xs font-bold">Seller Delivery</span>
                        </div>
                        <span className="text-[10px] text-ink-muted block mt-1">
                          Fee: ₹{group.subtotal >= (delivery.freeDeliveryThreshold || 499) ? '0 (Free)' : (delivery.deliveryFee || 40)}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFulfilmentMethods({ ...fulfilmentMethods, [group.sellerId]: 'PICKUP' })}
                        className={`p-3 rounded-xl border text-left transition ${
                          currentFulfilment === 'PICKUP'
                            ? 'border-brand-500 bg-brand-50 text-brand-800 font-bold'
                            : 'border-surface-border text-ink-dark hover:bg-surface-warm'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-brand-500" />
                          <span className="text-xs font-bold">Mandi / Warehouse Pickup</span>
                        </div>
                        <span className="text-[10px] text-ink-muted block mt-1">
                          Fee: ₹0 • Collect at warehouse
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Choice */}
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                      Payment Option
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {delivery.codAvailable && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethods({ ...paymentMethods, [group.sellerId]: 'COD' })}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            currentPayment === 'COD'
                              ? 'border-brand-500 bg-brand-50 text-brand-800 font-bold'
                              : 'border-surface-border text-ink-dark hover:bg-surface-warm'
                          }`}
                        >
                          <span className="text-xs block font-bold">💵 Cash on Delivery</span>
                          <span className="text-[10px] text-ink-muted">Pay cash at delivery</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setPaymentMethods({ ...paymentMethods, [group.sellerId]: 'MANUAL_UPI' })}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          currentPayment === 'MANUAL_UPI'
                            ? 'border-brand-500 bg-brand-50 text-brand-800 font-bold'
                            : 'border-surface-border text-ink-dark hover:bg-surface-warm'
                        }`}
                      >
                        <span className="text-xs block font-bold">📱 Manual UPI QR</span>
                        <span className="text-[10px] text-ink-muted">Scan & submit UTR</span>
                      </button>

                      {currentFulfilment === 'PICKUP' && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethods({ ...paymentMethods, [group.sellerId]: 'DIRECT_PICKUP' })}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            currentPayment === 'DIRECT_PICKUP'
                              ? 'border-brand-500 bg-brand-50 text-brand-800 font-bold'
                              : 'border-surface-border text-ink-dark hover:bg-surface-warm'
                          }`}
                        >
                          <span className="text-xs block font-bold">🏪 Pay at Pickup</span>
                          <span className="text-[10px] text-ink-muted">Direct to seller</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* UPI QR & VPA preview if UPI selected */}
                  {currentPayment === 'MANUAL_UPI' && (
                    <div className="p-3 bg-brand-50/50 border border-brand-200 rounded-xl space-y-1 text-xs">
                      <span className="font-bold text-brand-800 block">
                        Seller UPI ID: <code className="bg-white px-2 py-0.5 rounded border border-brand-300 font-mono text-ink-dark">{delivery.upiId || 'bharatwholesale@upi'}</code>
                      </span>
                      <span className="text-[11px] text-ink-secondary block">
                        After placing your order, you can submit your UPI Transaction Reference Number (UTR) on the order confirmation screen for seller verification.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Customer Delivery Notes */}
          <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-subtle space-y-2">
            <label className="block text-xs font-bold text-ink-dark">Optional Order Notes for Dispatchers</label>
            <textarea
              rows={2}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="e.g. Please call upon arrival, leave with security guard, or deliver in morning slot..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs text-ink-dark outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Right Column: Final Order Total & Confirmation (4 cols) */}
        <div className="lg:col-span-4 bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-card space-y-5 sticky top-28">
          <h3 className="font-black text-base text-ink-dark pb-3 border-b border-surface-border">
            Final Checkout Summary
          </h3>

          <div className="space-y-3 text-xs text-ink-secondary">
            <div className="flex items-center justify-between">
              <span>Total Product Value</span>
              <span className="font-bold text-ink-dark">₹{totalSubtotal}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Sellers Creating Orders</span>
              <span className="font-bold text-ink-dark">{sellerGroups.length} Orders</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Delivery Destination</span>
              <span className="font-bold text-brand-700">PIN {activePincode}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-between">
            <div>
              <span className="text-xs text-ink-muted block font-semibold">Total Amount</span>
              <span className="text-2xl font-black text-ink-dark">₹{totalSubtotal}</span>
            </div>
            <span className="text-[11px] text-ink-muted">+ seller delivery fee</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black text-sm rounded-xl transition shadow-card flex items-center justify-center gap-2"
          >
            {loading ? 'Validating & Placing Orders...' : 'Place Multi-Seller Order'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-ink-muted text-center leading-relaxed">
            By placing your order, you agree to VyaparSetu's transparent Indian commerce terms. Orders are confirmed directly with each independent seller.
          </p>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
