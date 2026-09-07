import express from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getCategories
} from '../controllers/productController.js';

import reviewRoutes from './reviewRoutes.js';

const router = express.Router();

// Reviews sub-route
router.use('/:productId/reviews', reviewRoutes);

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

export default router;
