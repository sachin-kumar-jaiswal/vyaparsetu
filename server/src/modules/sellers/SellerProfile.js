import mongoose from 'mongoose';

const addressSubSchema = new mongoose.Schema(
  {
    houseNo: { type: String, trim: true, default: '' },
    street: { type: String, trim: true, default: '' },
    landmark: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: {
      type: String,
      trim: true,
      default: '',
      match: [/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit Indian PIN code'],
    },
    contactPerson: { type: String, trim: true, default: '' },
    contactPhone: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const deliverySettingsSchema = new mongoose.Schema(
  {
    deliveryEnabled: { type: Boolean, default: true },
    pickupEnabled: { type: Boolean, default: true },
    serviceablePincodes: {
      type: [String],
      default: ['110001', '110002', '110003', '110004', '110005', '110006', '110007', '110008', '110009', '110010', '110011', '110020', '110025', '110085', '110092'],
    },
    deliveryFee: { type: Number, default: 40, min: 0 },
    freeDeliveryThreshold: { type: Number, default: 499, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    estimatedDeliveryTime: { type: String, default: 'Same Day / Next Day Dispatch' },
    operatingHours: { type: String, default: '8:00 AM - 9:00 PM' },
    deliveryNotes: { type: String, default: 'Standard ground delivery within serviceable PIN codes.' },
    codAvailable: { type: Boolean, default: true },
    upiId: { type: String, trim: true, default: 'seller@upi' },
  },
  { _id: false }
);

const sellerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business Name is required'],
      trim: true,
    },
    businessType: {
      type: String,
      enum: ['PROPRIETORSHIP', 'PARTNERSHIP', 'PVT_LTD', 'LLP', 'INDIVIDUAL', 'TRADER'],
      default: 'PROPRIETORSHIP',
    },
    businessCategory: {
      type: String,
      default: 'Grocery & FMCG Wholesale',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    yearsInBusiness: {
      type: Number,
      min: 0,
      default: 1,
    },
    logo: {
      type: String,
      default: '/images/branding/seller-default-logo.svg',
    },
    coverImage: {
      type: String,
      default: '/images/branding/seller-cover-default.jpg',
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    tradeLicense: {
      type: String,
      trim: true,
      default: '',
    },
    fssaiLicense: {
      type: String,
      trim: true,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    businessAddress: {
      type: addressSubSchema,
      default: () => ({}),
    },
    dispatchAddress: {
      type: addressSubSchema,
      default: () => ({}),
    },
    deliverySettings: {
      type: deliverySettingsSchema,
      default: () => ({}),
    },
    onboardingStep: {
      type: Number,
      default: 6,
    },
    isSubmitted: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SellerProfile = mongoose.model('SellerProfile', sellerProfileSchema);
export default SellerProfile;
