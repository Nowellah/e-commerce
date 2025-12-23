// controllers/productController.js
import axios from 'axios';

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// Axios instance with auth header
const strapiClient = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
  },
});

// @desc Get all products
export const getProducts = async (req, res, next) => {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/products?populate=*`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

// @desc Get single product
export const getProductById = async (req, res, next) => {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/products/${req.params.id}?populate=*`);
    if (!response.data || !response.data.data) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

// @desc Create new product (Admin only)
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, brand, stock, image } = req.body;

    const response = await strapiClient.post('/api/products', {
      data: { name, description, price, category, brand, stock, image },
    });

    res.status(201).json({ message: 'Product created successfully', product: response.data });
  } catch (error) {
    next(error);
  }
};

// @desc Update product (Admin only)
export const updateProduct = async (req, res, next) => {
  try {
    const response = await strapiClient.put(`/api/products/${req.params.id}`, {
      data: req.body,
    });

    res.json({ message: 'Product updated successfully', product: response.data });
  } catch (error) {
    next(error);
  }
};

// @desc Delete product (Admin only)
export const deleteProduct = async (req, res, next) => {
  try {
    await strapiClient.delete(`/api/products/${req.params.id}`);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};