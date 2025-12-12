import mongoose from 'mongoose';
import Product from './models/product.js';

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce').then(()=>{
    console.log('Connected to MongoDB');
}).catch((err)=>{
    console.error('MongoDB connection error:', err);
});

const products = [
     {
       
        name:'product one',
        price:'50000',
        description:"sample product",
        image: "https://pixabay.com/photos/perfume-cosmetics-women-2445617/",

        },
        {
        
        name:'product two',
        price:'100000',
        description:"sample product two", 
        image: "https://pixabay.com/photos/perfume-glass-bottle-perfume-bottle-227100/",
        },
        {
       
        name:'product three',
        price:'150000',
        description:"sample product three",
        image: "https://pixabay.com/photos/perfume-flacon-glass-bottle-bottle-2142817/",
        },
]; 

const seedProducts = async() =>{
    try {
        await Product.deleteMany();
        await Product.insertMany(products);
        console.log('Data seeded successfully');
        mongoose.disconnect();
    }catch(err){
        console.error('Seeding error:', err);
    }
};
seedProducts();
