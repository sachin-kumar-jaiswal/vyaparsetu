import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building,
  Store,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const CartPage = () => {
  const { sellerGroups, totalItemsCount, totalSubtotal, updateQuantity, removeItem, clearCart, pincode } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (sellerGroups.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto shadow-subtle">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-ink-dark">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
          Explore our wide range of groceries, staples, and event supplies directly from verified wholesalers.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-card"
        >
          Explore Catalogue <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-dark">Shopping Cart</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} across {sellerGroups.length} independent {sellerGroups.length === 1 ? 'seller' : 'sellers'}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 p-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Seller-Wise Cart Groups (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {sellerGroups.map((group) => (
            <div
              key={group.sellerId}
              className="bg-surface-pure rounded-3xl border border-surface-border p-5 sm:p-6 shadow-subtle space-y-4"
            >
              {/* Seller Header */}
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-ink-dark">{group.sellerBusinessName}</h3>
                    <span className="text-[11px] text-brand-600 font-semibold flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Seller-managed dispatch to PIN {pincode}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-xs text-ink-secondary">
                  Subtotal: ₹{group.subtotal}
                </span>
              </div>

              {/* Items in this seller group */}
              <div className="divide-y divide-surface-border">
                {group.items.map((item) => (
                  <div key={item.productId} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product.images?.[0] || '/images/products/placeholder.svg'}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl bg-surface-warm p-1 object-contain shrink-0 border border-surface-border"
                      />
                      <div className="min-w-0">
                        <Link to={`/products/${item.product.slug}`} className="font-bold text-xs sm:text-sm text-ink-dark hover:text-brand-600 truncate block">
                          {item.product.name}
                        </Link>
                        <span className="text-[11px] text-ink-muted block mt-0.5">
                          {item.product.packSizeUnit} • ₹{item.effectivePrice} / unit
                        </span>
                        {item.quantity >= item.product.minWholesaleQty && (
                          <span className="text-[10px] font-bold text-accent-gold bg-accent-light px-1.5 py-0.2 rounded inline-block mt-0.5">
                            Wholesale Tier Applied
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Stepper */}
                      <div className="flex items-center border border-surface-border rounded-lg bg-surface-warm p-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 hover:bg-surface-pure rounded text-ink-dark transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-xs px-2.5 text-center min-w-[24px]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:bg-surface-pure rounded text-ink-dark transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-extrabold text-sm text-ink-dark min-w-[60px] text-right">
                        ₹{item.itemSubtotal}
                      </span>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-ink-muted hover:text-red-600 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary & Checkout Action (4 cols) */}
        <div className="lg:col-span-4 bg-surface-pure rounded-3xl border border-surface-border p-6 shadow-card space-y-5 sticky top-28">
          <h3 className="font-extrabold text-base text-ink-dark pb-3 border-b border-surface-border">
            Order Price Summary
          </h3>

          <div className="space-y-2.5 text-xs text-ink-secondary">
            <div className="flex items-center justify-between">
              <span>Items Total ({totalItemsCount} units)</span>
              <span className="font-bold text-ink-dark">₹{totalSubtotal}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Sellers to Dispatch</span>
              <span className="font-semibold text-ink-dark">{sellerGroups.length} independent orders</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Estimated Delivery</span>
              <span className="text-emerald-700 font-bold">Calculated at Checkout per seller</span>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-between">
            <div>
              <span className="text-xs text-ink-muted block font-semibold">Subtotal</span>
              <span className="text-2xl font-black text-ink-dark">₹{totalSubtotal}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm rounded-xl transition shadow-card flex items-center justify-center gap-2"
          >
            <span>Proceed to Multi-Seller Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200/50 text-[11px] text-brand-800 space-y-1">
            <span className="font-bold block">✨ Multi-Seller Safety Guarantee</span>
            <span>
              Each seller independently fulfils your items, validates stock, and handles Cash on Delivery or UPI payments without platform commission.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
