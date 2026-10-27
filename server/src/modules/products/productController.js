import mongoose from 'mongoose';
import Product from './Product.js';
import SellerProfile from '../sellers/SellerProfile.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sort,
      sellerId,
      page = 1,
      limit = 24,
    } = req.query;

    const query = { status: 'ACTIVE' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.$or = [
        { categorySlug: category.toLowerCase() },
        { category: { $regex: new RegExp(`^${category}$`, 'i') } },
      ];
    }

    if (brand && brand !== 'all') {
      query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    if (sellerId) {
      query.sellerId = sellerId;
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.retailPrice = {};
      if (minPrice !== undefined && minPrice !== '') query.retailPrice.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.retailPrice.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { retailPrice: 1 };
    else if (sort === 'price_desc') sortOption = { retailPrice: -1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'stock_desc') sortOption = { stock: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let product;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Attach seller delivery settings preview
    const sellerProfile = await SellerProfile.findOne({ userId: product.sellerId })
      .select('businessName deliverySettings businessAddress.city businessAddress.state verificationStatus');

    res.status(200).json({
      success: true,
      product,
      seller: sellerProfile || {
        businessName: product.sellerBusinessName,
        deliverySettings: {
          deliveryEnabled: true,
          pickupEnabled: true,
          deliveryFee: 40,
          serviceablePincodes: ['110001', '110002', '110003', '110004', '110005'],
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      packSizeUnit,
      images,
      retailPrice,
      wholesalePrice,
      minWholesaleQty,
      stock,
      quantityTiers,
      tags,
    } = req.body;

    if (!name || !category || !packSizeUnit || retailPrice === undefined || wholesalePrice === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, packSizeUnit, retailPrice, wholesalePrice, and stock.',
      });
    }

    if (Number(retailPrice) < 0 || Number(wholesalePrice) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Prices and stock values cannot be negative.',
      });
    }

    // Fetch seller business name
    const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
    const sellerBusinessName = sellerProfile?.businessName || req.user.name;

    // Generate unique slug
    let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = `${baseSlug}-${Date.now().toString(36)}`;

    const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await Product.create({
      name,
      slug,
      description: description || '',
      category,
      categorySlug,
      brand: brand || 'VyaparSetu Verified',
      packSizeUnit,
      images: Array.isArray(images) && images.length > 0 ? images : ['/images/products/placeholder.svg'],
      retailPrice: Number(retailPrice),
      wholesalePrice: Number(wholesalePrice),
      minWholesaleQty: Number(minWholesaleQty) || 5,
      stock: Number(stock),
      sellerId: req.user._id,
      sellerBusinessName,
      quantityTiers: Array.isArray(quantityTiers) ? quantityTiers : [],
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Authorization rule: A wholesaler must never edit another seller's products!
    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own products.',
      });
    }

    const {
      name,
      description,
      category,
      brand,
      packSizeUnit,
      images,
      retailPrice,
      wholesalePrice,
      minWholesaleQty,
      stock,
      status,
      quantityTiers,
      tags,
    } = req.body;

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) {
      product.category = category;
      product.categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (brand) product.brand = brand;
    if (packSizeUnit) product.packSizeUnit = packSizeUnit;
    if (images && Array.isArray(images)) product.images = images;
    if (retailPrice !== undefined) product.retailPrice = Math.max(0, Number(retailPrice));
    if (wholesalePrice !== undefined) product.wholesalePrice = Math.max(0, Number(wholesalePrice));
    if (minWholesaleQty !== undefined) product.minWholesaleQty = Math.max(1, Number(minWholesaleQty));
    if (stock !== undefined) product.stock = Math.max(0, Number(stock));
    if (status && ['ACTIVE', 'INACTIVE'].includes(status)) product.status = status;
    if (quantityTiers && Array.isArray(quantityTiers)) product.quantityTiers = quantityTiers;
    if (tags && Array.isArray(tags)) product.tags = tags;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only toggle status of your own products.',
      });
    }

    product.status = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product is now ${product.status.toLowerCase()}.`,
      status: product.status,
    });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || Number(stock) < 0) {
      return res.status(400).json({ success: false, message: 'Valid stock number is required.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    product.stock = Number(stock);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully.',
      stock: product.stock,
    });
  } catch (error) {
    next(error);
  }
};
