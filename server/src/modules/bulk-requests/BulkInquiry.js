import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema(
  {
    quotationId: {
      type: String,
      required: true,
      default: () => `QT-${Date.now().toString(36).toUpperCase()}`,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerBusinessName: {
      type: String,
      required: true,
    },
    proposedQty: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedDays: {
      type: String,
      default: '2-3 Business Days',
    },
    quotationNotes: {
      type: String,
      default: '',
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    status: {
      type: String,
      enum: ['OFFERED', 'ACCEPTED', 'REJECTED'],
      default: 'OFFERED',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const bulkInquirySchema = new mongoose.Schema(
  {
    inquiryNumber: {
      type: String,
      required: true,
      unique: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    requesterEmail: {
      type: String,
      required: true,
    },
    requesterPhone: {
      type: String,
      required: true,
    },
    requesterRole: {
      type: String,
      enum: ['CUSTOMER', 'RETAILER'],
      default: 'CUSTOMER',
    },
    productOrCategory: {
      type: String,
      required: [true, 'Product or Category description is required'],
      trim: true,
    },
    requestedQty: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: 1,
    },
    requiredDate: {
      type: Date,
      required: [true, 'Required by date is required'],
    },
    deliveryPincode: {
      type: String,
      required: [true, 'Delivery PIN code is required'],
      match: [/^[1-9][0-9]{5}$/, 'PIN code must be a valid 6-digit Indian PIN code'],
    },
    deliveryAddressText: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      default: 0,
    },
    additionalRequirements: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'QUOTED', 'ACCEPTED', 'REJECTED', 'COMPLETED'],
      default: 'SUBMITTED',
      index: true,
    },
    quotes: {
      type: [quotationSchema],
      default: [],
    },
    acceptedQuotationId: {
      type: String,
      default: null,
    },
    resultingOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const BulkInquiry = mongoose.model('BulkInquiry', bulkInquirySchema);
export default BulkInquiry;
