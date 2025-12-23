import axios from 'axios';

const STRAPI_URL = process.env.STRAPI_URL;

// @desc Get all products (with optional filters)
// @route GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    // Build Strapi query params
    let filters = [];
    if (category) filters.push(`filters[category][name][$eq]=${category}`);
    if (search) filters.push(`filters[name][$containsi]=${search}`);
    if (minPrice) filters.push(`filters[price][$gte]=${minPrice}`);
    if (maxPrice) filters.push(`filters[price][$lte]=${maxPrice}`);

    const queryString = filters.length > 0 ? `?${filters.join('&')}&populate=*` : '?populate=*';

    const response = await axios.get(`${STRAPI_URL}/api/products${queryString}`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

// @desc Get single product
// @route GET /api/products/:id
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
// @route POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, brand, stock, image } = req.body;

    const response = await axios.post(`${STRAPI_URL}/api/products`, {
      data: { name, description, price, category, brand, stock, image },
    });

    res.status(201).json({ message: 'Product created successfully', product: response.data });
  } catch (error) {
    next(error);
  }
};

// @desc Update product (Admin only)
// @route PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const response = await axios.put(`${STRAPI_URL}/api/products/${req.params.id}`, {
      data: req.body,
    });

    res.json({ message: 'Product updated successfully', product: response.data });
  } catch (error) {
    next(error);
  }
};

// @desc Delete product (Admin only)
// @route DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    await axios.delete(`${STRAPI_URL}/api/products/${req.params.id}`);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};