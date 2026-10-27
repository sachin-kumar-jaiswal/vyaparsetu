import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from '../components/common/ProtectedRoute';

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
      {/* ── Public routes ─────────────────────────────────────────── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<CatalogPage />} />
      <Route path="/products/:idOrSlug" element={<ProductDetailPage />} />

      {/* ── Authenticated routes (any logged-in role) ─────────────── */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-confirmation"
        element={
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/addresses"
        element={
          <ProtectedRoute>
            <AddressesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bulk-inquiries"
        element={
          <ProtectedRoute>
            <BulkInquiriesPage />
          </ProtectedRoute>
        }
      />

      {/* ── Wholesaler routes (WHOLESALER role, approval required) ─── */}
      <Route
        path="/wholesaler/onboarding"
        element={
          <ProtectedRoute requiredRoles={['WHOLESALER']}>
            <WholesalerOnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wholesaler/dashboard"
        element={
          <ProtectedRoute requiredRoles={['WHOLESALER']} requireApproval>
            <WholesalerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ── Retailer routes (RETAILER role, approval required) ─────── */}
      <Route
        path="/retailer/dashboard"
        element={
          <ProtectedRoute requiredRoles={['RETAILER']} requireApproval>
            <RetailerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ── Admin routes (SUPER_ADMIN role only) ───────────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
