import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
    name: { type: String, required: true} ,
    price: { type: Number, required: true } ,
    description: String,
    Image : String,
});
export default mongoose.model('product', productSchema);
