# VyaparSetu — Database Schema & Data Models

All entities are implemented as validated Mongoose models backed by MongoDB.

---

## 1. User (`users` collection)
Stores authentication credentials, contact details, account status, and role definitions.

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Full user name (trimmed, max 100) |
| `email` | String | Unique lowercase email address |
| `password` | String | bcrypt hashed password (select: false) |
| `phone` | String | Indian mobile number |
| `role` | String | `CUSTOMER`, `RETAILER`, `WHOLESALER`, `SUPER_ADMIN` |
| `status` | String | `ACTIVE`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| `isApproved`| Boolean | True for active customers/admins and approved sellers/retailers |
| `rejectionReason` | String | Admin notes if application was declined |

---

## 2. SellerProfile (`sellerprofiles` collection)
Stores the business constitution, verification registrations, addresses, and delivery settings populated during the 6-step Onboarding Wizard.

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | ObjectId | Reference to `User` |
| `businessName` | String | Legal trading name |
| `businessType` | String | `PROPRIETORSHIP`, `PARTNERSHIP`, `PVT_LTD`, `LLP`, `TRADER` |
| `businessCategory` | String | Category of trade (e.g. FMCG Wholesale) |
| `yearsInBusiness` | Number | Years of operation |
| `gstin` | String | 15-digit GST identification number |
| `tradeLicense` | String | Municipal or Mandi trade certificate |
| `fssaiLicense` | String | 14-digit food safety license |
| `verificationStatus` | String | `PENDING`, `VERIFIED`, `REJECTED` |
| `businessAddress` | Subdoc | Registered office address (houseNo, street, city, state, pincode) |
| `dispatchAddress` | Subdoc | Warehouse/Mandi unit where orders are packaged |
| `deliverySettings` | Subdoc | `serviceablePincodes: [String]`, `deliveryFee`, `freeDeliveryThreshold`, `minOrderValue`, `codAvailable`, `upiId` |

---

## 3. Product (`products` collection)
Holds product specifications, inventory, wholesale MOQs, and volume price tiers.

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Product title |
| `slug` | String | Unique lowercase URL slug |
| `category` | String | Category title |
| `categorySlug` | String | Lowercase category key |
| `brand` | String | Manufacturer or brand name |
| `packSizeUnit` | String | Pack unit (e.g. "500 ml", "1 kg", "Pack of 6") |
| `images` | [String] | Array of image URLs or local SVG paths |
| `retailPrice` | Number | Consumer selling price |
| `wholesalePrice` | Number | Discounted wholesale base price |
| `minWholesaleQty` | Number | Minimum order quantity for wholesale rate (default 5) |
| `stock` | Number | Real-time available units in warehouse |
| `sellerId` | ObjectId | Reference to `User` (the wholesaler) |
| `sellerBusinessName` | String | Redundant seller name snapshot for performance |
| `status` | String | `ACTIVE`, `INACTIVE` |
| `quantityTiers` | Array | `[{ minQty, maxQty, pricePerUnit }]` volume discounts |

---

## 4. Order (`orders` collection)
Created independently per seller upon checkout. Stores frozen address snapshots and trusted price calculations.

| Field | Type | Description |
| :--- | :--- | :--- |
| `orderNumber` | String | Unique reference (e.g. `VS-2026-XXXXXX`) |
| `buyerId` | ObjectId | Reference to `User` |
| `buyerRole` | String | `CUSTOMER` or `RETAILER` |
| `sellerId` | ObjectId | Reference to `User` |
| `sellerBusinessName` | String | Seller name at time of order |
| `items` | Array | Frozen items: `productId`, `name`, `packSizeUnit`, `image`, `quantity`, `unitPrice`, `subtotal`, `isWholesaleTier` |
| `subtotal` | Number | Sum of item totals |
| `deliveryFee` | Number | Delivery charge based on seller settings |
| `grandTotal` | Number | Final payable amount |
| `fulfilmentMethod` | String | `DELIVERY` or `PICKUP` |
| `deliveryAddress` | Subdoc | Frozen address snapshot (recipientName, phone, houseNo, street, pincode) |
| `paymentMethod` | String | `COD`, `MANUAL_UPI`, `DIRECT_PICKUP` |
| `paymentStatus` | String | `PENDING_VERIFICATION`, `PAID`, `CANCELLED`, `REFUNDED_MANUAL` |
| `paymentDetails` | Subdoc | `sellerUpiId`, `utrReference`, `submittedAt`, `verifiedAt`, `verifiedBy` |
| `orderStatus` | String | `PENDING`, `CONFIRMED`, `PROCESSING`, `READY_FOR_DISPATCH`, `OUT_FOR_DELIVERY`, `DELIVERED`, `READY_FOR_PICKUP`, `COLLECTED`, `CANCELLED` |
| `cancellation` | Subdoc | `isRequested`, `reason`, `status: NONE/REQUESTED/APPROVED/REJECTED`, `responseNote` |
| `returnIssue` | Subdoc | `isReported`, `issueType`, `description`, `status: PENDING_REVIEW/RESOLVED/REJECTED` |
| `statusHistory` | Array | Audit trail of timestamped status transitions |

---

## 5. BulkInquiry (`bulkinquiries` collection)
Manages event supply requests and quotation negotiations.

| Field | Type | Description |
| :--- | :--- | :--- |
| `inquiryNumber` | String | Unique ID (`INQ-YYYY-XXXXX`) |
| `requesterId` | ObjectId | Reference to `User` |
| `productOrCategory`| String | Description of goods needed |
| `requestedQty` | Number | Total units required |
| `requiredDate` | Date | Target delivery date |
| `deliveryPincode` | String | Destination PIN |
| `deliveryAddressText` | String | Venue address |
| `budget` | Number | Stated budget |
| `status` | String | `SUBMITTED`, `QUOTED`, `ACCEPTED`, `REJECTED`, `COMPLETED` |
| `quotes` | Array | `[{ quotationId, sellerId, sellerBusinessName, proposedQty, unitPrice, totalPrice, deliveryFee, estimatedDays, quotationNotes, status }]` |
| `resultingOrderId` | ObjectId | Reference to `Order` created upon acceptance |
