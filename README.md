# VyaparSetu — Indian B2B2C Marketplace

> **Ek Platform. Har Vyapar.**  
> A complete, production-ready MERN marketplace connecting wholesalers, retailers, and individual customers with transparent tier pricing, bulk event purchasing, and seller-managed dispatch.

![VyaparSetu Logo](client/public/images/branding/logo-full.svg)

---

## 1. Product Vision & Architecture

VyaparSetu provides an authentic Indian commerce ecosystem combining fast online grocery shopping with commercial wholesale procurement:

1. **Customers**: Browse and purchase daily dairy, groceries, fruits, vegetables, snacks, and household essentials.
2. **Retailers (Kirana Stores)**: Procure goods at discounted wholesale tier rates with minimum order quantities (MOQ).
3. **Wholesalers**: Complete a 6-step business onboarding wizard (GSTIN, FSSAI, Mandi address, PIN coverage, delivery fee), manage catalogue inventory, configure volume tiers, and process incoming orders.
4. **Super Admin**: Review and approve/reject seller and retailer applications, oversee marketplace orders, and arbitrate dispute returns.

---

## 2. Technology Stack

* **Frontend**: React 18, Vite 6, Tailwind CSS, React Router 6, Axios, Lucide React icons.
* **Backend**: Node.js, Express.js, MongoDB / Mongoose, JWT authentication, bcryptjs, Helmet, Morgan.
* **Catalogue Assets**: Over 75 local vector product illustrations and category graphics stored under `client/public/images/`.
* **Testing**: Node.js native test runner (`node:test` + `node:assert`) and Supertest.

---

## 3. Quick Start & Local Setup

### Prerequisites
* Node.js v18+ (tested on Node v24.19)
* MongoDB running locally or a MongoDB Atlas connection string

### Step 1: Install Dependencies
From the project root:
```bash
npm run install:all
```

### Step 2: Configure Environment Variables
Verify or adjust `.env` files:

* **Backend (`server/.env`)**:
  ```env
  PORT=5000
  NODE_ENV=development
  MONGODB_URI=mongodb://127.0.0.1:27017/vyaparsetu?directConnection=true
  JWT_SECRET=vyaparsetu_super_secret_jwt_key_2026_dev_env
  JWT_EXPIRES_IN=7d
  FRONTEND_URL=http://localhost:5173
  ADMIN_EMAIL=admin@vyaparsetu.in
  ADMIN_PASSWORD=AdminSecure@2026
  ```

* **Frontend (`client/.env`)**:
  ```env
  VITE_API_URL=http://localhost:5000/api/v1
  ```

### Step 3: Seed Demonstration Accounts & Catalogue
Run the idempotent seed scripts:
```bash
# 1. Seed demo users (Super Admin, Approved Wholesaler, Pending Wholesaler, Retailers, Customer)
npm run seed:demo

# 2. Seed 79 distinct Indian grocery products & 10 categories with local graphics
npm run seed:catalog
```

### Step 4: Run the Application
Start both the API backend (port 5000) and Vite frontend (port 5173) concurrently:
```bash
npm run dev
```

Open your browser at:
👉 **`http://localhost:5173`**

---

## 4. Demo Evaluation Accounts

You can test all four user roles using the **1-Click Demo Login bar** inside the sign-in modal, or log in manually with these credentials:

