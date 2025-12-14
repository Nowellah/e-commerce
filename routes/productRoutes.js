import express from 'express';
import Product from '../models/product.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js'; 

const router = express.Router();

// @desc Get all products (with optional query filters)
// @route GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    let query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// @desc Get single product
// @route GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// @desc Create new product (Admin only)
// @route POST /api/products
router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const newProduct = new Product({ name, description, price, category, stock });
    await newProduct.save();

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    next(error);
  }
});

// @desc Update product (Admin only)
// @route PUT /api/products/:id
router.put('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    next(error);
  }
});

// @desc Delete product (Admin only)
// @route DELETE /api/products/:id
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;