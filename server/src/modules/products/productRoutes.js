import express from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  getSellerProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
  adjustStock,
} from './productController.js';
import { protect, requireApproval } from '../../middleware/auth.js';
import { authorize } from '../../middleware/roles.js';

const router = express.Router();

// Public catalogue browsing
router.get('/', getProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);

// Wholesaler inventory management (requires approval)
router.get('/seller/my-products', protect, authorize('WHOLESALER'), requireApproval, getSellerProducts);
router.post('/', protect, authorize('WHOLESALER'), requireApproval, createProduct);
router.put('/:id', protect, authorize('WHOLESALER', 'SUPER_ADMIN'), requireApproval, updateProduct);
router.patch('/:id/toggle-status', protect, authorize('WHOLESALER', 'SUPER_ADMIN'), requireApproval, toggleProductStatus);
router.patch('/:id/stock', protect, authorize('WHOLESALER', 'SUPER_ADMIN'), requireApproval, adjustStock);

export default router;
