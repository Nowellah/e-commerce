import Order from '../models/Order.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

// @desc Create new order from user's cart
// @route POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const cartItems = await CartItem.find({ userId: req.user.id }).populate('productId');

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    const total = cartItems.reduce((acc, item) => {
      return acc + item.productId.price * item.quantity;
    }, 0);

    // Create order
    const order = new Order({
      userId: req.user.id,
      items: cartItems.map(item => ({
        product: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      })),
      total,
      status: 'pending',
    });

    await order.save();

    // Clear cart after checkout
    await CartItem.deleteMany({ userId: req.user.id });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    next(err);
  }
};

// @desc Get all orders for logged-in user
// @route GET /api/orders
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate('items.product');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// @desc Get single order by ID
// @route GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id }).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// @desc Update order status (Admin only)
// @route PUT /api/orders/:id
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status || order.status;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    next(err);
  }
};