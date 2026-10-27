import express from 'express';
import {
  getOverview,
  getSellers,
  approveSeller,
  rejectSeller,
  getRetailers,
  approveRetailer,
  rejectRetailer,
  toggleUserStatus,
  getAllOrders,
  getReportedIssues,
} from './adminController.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/roles.js';

const router = express.Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/overview', getOverview);
router.get('/sellers', getSellers);
router.patch('/sellers/:id/approve', approveSeller);
router.patch('/sellers/:id/reject', rejectSeller);

router.get('/retailers', getRetailers);
router.patch('/retailers/:id/approve', approveRetailer);
router.patch('/retailers/:id/reject', rejectRetailer);

router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/orders', getAllOrders);
router.get('/issues', getReportedIssues);

export default router;
