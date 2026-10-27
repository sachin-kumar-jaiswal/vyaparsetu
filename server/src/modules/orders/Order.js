import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    packSizeUnit: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '/images/products/placeholder.svg',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    isWholesaleTier: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const deliveryAddressSnapshotSchema = new mongoose.Schema(
  {
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    houseNo: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    addressType: { type: String, default: 'HOME' },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'SYSTEM' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    buyerPhone: {
      type: String,
      required: true,
    },
    buyerRole: {
      type: String,
      enum: ['CUSTOMER', 'RETAILER'],
      default: 'CUSTOMER',
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerBusinessName: {
      type: String,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [v => Array.isArray(v) && v.length > 0, 'Order must contain at least one item'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    fulfilmentMethod: {
      type: String,
      enum: ['DELIVERY', 'PICKUP'],
      default: 'DELIVERY',
      required: true,
    },
    deliveryAddress: {
      type: deliveryAddressSnapshotSchema,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'MANUAL_UPI', 'DIRECT_PICKUP'],
      default: 'COD',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'PAID', 'CANCELLED', 'REFUNDED_MANUAL'],
      default: 'PENDING_VERIFICATION',
      required: true,
    },
    paymentDetails: {
      sellerUpiId: { type: String, default: '' },
      utrReference: { type: String, trim: true, default: '' },
      submittedAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: String, default: null },
      notes: { type: String, default: '' },
    },
    orderStatus: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'READY_FOR_DISPATCH',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'READY_FOR_PICKUP',
        'COLLECTED',
        'CANCELLED',
      ],
      default: 'PENDING',
      required: true,
      index: true,
    },
    cancellation: {
      isRequested: { type: Boolean, default: false },
      reason: { type: String, default: '' },
      status: { type: String, enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED'], default: 'NONE' },
      requestedAt: { type: Date, default: null },
      processedAt: { type: Date, default: null },
      processedBy: { type: String, default: null },
      responseNote: { type: String, default: '' },
    },
    returnIssue: {
      isReported: { type: Boolean, default: false },
      issueType: { type: String, enum: ['NONE', 'DAMAGED_ITEM', 'WRONG_ITEM', 'MISSING_ITEM', 'QUALITY_ISSUE', 'OTHER'], default: 'NONE' },
      description: { type: String, default: '' },
      status: { type: String, enum: ['NONE', 'PENDING_REVIEW', 'RESOLVED_REPLACEMENT', 'RESOLVED_REFUND_MANUAL', 'REJECTED'], default: 'NONE' },
      reportedAt: { type: Date, default: null },
      resolvedAt: { type: Date, default: null },
      resolutionNotes: { type: String, default: '' },
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: 'PENDING', note: 'Order placed by buyer', updatedAt: new Date(), updatedBy: 'BUYER' }],
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);
export default Order;
