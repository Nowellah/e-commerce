import express from 'express';
import CartItem from '../models/cartItem.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all items in logged-in user's cart
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const items = await CartItem.find({ userId: req.user.id }).populate('productId');
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    const newItem = new CartItem({
      userId: req.user.id,   // associate with logged-in user
      productId,
      quantity,
    });

    await newItem.save();
    res.status(201).json({ message: 'Item added to cart', item: newItem });
  } catch (err) {
    next(err);
  }
});

// Remove item from cart
router.delete('/remove/:id', authMiddleware, async (req, res, next) => {
  try {
    const item = await CartItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Item not found or not authorized' });

    res.json({ message: 'Item removed' });
  } catch (err) {
    next(err);
  }
});

// Get total cart value
router.get('/total', authMiddleware, async (req, res, next) => {
  try {
    const items = await CartItem.find({ userId: req.user.id }).populate('productId');

    const total = items.reduce((acc, item) => {
      return acc + item.productId.price * item.quantity;
    }, 0);

    res.json({ total });
  } catch (err) {
    next(err);
  }
});

export default router;