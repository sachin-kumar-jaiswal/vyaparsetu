import express from 'express';
import {
  checkout,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
  submitUtr,
  verifyPayment,
  requestCancellation,
  respondCancellation,
  reportReturnIssue,
} from './orderController.js';
import { protect, requireApproval } from '../../middleware/auth.js';
import { authorize } from '../../middleware/roles.js';

const router = express.Router();

router.use(protect); // All order actions require authentication

// Buyer actions
router.post('/checkout', checkout);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/submit-utr', submitUtr);
router.post('/:id/cancellation-request', requestCancellation);
router.post('/:id/return-issue', reportReturnIssue);

// Wholesaler actions (requires approval)
router.get('/seller/incoming', authorize('WHOLESALER'), requireApproval, getSellerOrders);
router.patch('/:id/status', authorize('WHOLESALER', 'SUPER_ADMIN'), requireApproval, updateOrderStatus);
router.patch('/:id/verify-payment', authorize('WHOLESALER', 'SUPER_ADMIN'), requireApproval, verifyPayment);
router.patch('/:id/cancellation-response', authorize('WHOLESALER', 'SUPER_ADMIN'), requireApproval, respondCancellation);

export default router;
