import mongoose from 'mongoose';

const quantityTierSchema = new mongoose.Schema(
  {
    minQty: {
      type: Number,
      required: true,
      min: 1,
    },
    maxQty: {
      type: Number,
      default: null, // null means and above
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    categorySlug: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      default: 'VyaparSetu Verified',
    },
    packSizeUnit: {
      type: String,
      required: [true, 'Pack size or unit is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: ['/images/products/placeholder.svg'],
    },
    retailPrice: {
      type: Number,
      required: [true, 'Retail price is required'],
      min: [0, 'Retail price cannot be negative'],
    },
    wholesalePrice: {
      type: Number,
      required: [true, 'Wholesale price is required'],
      min: [0, 'Wholesale price cannot be negative'],
    },
    minWholesaleQty: {
      type: Number,
      default: 5,
      min: [1, 'Minimum wholesale quantity must be at least 1'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 100,
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
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    quantityTiers: {
      type: [quantityTierSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isSeededDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });

export const Product = mongoose.model('Product', productSchema);
export default Product;
