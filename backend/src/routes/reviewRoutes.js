import express from 'express';
import {
  getProductReviews,
  createReview,
  deleteReview
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Public: view reviews for a product
router.get('/', getProductReviews);

// Protected: create review (customer)
router.post('/', authenticate, createReview);

// Protected: delete review (author or admin)
router.delete('/:id', authenticate, deleteReview);

export default router;
