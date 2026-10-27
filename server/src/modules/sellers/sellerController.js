import SellerProfile from './SellerProfile.js';
import User from '../users/User.js';
import Product from '../products/Product.js';
import Order from '../orders/Order.js';
import BulkInquiry from '../bulk-requests/BulkInquiry.js';

export const getOnboardingState = async (req, res, next) => {
  try {
    let profile = await SellerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await SellerProfile.create({
        userId: req.user._id,
        businessName: `${req.user.name}'s Wholesale Enterprise`,
      });
    }

    res.status(200).json({
      success: true,
      profile,
      userStatus: req.user.status,
      isApproved: req.user.isApproved,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOnboardingStep = async (req, res, next) => {
  try {
    const { step, data } = req.body;
    let profile = await SellerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new SellerProfile({ userId: req.user._id, businessName: 'Wholesale Business' });
    }

    if (step === 2) {
      // Step 2: Business Information
      if (data.businessName) profile.businessName = data.businessName;
      if (data.businessType) profile.businessType = data.businessType;
      if (data.businessCategory) profile.businessCategory = data.businessCategory;
      if (data.description !== undefined) profile.description = data.description;
      if (data.yearsInBusiness !== undefined) profile.yearsInBusiness = Number(data.yearsInBusiness) || 1;
      if (data.logo) profile.logo = data.logo;
      if (data.coverImage) profile.coverImage = data.coverImage;
      profile.onboardingStep = Math.max(profile.onboardingStep, 3);
    } else if (step === 3) {
      // Step 3: Verification Information
      if (data.gstin !== undefined) profile.gstin = data.gstin.trim().toUpperCase();
      if (data.tradeLicense !== undefined) profile.tradeLicense = data.tradeLicense.trim();
      if (data.fssaiLicense !== undefined) profile.fssaiLicense = data.fssaiLicense.trim();
      profile.onboardingStep = Math.max(profile.onboardingStep, 4);
    } else if (step === 4) {
      // Step 4: Addresses
      if (data.businessAddress) {
        profile.businessAddress = {
          ...profile.businessAddress,
          ...data.businessAddress,
        };
      }
      if (data.dispatchAddress) {
        profile.dispatchAddress = {
          ...profile.dispatchAddress,
          ...data.dispatchAddress,
        };
      }
      profile.onboardingStep = Math.max(profile.onboardingStep, 5);
    } else if (step === 5) {
      // Step 5: Delivery & Fulfilment Settings
      if (data.deliverySettings) {
        profile.deliverySettings = {
          ...profile.deliverySettings,
          ...data.deliverySettings,
        };
      }
      profile.onboardingStep = Math.max(profile.onboardingStep, 6);
    } else if (step === 6) {
      // Step 6: Review & Final Submission
      profile.isSubmitted = true;
      profile.onboardingStep = 6;
      await User.findByIdAndUpdate(req.user._id, { status: 'PENDING_APPROVAL' });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: step === 6 ? 'Onboarding submitted for administrator approval.' : `Step ${step} updated successfully.`,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await SellerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    res.status(200).json({
      success: true,
      profile,
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        status: req.user.status,
        isApproved: req.user.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { businessName, description, yearsInBusiness, logo, coverImage, deliverySettings, businessAddress, dispatchAddress } = req.body;

    const profile = await SellerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    if (businessName) profile.businessName = businessName;
    if (description !== undefined) profile.description = description;
    if (yearsInBusiness !== undefined) profile.yearsInBusiness = yearsInBusiness;
    if (logo) profile.logo = logo;
    if (coverImage) profile.coverImage = coverImage;
    if (deliverySettings) {
      profile.deliverySettings = { ...profile.deliverySettings, ...deliverySettings };
    }
    if (businessAddress) {
      profile.businessAddress = { ...profile.businessAddress, ...businessAddress };
    }
    if (dispatchAddress) {
      profile.dispatchAddress = { ...profile.dispatchAddress, ...dispatchAddress };
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Business profile and delivery settings updated.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await SellerProfile.findOne({ userId: req.params.id })
      .select('businessName businessCategory description yearsInBusiness logo coverImage verificationStatus deliverySettings businessAddress.city businessAddress.state');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const sellerId = req.user._id;

    const [activeProducts, lowStockProducts, pendingOrders, allSellerOrders, pendingInquiries] = await Promise.all([
      Product.countDocuments({ sellerId, status: 'ACTIVE' }),
      Product.countDocuments({ sellerId, stock: { $lte: 15 }, status: 'ACTIVE' }),
      Order.countDocuments({ sellerId, orderStatus: { $in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } }),
      Order.find({ sellerId, orderStatus: { $ne: 'CANCELLED' } }).select('grandTotal paymentStatus orderStatus'),
      BulkInquiry.countDocuments({ status: { $in: ['SUBMITTED', 'QUOTED'] } }),
    ]);

    const totalSales = allSellerOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        activeProducts,
        lowStockProducts,
        pendingOrders,
        totalSales,
        totalOrders: allSellerOrders.length,
        openInquiries: pendingInquiries,
      },
    });
  } catch (error) {
    next(error);
  }
};
