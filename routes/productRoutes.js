// import express from 'express';

import express from 'express';

const router = express.Router();
import Product from '../models/product.js';



//@desc Get all products
//@route GET /api/products
router.get('/', async (req, res)=>{
    try{
        const products = await Product.find({});
        res.json(products);
    } catch (error){
        res.status(500).json({ message: 'Server error'});
    }
});

export default router;