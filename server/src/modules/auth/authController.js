import jwt from 'jsonwebtoken';
import User from '../users/User.js';
import SellerProfile from '../sellers/SellerProfile.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vyaparsetu_super_secret_jwt_key_2026_dev_env', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone number.',
      });
    }

    // Security guard: Never allow public registration as SUPER_ADMIN
    if (role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Super Admin accounts cannot be created via public registration.',
      });
    }

    const permittedRoles = ['CUSTOMER', 'RETAILER', 'WHOLESALER'];
    const assignedRole = permittedRoles.includes(role) ? role : 'CUSTOMER';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: assignedRole,
    });

    let sellerProfile = null;
    if (assignedRole === 'WHOLESALER') {
      sellerProfile = await SellerProfile.create({
        userId: user._id,
        businessName: req.body.businessName || `${name}'s Wholesale Enterprise`,
        businessCategory: req.body.businessCategory || 'Grocery & FMCG Wholesale',
        onboardingStep: 1,
        isSubmitted: false,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: assignedRole === 'CUSTOMER'
        ? 'Account registered successfully.'
        : `Application submitted as ${assignedRole}. Awaiting admin approval for privileged access.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isApproved: user.isApproved,
      },
      sellerProfile: sellerProfile ? { id: sellerProfile._id, businessName: sellerProfile.businessName } : null,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration. Reason: ' + (user.rejectionReason || 'Policy violation'),
      });
    }

    const token = generateToken(user._id);

    let sellerProfile = null;
    if (user.role === 'WHOLESALER') {
      sellerProfile = await SellerProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isApproved: user.isApproved,
      },
      sellerProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let sellerProfile = null;
    if (user.role === 'WHOLESALER') {
      sellerProfile = await SellerProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isApproved: user.isApproved,
        rejectionReason: user.rejectionReason,
      },
      sellerProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
