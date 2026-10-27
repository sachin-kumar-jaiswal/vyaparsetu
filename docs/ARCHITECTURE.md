# VyaparSetu — System Architecture & Technical Specifications

> **Brand**: VyaparSetu  
> **Tagline**: *Ek Platform. Har Vyapar.*  
> **Business Model**: Indian B2B2C Marketplace connecting Wholesalers, Retailers, and Direct Customers.

---

## 1. High-Level Architectural Overview

VyaparSetu follows a decoupled MERN architecture (React + Node.js/Express + MongoDB) structured around a feature-based modular design. The platform enables multi-seller operations without intermediary commission or forced payment gateway lockdowns.

```
                           +--------------------------------+
                           |   VyaparSetu Web Client (SPA)  |
                           |   React 18, Vite, Tailwind CSS |
                           +---------------+----------------+
                                           |
                                  HTTPS / JSON API
                                           |
                           +---------------v----------------+
                           |  Express.js API Gateway / App  |
                           |  (Helmet, CORS, JWT, Logging)  |
                           +---------------+----------------+
                                           |
        +------------------+---------------+------------------+------------------+
        |                  |               |                  |                  |
+-------v--------+ +-------v-------+ +-----v------+ +---------v--------+ +-------v--------+
|  Auth & Users  | |    Sellers    | |  Products  | |  Multi-Seller    | | Bulk Inquiries |
|  JWT & Roles   | |  Onboarding   | |  Inventory | |    Checkout      | | & Quotations   |
+-------+--------+ +-------+-------+ +-----+------+ +---------+--------+ +-------+--------+
        |                  |               |                  |                  |
        +------------------+---------------+------------------+------------------+
                                           |
                           +---------------v----------------+
                           |        MongoDB Database        |
                           |  (Mongoose Models & Indexes)   |
                           +--------------------------------+
```

---

## 2. Four Platform Roles & Authorization Matrix

| Role | Description | Access Boundaries & Permissions |
| :--- | :--- | :--- |
| **CUSTOMER** | Daily grocery shopper | Public browsing, retail price cart, multi-seller checkout, saved addresses, order tracking, issue reporting, bulk quote requests. |
| **RETAILER** | Kirana store owner / reseller | Dedicated retailer portal, wholesale tier pricing (MOQ enforced), commercial pack purchasing, bulk event inquiries. Requires approval. |
| **WHOLESALER** | Master distributor / mandi seller | 6-Step Onboarding Wizard, inventory management (tier pricing, MOQ, stock toggles), incoming order dispatch & payment verification, quote submission. Requires approval. |
| **SUPER_ADMIN** | Marketplace administrator | Seller application approval/rejection, retailer vetting, catalogue moderation, dispute arbitration, platform statistics. Bootstrapped via CLI. |

---

## 3. Multi-Seller Checkout & Safe Inventory Engine

Unlike single-vendor stores, carts can contain products from multiple independent wholesalers. VyaparSetu executes safe multi-seller checkout:

1. **Server-Side Validation**: Product existence, latest price, and real-time stock are fetched strictly from MongoDB. Browser-submitted prices are ignored.
2. **Wholesale Margin Calculation**: If the buyer is an approved retailer or quantity qualifies for quantity tiers, wholesale price applies automatically.
3. **PIN Code Serviceability Gate**: For each seller with `DELIVERY` selected, the destination PIN code is validated against `serviceablePincodes`. If outside coverage, checkout warns the buyer to switch to `PICKUP` or adjust items.
4. **Independent Seller Orders**: Distinct Order records (`VS-YYYY-XXXXXX`) are generated for each seller with price snapshots, delivery fee calculation, and payment terms.
5. **Atomic Stock Decrement & Rollback**: Uses `Product.findOneAndUpdate({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`. If any item fails during the batch, all prior decrements and order records are rolled back.

---

## 4. Payment Architecture

VyaparSetu operates an authentic, genuinely usable seller-managed payment model:
* **Cash on Delivery (COD)**: Order created as `PENDING_VERIFICATION`, payment collected upon doorstep arrival by seller's courier.
* **Manual UPI QR**: Seller's configured UPI ID is rendered with an interactive QR payload (`upi://pay?pa=...`). The buyer submits their 12-digit UTR reference number, which the seller verifies from their banking dashboard.
* **Warehouse Pickup**: Buyer collects order directly from the APMC mandi or warehouse facility and settles payment directly with the seller.

---

## 5. Deployment Topology

* **Frontend**: Vercel (or Netlify) statically hosting the Vite production bundle (`dist/`), proxied to the backend via `VITE_API_URL`.
* **Backend**: Render (or Railway) running `node src/server.js` with health checks mounted on `/api/health`.
* **Database**: MongoDB Atlas cloud cluster with replica sets or local MongoDB instance with `?directConnection=true`.
* **Media**: Locally stored SVG vector photographs with optional Cloudinary CDN upload path for persistent seller uploads.
