import express from 'express';
import {
  createInquiry,
  getMyInquiries,
  getMarketInquiries,
  submitQuotation,
  acceptQuotation,
} from './bulkRequestController.js';
import { protect, requireApproval } from '../../middleware/auth.js';
import { authorize } from '../../middleware/roles.js';

const router = express.Router();

router.use(protect);

router.post('/', createInquiry);
router.get('/my-inquiries', getMyInquiries);
router.get('/market', authorize('WHOLESALER', 'SUPER_ADMIN'), requireApproval, getMarketInquiries);
router.post('/:id/quote', authorize('WHOLESALER', 'SUPER_ADMIN'), requireApproval, submitQuotation);
router.post('/:id/accept-quote', acceptQuotation);

export default router;
