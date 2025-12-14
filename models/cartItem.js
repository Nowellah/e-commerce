import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    priceAtAddition: {
      type: Number,
      required: false, // optional snapshot of product price when added
    },
  },
  { timestamps: true }
);

const CartItem = mongoose.model('CartItem', cartItemSchema);
export default CartItem;