| Role | Email | Password | Pre-configured Business / Privileges |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@vyaparsetu.in` | `AdminSecure@2026` | Platform moderation, approvals & order oversight |
| **Wholesaler (Approved)** | `wholesaler@vyaparsetu.in` | `SellerSecure@2026` | Bharat Wholesale Bazaar Pvt Ltd (Azadpur Mandi) |
| **Wholesaler (Pending)** | `pending.seller@vyaparsetu.in` | `SellerSecure@2026` | Shree Ganesh Traders (Awaiting verification) |
| **Retailer (Approved)** | `retailer@vyaparsetu.in` | `RetailerSecure@2026` | Joshi Kirana Mart (Wholesale tier rates enabled) |
| **Retailer (Pending)** | `pending.retailer@vyaparsetu.in` | `RetailerSecure@2026` | Sharma Superstore (Awaiting verification) |
| **Customer** | `customer@vyaparsetu.in` | `CustomerSecure@2026` | Verified Delhi buyer with saved default address |

---

## 5. Automated Tests

Run the test suite to verify health, authentication boundaries, role permissions, and multi-seller calculations:
```bash
npm test
```

Test Results:
* `GET /api/health` — Healthy status & database connectivity
* `GET /api/v1/categories` — 10 active categories
* `GET /api/v1/products` — 79 verified products
* `POST /api/v1/auth/register` — Super Admin public registration strictly rejected (403)
* `POST /api/v1/auth/login` — Customer login & JWT issuance
* `POST /api/v1/auth/login` — Wholesaler login & business profile attachment
* `GET /api/v1/sellers/dashboard-stats` — Unapproved sellers blocked (403)
* `GET /api/v1/sellers/dashboard-stats` — Approved sellers permitted (200)
* `GET /api/v1/admin/overview` — Super Admin overview metrics verified

---

## 6. Multi-Seller Checkout & Payment Model

VyaparSetu features a transparent, direct seller-managed payment model:
* **Cash on Delivery (COD)**: Order created as `PENDING_VERIFICATION`, collected upon delivery by the seller.
* **Manual UPI QR**: Order renders the seller's specific UPI ID and a generated payment link. The customer submits their 12-digit UTR reference number for seller verification.
* **Mandi / Warehouse Pickup**: Customer collects order directly from the seller's dispatch facility.
* **PIN Code Coverage Enforcement**: Each seller's order verifies if the destination PIN code is in `serviceablePincodes`.

---

## 7. Production Deployment Guide

### A. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a dedicated database user. Allow the Render service's outbound IP addresses in Atlas Network Access where possible; `0.0.0.0/0` is a less restrictive fallback.
3. Obtain your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/vyaparsetu`.

### B. Backend API (Render)
1. Create a new **Web Service** on Render connected to your Git repository.
2. To use the included `render.yaml`, create a **Blueprint** from the repository. For a manually configured web service:
   * Root Directory: leave blank (repository root)
   * Build Command: `npm ci --prefix server`
   * Start Command: `npm --prefix server start`
   * Health Check Path: `/api/health`
3. Set these environment variables (the value of `MONGODB_URI` must be only the URI, with no `MONGODB_URI=` prefix):
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: `<Your MongoDB Atlas URI>`
   * `JWT_SECRET`: `<A strong random secret>` (generated automatically by the Blueprint)
   * `FRONTEND_URL`: `<Your Vercel frontend origin, without a trailing slash>`
4. In MongoDB Atlas, add the Render service's outbound IP addresses to Network Access, or use `0.0.0.0/0` if the deployment requires broad access. Use a dedicated database user with a strong password.
5. From the repository root in Render Shell, run the seed commands:
   ```bash
   npm run seed:demo
   npm run seed:catalog
   ```
   Keep administrator credentials private and change any demo credentials before production use.

### C. Frontend Web Client (Vercel)
1. Import your Git repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Root Directory: `client`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   * `VITE_API_URL`: `https://<your-render-service>.onrender.com/api/v1`
7. After the first deployment, set Render's `FRONTEND_URL` to the exact Vercel production origin, then redeploy the Render service. Redeploy Vercel after changing `VITE_API_URL`.

---

## 8. Documentation Index

Detailed architectural and developer specifications:
* [Architecture Guide](docs/ARCHITECTURE.md)
* [Feature Map](docs/FEATURE_MAP.md)
* [Database Schema](docs/DATABASE_SCHEMA.md)
* [API Endpoint Reference](docs/API.md)
* [Development Rules](docs/DEVELOPMENT_RULES.md)

---

## 9. License

ISC © 2026 VyaparSetu Engineering Team.
