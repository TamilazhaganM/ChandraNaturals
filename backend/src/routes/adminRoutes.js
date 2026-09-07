import express from 'express';
import {
  getDashboardStats,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus
} from '../controllers/adminController.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} from '../controllers/productController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Strict RBAC: All admin routes require role === 'admin'
router.use(requireAdmin);

// Dashboard metrics
router.get('/dashboard', getDashboardStats);

// Order management
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.put('/orders/:id/status', updateOrderStatus);

// Product management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateStock);

export default router;
