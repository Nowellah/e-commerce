// routes/orderRoutes.js
import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// User routes
router.post('/', authMiddleware, createOrder);          // Checkout
router.get('/', authMiddleware, getUserOrders);         // View all orders for logged-in user
router.get('/:id', authMiddleware, getOrderById);       // View single order

// Admin routes
router.put('/:id', authMiddleware, adminMiddleware, updateOrderStatus); // Update order status

export default router;