import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  MapPin,
  PackageCheck,
  Store,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const ProductDetailPage = () => {
  const { idOrSlug } = useParams();
  const { addItem, updateQuantity, items, pincode: currentPincode } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedQty, setSelectedQty] = useState(1);
  const [checkPincode, setCheckPincode] = useState(currentPincode);
  const [serviceableStatus, setServiceableStatus] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/products/${idOrSlug}`);
        if (res.data.success) {
          setProduct(res.data.product);
          setSeller(res.data.seller);

          // Check initial serviceability with current cart pincode
          if (res.data.seller?.deliverySettings?.serviceablePincodes) {
            const isSupported = res.data.seller.deliverySettings.serviceablePincodes.includes(currentPincode);
            setServiceableStatus({
              tested: true,
              supported: isSupported,
              pincode: currentPincode,
            });
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [idOrSlug, currentPincode]);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!checkPincode || checkPincode.length !== 6) return;

    const list = seller?.deliverySettings?.serviceablePincodes || [];
    const supported = list.includes(checkPincode.trim());
    setServiceableStatus({
      tested: true,
      supported,
      pincode: checkPincode.trim(),
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-ink-dark">{error || 'Product Not Found'}</h2>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-brand-500 text-white font-bold rounded-xl text-xs">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const isRetailer = user?.role === 'RETAILER';
  const cartItem = items.find((i) => i.productId === product._id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const deliverySettings = seller?.deliverySettings || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-ink-muted flex items-center gap-2">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-600">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.categorySlug}`} className="hover:text-brand-600 capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-ink-dark font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Product Media Area (5 cols) */}
        <div className="lg:col-span-5 bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-card">
          <div className="aspect-square rounded-2xl bg-surface-warm overflow-hidden flex items-center justify-center p-4">
            <img
              src={product.images?.[0] || '/images/products/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-105 transition duration-300"
            />
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5 font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              100% Genuine Direct Mandi/Factory Pack
            </span>
            <span>SKU: {product.slug.slice(0, 12)}</span>
          </div>
        </div>

        {/* Product Details & Ordering (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-brand-50 text-brand-700 font-extrabold text-[11px] px-2.5 py-0.5 rounded uppercase">
                {product.brand}
              </span>
              <span className="bg-surface-muted text-ink-secondary font-bold text-[11px] px-2.5 py-0.5 rounded">
                Pack: {product.packSizeUnit}
              </span>
              {product.stock > 0 ? (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> In Stock ({product.stock} units)
                </span>
              ) : (
                <span className="text-red-600 font-bold text-xs flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-ink-dark leading-snug">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="bg-surface-pure rounded-2xl border border-surface-border p-5 space-y-4 shadow-subtle">
            <div className="flex flex-wrap items-baseline gap-4">
              <div>
                <span className="text-xs text-ink-muted block font-semibold">Retail Price</span>
                <span className="text-2xl sm:text-3xl font-black text-ink-dark">
                  ₹{product.retailPrice}
                </span>
              </div>

              <div className="border-l border-surface-border pl-4">
                <span className="text-xs text-brand-700 block font-bold">Wholesale Tier Rate</span>
                <span className="text-2xl sm:text-3xl font-black text-brand-600">
                  ₹{product.wholesalePrice}
                </span>
                <span className="text-[11px] text-ink-muted font-medium block">
                  (Min wholesale quantity: {product.minWholesaleQty || 5} units)
                </span>
              </div>
            </div>

            {/* Quantity Tier Table */}
            {Array.isArray(product.quantityTiers) && product.quantityTiers.length > 0 && (
              <div className="pt-3 border-t border-surface-border">
                <span className="text-xs font-bold text-ink-dark block mb-2 uppercase tracking-wide">
                  Volume Quantity Discounts
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.quantityTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-brand-200 bg-brand-50/40 text-center"
                    >
                      <span className="text-[11px] font-bold text-brand-800 block">
                        {tier.minQty} {tier.maxQty ? `to ${tier.maxQty}` : 'or more'} packs
                      </span>
                      <span className="text-sm font-black text-ink-dark">
                        ₹{tier.pricePerUnit} / pack
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-surface-border rounded-xl bg-surface-warm p-1">
                <button
                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                  className="p-2 hover:bg-surface-pure rounded-lg text-ink-dark transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-14 text-center font-bold text-sm bg-transparent outline-none"
                />
                <button
                  onClick={() => setSelectedQty(Math.min(product.stock, selectedQty + 1))}
                  className="p-2 hover:bg-surface-pure rounded-lg text-ink-dark transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                disabled={product.stock <= 0}
                onClick={() => {
                  addItem(product, selectedQty);
                }}
                className="flex-1 py-3.5 px-6 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl transition shadow-card flex items-center justify-center gap-2"
              >
                <PackageCheck className="w-5 h-5" />
                <span>Add {selectedQty} {selectedQty > 1 ? 'Units' : 'Unit'} to Cart</span>
              </button>
            </div>
          </div>

          {/* Delivery & Serviceability Checker */}
          <div className="bg-surface-pure rounded-2xl border border-surface-border p-5 space-y-3">
            <div className="flex items-center gap-2 text-ink-dark font-bold text-sm">
              <Truck className="w-4 h-4 text-brand-500" />
              <span>Delivery Serviceability Check</span>
            </div>

            <form onSubmit={handlePincodeCheck} className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={checkPincode}
                  onChange={(e) => setCheckPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit delivery PIN code"
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-surface-border focus:border-brand-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-surface-muted hover:bg-brand-500 hover:text-white text-ink-dark rounded-xl text-xs font-bold transition"
              >
                Verify PIN
              </button>
            </form>

            {serviceableStatus?.tested && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                serviceableStatus.supported
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {serviceableStatus.supported ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        Direct Delivery Available for PIN {serviceableStatus.pincode}!
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {deliverySettings.estimatedDeliveryTime || 'Same Day / Next Day Dispatch'} • Delivery fee: ₹{deliverySettings.deliveryFee || 40} (Free over ₹{deliverySettings.freeDeliveryThreshold || 499})
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        Standard delivery not serviceable for PIN {serviceableStatus.pincode}.
                      </span>
                      <span className="text-[11px] text-amber-700">
                        You can still choose seller warehouse pickup or provide a serviceable Delhi-NCR address at checkout.
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Seller Profile Card */}
          <div className="bg-surface-pure rounded-2xl border border-surface-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-ink-dark">{seller?.businessName || product.sellerBusinessName}</h4>
                  <span className="text-[11px] text-ink-muted">
                    {seller?.businessAddress?.city || 'Delhi APMC Mandi'}, {seller?.businessAddress?.state || 'Delhi'}
                  </span>
                </div>
              </div>
              <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-200">
                Verified Wholesaler
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-surface-border text-ink-secondary">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span>{deliverySettings.operatingHours || '8:00 AM - 9:00 PM'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>COD & Direct Pickup Allowed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
