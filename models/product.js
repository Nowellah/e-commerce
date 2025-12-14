import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, trim: true },
    image: { type: String }, // URL or path to product image
    category: { type: String, trim: true },
    brand: { type: String, trim: true },
    stock: { type: Number, default: 0 }, // inventory count
    tags: [{ type: String }], // optional for search/filter
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);