import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../features/customer/HomePage';
import CatalogPage from '../features/catalog/CatalogPage';
import ProductDetailPage from '../features/catalog/ProductDetailPage';
import CartPage from '../features/cart/CartPage';
import CheckoutPage from '../features/cart/CheckoutPage';
import OrderConfirmationPage from '../features/orders/OrderConfirmationPage';
import MyOrdersPage from '../features/orders/MyOrdersPage';
import AddressesPage from '../features/addresses/AddressesPage';
import WholesalerOnboardingPage from '../features/wholesaler/WholesalerOnboardingPage';
import WholesalerDashboardPage from '../features/wholesaler/WholesalerDashboardPage';
import RetailerDashboardPage from '../features/retailer/RetailerDashboardPage';
import BulkInquiriesPage from '../features/bulk-requests/BulkInquiriesPage';
import AdminDashboardPage from '../features/admin/AdminDashboardPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<CatalogPage />} />
      <Route path="/products/:idOrSlug" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
      <Route path="/my-orders" element={<MyOrdersPage />} />
      <Route path="/addresses" element={<AddressesPage />} />
      <Route path="/wholesaler/onboarding" element={<WholesalerOnboardingPage />} />
      <Route path="/wholesaler/dashboard" element={<WholesalerDashboardPage />} />
      <Route path="/retailer/dashboard" element={<RetailerDashboardPage />} />
      <Route path="/bulk-inquiries" element={<BulkInquiriesPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
