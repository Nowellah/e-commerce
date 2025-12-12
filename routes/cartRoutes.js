import express from 'express';
import CartItem from '../models/cartItem.js';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

let cart = [];

//get all items in cart
router.get('/', async (req, res) => {
    const items = await
    CartItem.find().populate('productId');
    res.json(items);
});

//add item to cart (only logged in users can add items)
router.post('/add', authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;

    const newItem = new CartItem({ productId, quantity });
    await newItem.save();
    res.status(201).json({ message: 'item added to cart', item: newItem });
});


//remove item fromm cart
router.delete('/remove/:id', async (req, res) => {
    await CartItem.findByIdAndDelete(req.params.id);
    res.json({ message : 'item removed '});
});

//Get total cart value
router.get('/total', async(req, res)=> {
    const items = await CartItem.find().populate('productId');

    const total = items.reduce((acc, item) =>{
        return acc + item.productId.price * item.quantity;
    }, 0);
    res.json({ total });
});

export default router;
