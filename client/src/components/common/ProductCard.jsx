import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const ProductCard = ({ product }) => {
  const { items, addItem, updateQuantity } = useCart();
  const { user } = useAuth();

  const cartItem = items.find((i) => i.productId === product._id);
  const currentQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;

  // Check if buyer gets wholesale pricing
  const isRetailer = user?.role === 'RETAILER';
  const hasTiers = Array.isArray(product.quantityTiers) && product.quantityTiers.length > 0;
  const lowestWholesalePrice = hasTiers
    ? Math.min(...product.quantityTiers.map((t) => t.pricePerUnit), product.wholesalePrice)
    : product.wholesalePrice;

  return (
    <div className="group bg-surface-pure rounded-2xl border border-surface-border hover:border-brand-300 hover:shadow-card transition duration-200 flex flex-col justify-between overflow-hidden p-3.5 relative">
      <div>
        {/* Product Visual Container */}
        <Link to={`/products/${product.slug}`} className="block relative aspect-square rounded-xl overflow-hidden bg-surface-warm mb-3">
          <img
            src={product.images?.[0] || '/images/products/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          {product.brand && (
            <span className="absolute top-2 left-2 bg-surface-pure/90 backdrop-blur-sm text-ink-secondary text-[10px] font-bold px-2 py-0.5 rounded-md border border-surface-border">
              {product.brand}
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-ink-dark/50 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow">
                Out of Stock
              </span>
            </div>
          )}
        </Link>

        {/* Pack Size & Verification */}
        <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
          <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[11px]">
            {product.packSizeUnit}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-ink-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
            Verified
          </span>
        </div>

        {/* Title */}
        <Link to={`/products/${product.slug}`}>
          <h4 className="font-bold text-sm text-ink-dark line-clamp-2 leading-snug hover:text-brand-600 transition mb-2">
            {product.name}
          </h4>
        </Link>

        {/* Wholesale pricing callout */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-base text-ink-dark">
              ₹{isRetailer ? product.wholesalePrice : product.retailPrice}
            </span>
            {isRetailer ? (
              <span className="text-xs text-ink-muted line-through">
                MRP ₹{product.retailPrice}
              </span>
            ) : (
              lowestWholesalePrice < product.retailPrice && (
                <span className="text-[11px] font-semibold text-accent-gold bg-accent-light px-1.5 py-0.5 rounded">
                  Wholesale: ₹{lowestWholesalePrice}
                </span>
              )
            )}
          </div>
          <span className="text-[10px] text-ink-muted block mt-0.5">
            Min wholesale: {product.minWholesaleQty || 5} packs
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-surface-border flex items-center justify-between">
        <span className="text-[11px] text-ink-muted truncate max-w-[120px]">
          {product.sellerBusinessName?.split(' ')[0] || 'Verified Seller'}
        </span>

        {isOutOfStock ? (
          <button disabled className="px-3 py-1.5 bg-surface-muted text-ink-light rounded-lg text-xs font-semibold">
            Sold Out
          </button>
        ) : currentQty > 0 ? (
          <div className="flex items-center gap-2 bg-brand-50 border border-brand-500 rounded-lg px-2 py-1">
            <button
              onClick={() => updateQuantity(product._id, currentQty - 1)}
              className="text-brand-700 hover:text-brand-900 p-0.5"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-extrabold text-xs text-brand-700 min-w-[16px] text-center">
              {currentQty}
            </span>
            <button
              onClick={() => updateQuantity(product._id, currentQty + 1)}
              className="text-brand-700 hover:text-brand-900 p-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addItem(product, 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-500 text-brand-700 hover:text-white border border-brand-300 font-bold text-xs rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
