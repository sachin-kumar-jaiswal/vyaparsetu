import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categoryController.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/roles.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, authorize('SUPER_ADMIN'), createCategory);
router.put('/:id', protect, authorize('SUPER_ADMIN'), updateCategory);
router.delete('/:id', protect, authorize('SUPER_ADMIN'), deleteCategory);

export default router;
