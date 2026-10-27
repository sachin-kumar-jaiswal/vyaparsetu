import express from 'express';
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from './addressController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect); // All address routes require authentication

router.get('/', getMyAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/set-default', setDefaultAddress);

export default router;
