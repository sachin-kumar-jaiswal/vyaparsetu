import User from '../users/User.js';
import SellerProfile from '../sellers/SellerProfile.js';
import Product from '../products/Product.js';
import Order from '../orders/Order.js';
import BulkInquiry from '../bulk-requests/BulkInquiry.js';

export const getOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      wholesalers,
      retailers,
      customers,
      pendingWholesalers,
      pendingRetailers,
      activeProducts,
      orders,
      reportedIssues,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'WHOLESALER' }),
      User.countDocuments({ role: 'RETAILER' }),
      User.countDocuments({ role: 'CUSTOMER' }),
      User.countDocuments({ role: 'WHOLESALER', status: 'PENDING_APPROVAL' }),
      User.countDocuments({ role: 'RETAILER', status: 'PENDING_APPROVAL' }),
      Product.countDocuments({ status: 'ACTIVE' }),
      Order.find({ orderStatus: { $ne: 'CANCELLED' } }).select('grandTotal'),
      Order.countDocuments({ 'returnIssue.isReported': true, 'returnIssue.status': 'PENDING_REVIEW' }),
    ]);

    const totalSalesVolume = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        wholesalers,
        retailers,
        customers,
        pendingWholesalers,
        pendingRetailers,
        activeProducts,
        totalOrders: orders.length,
        totalSalesVolume,
        openReportedIssues: reportedIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSellers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { role: 'WHOLESALER' };
    if (status && status !== 'all') query.status = status;

    const sellers = await User.find(query).sort({ createdAt: -1 });
    const userIds = sellers.map(s => s._id);

    const profiles = await SellerProfile.find({ userId: { $in: userIds } });
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const combined = sellers.map(s => ({
      ...s.toObject(),
      profile: profileMap.get(s._id.toString()) || null,
    }));

    res.status(200).json({
      success: true,
      count: combined.length,
      sellers: combined,
    });
  } catch (error) {
    next(error);
  }
};

export const approveSeller = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'WHOLESALER' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Wholesaler not found.' });
    }

    user.status = 'APPROVED';
    user.isApproved = true;
    user.rejectionReason = null;
    await user.save();

    await SellerProfile.findOneAndUpdate(
      { userId: user._id },
      { verificationStatus: 'VERIFIED' }
    );

    res.status(200).json({
      success: true,
      message: `Wholesaler "${user.name}" has been approved! They can now list products and manage orders.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectSeller = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findOne({ _id: req.params.id, role: 'WHOLESALER' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Wholesaler not found.' });
    }

    user.status = 'REJECTED';
    user.isApproved = false;
    user.rejectionReason = reason || 'Documentation verification failed or incomplete business information.';
    await user.save();

    await SellerProfile.findOneAndUpdate(
      { userId: user._id },
      { verificationStatus: 'REJECTED', verificationNotes: user.rejectionReason }
    );

    res.status(200).json({
      success: true,
      message: `Wholesaler application rejected. Reason: ${user.rejectionReason}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getRetailers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { role: 'RETAILER' };
    if (status && status !== 'all') query.status = status;

    const retailers = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: retailers.length,
      retailers,
    });
  } catch (error) {
    next(error);
  }
};

export const approveRetailer = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'RETAILER' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Retailer not found.' });
    }

    user.status = 'APPROVED';
    user.isApproved = true;
    user.rejectionReason = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Retailer "${user.name}" has been approved for wholesale tier pricing!`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectRetailer = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findOne({ _id: req.params.id, role: 'RETAILER' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Retailer not found.' });
    }

    user.status = 'REJECTED';
    user.isApproved = false;
    user.rejectionReason = reason || 'Retail business verification declined.';
    await user.save();

    res.status(200).json({
      success: true,
      message: `Retailer application rejected. Reason: ${user.rejectionReason}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Safety check: Prevent accidental suspension of the only Super Admin!
    if (user.role === 'SUPER_ADMIN') {
      const adminCount = await User.countDocuments({ role: 'SUPER_ADMIN', status: 'ACTIVE' });
      if (adminCount <= 1 && user.status === 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Cannot suspend the only active Super Admin account.',
        });
      }
    }

    user.status = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.status}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportedIssues = async (req, res, next) => {
  try {
    const issues = await Order.find({ 'returnIssue.isReported': true }).sort({ 'returnIssue.reportedAt': -1 });
    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    next(error);
  }
};
