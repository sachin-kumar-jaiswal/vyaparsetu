import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pincode, setPincode] = useState(() => {
    return localStorage.getItem('vs_pincode') || '110001';
  });

  useEffect(() => {
    localStorage.setItem('vs_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('vs_pincode', pincode);
  }, [pincode]);

  // Helper to calculate applicable unit price for an item
  const getEffectivePrice = (product, quantity) => {
    let unitPrice = product.retailPrice;

    // Check retailer role & MOQ
    if (user?.role === 'RETAILER' && quantity >= product.minWholesaleQty) {
      unitPrice = product.wholesalePrice;
    }

    // Check custom quantity tiers
    if (Array.isArray(product.quantityTiers) && product.quantityTiers.length > 0) {
      for (const tier of product.quantityTiers) {
        if (quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty)) {
          unitPrice = tier.pricePerUnit;
          break;
        }
      }
    }

    return unitPrice;
  };

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === product._id);
      if (existingIndex >= 0) {
        const next = [...prev];
        const newQty = Math.min(product.stock, next[existingIndex].quantity + quantity);
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          product,
        };
        return next;
      } else {
        const initialQty = Math.min(product.stock, Math.max(1, quantity));
        return [
          ...prev,
          {
            productId: product._id,
            product,
            quantity: initialQty,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    setItems((prev) => {
      if (newQuantity <= 0) {
        return prev.filter((i) => i.productId !== productId);
      }
      return prev.map((item) => {
        if (item.productId === productId) {
          const clamped = Math.min(item.product.stock, newQuantity);
          return { ...item, quantity: clamped };
        }
        return item;
      });
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Group items by seller
  const sellerGroups = items.reduce((groups, item) => {
    const sellerId = item.product.sellerId?._id || item.product.sellerId || 'unknown_seller';
    const sellerName = item.product.sellerBusinessName || 'Verified Wholesaler';

    if (!groups[sellerId]) {
      groups[sellerId] = {
        sellerId,
        sellerBusinessName: sellerName,
        items: [],
        subtotal: 0,
      };
    }

    const effectivePrice = getEffectivePrice(item.product, item.quantity);
    const itemSubtotal = effectivePrice * item.quantity;

    groups[sellerId].items.push({
      ...item,
      effectivePrice,
      itemSubtotal,
    });
    groups[sellerId].subtotal += itemSubtotal;

    return groups;
  }, {});

  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalSubtotal = Object.values(sellerGroups).reduce((sum, g) => sum + g.subtotal, 0);

  const value = {
    items,
    sellerGroups: Object.values(sellerGroups),
    totalItemsCount,
    totalSubtotal,
    pincode,
    setPincode,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getEffectivePrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export default CartContext;
