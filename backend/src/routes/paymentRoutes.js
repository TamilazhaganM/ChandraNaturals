import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Razorpay Webhook (called by Razorpay servers; verified via signature, not user session)
router.post('/webhook', handleWebhook);

// Protected payment endpoints for authenticated customers
router.post('/create-order', authenticate, createRazorpayOrder);
router.post('/verify', authenticate, verifyPayment);

export default router;
