import jwt from 'jsonwebtoken';
import User from '../modules/users/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing. Please log in to proceed.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vyaparsetu_super_secret_jwt_key_2026_dev_env');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform administration.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

export const requireApproval = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'CUSTOMER') {
    return next();
  }

  if (req.user.status !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      message: `Your account status is '${req.user.status}'. Access to privileged features requires Super Admin approval.`,
      status: req.user.status,
    });
  }

  next();
};
