import express from 'express';
import {
  applyCoupon,
  getActiveCoupons,
  createCoupon
} from '../controllers/couponController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getActiveCoupons);
router.post('/apply', applyCoupon);
router.post('/', requireAdmin, createCoupon);

export default router;
