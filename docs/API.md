# VyaparSetu — API Documentation

Base URL: `/api/v1`

---

## 1. System Health
* `GET /api/health`
  * Public health endpoint. Returns service name, uptime, timestamp, and MongoDB connection status.

---

## 2. Authentication (`/api/v1/auth`)
* `POST /register`: Register as `CUSTOMER`, `RETAILER`, or `WHOLESALER`. Public registration as `SUPER_ADMIN` is strictly forbidden (403).
* `POST /login`: Log in with email and password. Returns JWT token, user object, and seller profile.
* `GET /me`: Restores current user session and permissions from JWT.
* `POST /logout`: Invalidates client session.

---

## 3. Wholesaler Onboarding & Profile (`/api/v1/sellers`)
* `GET /profile/:id`: Public profile for buyers (business name, category, dispatch city, delivery settings).
* `GET /onboarding/status`: (Auth: Wholesaler) Retrieves current onboarding step and draft profile.
* `PUT /onboarding/step`: (Auth: Wholesaler) Updates steps 2 through 6 of the Onboarding Wizard.
* `GET /my-profile`: (Auth: Wholesaler) Fetches full seller profile.
* `PUT /my-profile`: (Auth: Wholesaler) Updates business details, addresses, and delivery settings.
* `GET /dashboard-stats`: (Auth: Approved Wholesaler) Returns real-time metrics (active products, low stock, pending orders, total sales).

---

## 4. Addresses (`/api/v1/addresses`)
* `GET /`: (Auth) List user's saved addresses.
* `POST /`: (Auth) Create a new address with Indian 6-digit PIN code.
* `PUT /:id`: (Auth) Update an address.
* `DELETE /:id`: (Auth) Delete an address.
* `PUT /:id/set-default`: (Auth) Set as default delivery location.

---

## 5. Products & Catalogue (`/api/v1/products`)
* `GET /`: Public catalogue query with filters (`search`, `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`, `limit`).
* `GET /:idOrSlug`: Product detail view with volume quantity tiers and seller delivery preview.
* `GET /seller/my-products`: (Auth: Approved Wholesaler) Returns products owned by the authenticated seller.
* `POST /`: (Auth: Approved Wholesaler) List a new product with retail price, wholesale price, stock, and tiers.
* `PUT /:id`: (Auth: Wholesaler/Admin) Edit owned product. Never allows editing another seller's products.
* `PATCH /:id/toggle-status`: (Auth: Wholesaler/Admin) Toggle between `ACTIVE` and `INACTIVE`.
* `PATCH /:id/stock`: (Auth: Wholesaler/Admin) Quick inventory stock adjustment.

---

## 6. Multi-Seller Checkout & Orders (`/api/v1/orders`)
* `POST /checkout`: (Auth) Executes multi-seller checkout engine:
  * Groups cart items by seller
  * Validates stock and calculates tier pricing strictly on backend
  * Enforces seller-specific PIN code coverage for delivery
  * Creates independent order records per seller
* `GET /my-orders`: (Auth) Buyer's order history with pagination and status filters.
* `GET /:id`: (Auth) View order details (accessible by buyer, seller, or super admin).
* `GET /seller/incoming`: (Auth: Approved Wholesaler) Orders assigned to the seller.
* `PATCH /:id/status`: (Auth: Wholesaler/Admin) Update status along permitted transition flow (`CONFIRMED`, `PROCESSING`, `READY_FOR_DISPATCH`, `OUT_FOR_DELIVERY`, `DELIVERED`, `READY_FOR_PICKUP`, `COLLECTED`, `CANCELLED`).
* `POST /:id/submit-utr`: (Auth: Buyer) Submit 12-digit UPI transaction reference number.
* `PATCH /:id/verify-payment`: (Auth: Wholesaler/Admin) Mark manual payment as verified.
* `POST /:id/cancellation-request`: (Auth: Buyer) Request cancellation with reason.
* `PATCH /:id/cancellation-response`: (Auth: Wholesaler/Admin) Approve or decline cancellation request.
* `POST /:id/return-issue`: (Auth: Buyer) Report damaged, missing, or incorrect goods on delivered orders.

---

## 7. Bulk Purchase Inquiries & Quotes (`/api/v1/bulk-requests`)
* `POST /`: (Auth) Submit custom bulk requirements for weddings, events, or banquets.
* `GET /my-inquiries`: (Auth) Buyer's submitted inquiries.
* `GET /market`: (Auth: Wholesaler/Admin) Open market requests available for quotations.
* `POST /:id/quote`: (Auth: Wholesaler/Admin) Submit custom quotation with proposed quantity, unit rate, and delivery charge.
* `POST /:id/accept-quote`: (Auth: Buyer) Accept quotation, generating an automatic verified Order.

---

## 8. Super Admin Governance (`/api/v1/admin`)
* `GET /overview`: Platform-wide metrics and user breakdowns.
* `GET /sellers`: List all registered wholesalers with profile data.
* `PATCH /sellers/:id/approve`: Approve wholesaler application.
* `PATCH /sellers/:id/reject`: Reject wholesaler application with stated reason.
* `GET /retailers`: List retailer applications.
* `PATCH /retailers/:id/approve`: Grant wholesale tier purchasing permissions.
* `PATCH /retailers/:id/reject`: Decline retailer application.
* `PATCH /users/:id/toggle-status`: Suspend or activate accounts. Guarded against suspending last active admin.
* `GET /orders`: Oversight of all orders across marketplace.
* `GET /issues`: Review customer reported return/quality issues.
