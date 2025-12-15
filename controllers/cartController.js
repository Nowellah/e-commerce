import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

// @desc Get all items in logged-in user's cart
// @route GET /api/cart
export const getCartItems = async (req, res, next) => {
  try {
    const items = await CartItem.find({ userId: req.user.id }).populate('productId');
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// @desc Add item to cart
// @route POST /api/cart/add
export const addCartItem = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const newItem = new CartItem({
      userId: req.user.id,
      productId,
      quantity,
      priceAtAddition: product.price, // snapshot of price
    });

    await newItem.save();
    res.status(201).json({ message: 'Item added to cart', item: newItem });
  } catch (err) {
    next(err);
  }
};

// @desc Remove item from cart
// @route DELETE /api/cart/remove/:id
export const removeCartItem = async (req, res, next) => {
  try {
    const item = await CartItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Item not found or not authorized' });

    res.json({ message: 'Item removed' });
  } catch (err) {
    next(err);
  }
};

// @desc Get total cart value
// @route GET /api/cart/total
export const getCartTotal = async (req, res, next) => {
  try {
    const items = await CartItem.find({ userId: req.user.id }).populate('productId');

    const total = items.reduce((acc, item) => {
      return acc + item.productId.price * item.quantity;
    }, 0);

    res.json({ total });
  } catch (err) {
    next(err);
  }
};