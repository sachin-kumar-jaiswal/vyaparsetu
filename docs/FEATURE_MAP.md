# VyaparSetu — Feature Map & Source File Reference

This document maps all features, UI components, API routes, models, and services to their exact file paths.

---

## 1. Authentication & Session Management
* **Frontend**:
  * Context: `client/src/context/AuthContext.jsx` (Login, Register, Logout, Restore Session, 1-Click Demo Logins)
  * UI Component: `client/src/components/common/AuthModal.jsx`
* **Backend**:
  * Controller: `server/src/modules/auth/authController.js`
  * Routes: `server/src/modules/auth/authRoutes.js` (`POST /register`, `POST /login`, `GET /me`, `POST /logout`)
  * Middleware: `server/src/middleware/auth.js` (`protect`, `requireApproval`)
  * Model: `server/src/modules/users/User.js`
  * CLI Tool: `server/src/utils/bootstrapAdmin.js`

---

## 2. Storefront, Catalogue & Shopping Usability
* **Frontend**:
  * Home Page: `client/src/features/customer/HomePage.jsx`
  * Product Listing / Search / Filters: `client/src/features/catalog/CatalogPage.jsx`
  * Product Detail Page: `client/src/features/catalog/ProductDetailPage.jsx`
  * Product Card: `client/src/components/common/ProductCard.jsx`
  * PIN Code Selector: `client/src/components/common/PincodeModal.jsx`
* **Backend**:
  * Product Controller: `server/src/modules/products/productController.js`
  * Product Routes: `server/src/modules/products/productRoutes.js` (`GET /`, `GET /:idOrSlug`)
  * Category Controller: `server/src/modules/categories/categoryController.js`
  * Category Routes: `server/src/modules/categories/categoryRoutes.js` (`GET /`)
  * Models: `server/src/modules/products/Product.js`, `server/src/modules/categories/Category.js`
  * Media Assets: `client/public/images/products/`, `client/public/images/categories/`

---

## 3. Cart & Multi-Seller Checkout
* **Frontend**:
  * Cart Context: `client/src/context/CartContext.jsx`
  * Cart Page: `client/src/features/cart/CartPage.jsx`
  * Multi-Seller Checkout Page: `client/src/features/cart/CheckoutPage.jsx`
  * Order Confirmation Page: `client/src/features/orders/OrderConfirmationPage.jsx`
* **Backend**:
  * Checkout Engine: `server/src/modules/orders/orderService.js` (`processCheckout`)
  * Order Controller: `server/src/modules/orders/orderController.js` (`checkout`)
  * Order Routes: `server/src/modules/orders/orderRoutes.js` (`POST /checkout`)
  * Model: `server/src/modules/orders/Order.js`

---

## 4. Wholesaler Onboarding & Inventory Operations
* **Frontend**:
  * 6-Step Onboarding Wizard: `client/src/features/wholesaler/WholesalerOnboardingPage.jsx`
  * Wholesaler Dashboard: `client/src/features/wholesaler/WholesalerDashboardPage.jsx`
* **Backend**:
  * Seller Controller: `server/src/modules/sellers/sellerController.js`
  * Seller Routes: `server/src/modules/sellers/sellerRoutes.js`
  * Model: `server/src/modules/sellers/SellerProfile.js`

---

## 5. Retailer Kirana Portal
* **Frontend**:
  * Retailer Hub: `client/src/features/retailer/RetailerDashboardPage.jsx`
* **Backend**:
  * Handled via `server/src/modules/products/` with wholesale price tiers and `RETAILER` role verification.

---

## 6. Bulk Purchase Inquiries & Quotation Workflow
* **Frontend**:
  * Bulk Inquiries & Quote Manager: `client/src/features/bulk-requests/BulkInquiriesPage.jsx`
* **Backend**:
  * Controller: `server/src/modules/bulk-requests/bulkRequestController.js`
  * Routes: `server/src/modules/bulk-requests/bulkRequestRoutes.js`
  * Model: `server/src/modules/bulk-requests/BulkInquiry.js`

---

## 7. Super Admin Marketplace Oversight
* **Frontend**:
  * Admin Dashboard: `client/src/features/admin/AdminDashboardPage.jsx`
* **Backend**:
  * Controller: `server/src/modules/admin/adminController.js`
  * Routes: `server/src/modules/admin/adminRoutes.js`
