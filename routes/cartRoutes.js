// routes/cartRoutes.js
import express from 'express';
import {
  getCartItems,
  addCartItem,
  removeCartItem,
  getCartTotal,
} from '../controllers/cartController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes require authentication
router.get('/', authMiddleware, getCartItems);
router.post('/add', authMiddleware, addCartItem);
router.delete('/remove/:id', authMiddleware, removeCartItem);
router.get('/total', authMiddleware, getCartTotal);

export default router;