# VyaparSetu — Development & Engineering Rules

To ensure maintainability, modularity, and high velocity, all contributors and coding agents must strictly adhere to these engineering principles.

---

## 1. The Minimum-Change Rule
When implementing a new feature or resolving a defect:
1. Locate the affected domain module using `docs/FEATURE_MAP.md`.
2. Inspect only the affected files and their immediate dependencies.
3. Understand the existing data flow before editing.
4. Modify only the lines and files strictly required.
5. Preserve unrelated working features and existing docstrings/comments.
6. Never rewrite entire modules without a documented architectural reason.
7. Update `docs/` documentation whenever an important contract or schema changes.

---

## 2. Server Authority & Zero Trust Client
* **Never Trust Browser Totals**: All product unit prices, quantity-tier discounts, and delivery fees must be calculated strictly on the backend during checkout.
* **Never Trust Submitted Roles or Permissions**: Role-based access control (`SUPER_ADMIN`, `WHOLESALER`, `RETAILER`) is enforced at the Express middleware layer (`server/src/middleware/auth.js` and `roles.js`).
* **Owner Isolation**: Wholesalers can only edit, toggle, or view products and incoming orders assigned to their own `sellerId`.
* **Super Admin Bootstrap Rule**: Public user registration as `SUPER_ADMIN` is prohibited. The initial administrator is provisioned solely via environment variables through `node src/utils/bootstrapAdmin.js`.

---

## 3. Atomic Multi-Seller Checkout & Safe Stock
* Every checkout batch must safely decrement stock atomically (`$inc: { stock: -qty }` where `stock: { $gte: qty }`).
* In the event of any failure during multi-seller order batching, all decremented stock and created orders in that batch must be systematically rolled back.
* Historical product prices and delivery addresses must be frozen as immutable subdocument snapshots in the `Order` record so subsequent edits to products or addresses never alter past orders.

---

## 4. UI/UX Design System Rules
* Adhere strictly to the Indian commerce brand palette:
  * Forest Green (`#176B45`) as primary brand accent
  * Soft warm neutral background (`#F8F8F3`)
  * Readable dark typography (`#202820`)
  * Restrained saffron / warm gold (`#F1B84B`)
* Never use broken or external placeholder images that can fail over time.
* Ensure responsive layouts across mobile, tablet, and desktop viewports.
* Provide clear feedback states: loading spinners, validation warnings, empty states, and toast notifications.
