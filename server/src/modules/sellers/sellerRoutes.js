import express from 'express';
import {
  getOnboardingState,
  updateOnboardingStep,
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  getDashboardStats,
} from './sellerController.js';
import { protect, requireApproval } from '../../middleware/auth.js';
import { authorize } from '../../middleware/roles.js';

const router = express.Router();

// Public seller profile view
router.get('/profile/:id', getPublicProfile);

// Wholesaler onboarding routes (available even before approval)
router.get('/onboarding/status', protect, authorize('WHOLESALER'), getOnboardingState);
router.put('/onboarding/step', protect, authorize('WHOLESALER'), updateOnboardingStep);

// Wholesaler operations (require approval)
router.get('/my-profile', protect, authorize('WHOLESALER'), getMyProfile);
router.put('/my-profile', protect, authorize('WHOLESALER'), updateMyProfile);
router.get('/dashboard-stats', protect, authorize('WHOLESALER'), requireApproval, getDashboardStats);

export default router;
