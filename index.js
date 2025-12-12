import express from 'express';
const app = express();
app.use(express.json());

import mongoose from 'mongoose';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import authRoutes from './routes/authRoutes.js';
import resetPasswordRoutes from "./routes/resetPassword.js";
import sendEmail from "./utils/sendEmail.js";


mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true }).then(() =>{
    console.log('connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

app.get('/', (req, res) => {
    res.send('server is running...');
});


app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/password', resetPasswordRoutes);
app.use('/api/sendEmail', async (req, res) => {
    const { to, subject, text } = req.body;
    if (!to || !subject || !text) {
        return res.status(400).json({ message: 'Missing required fields: to, subject, text' });
    }
    try {
        await sendEmail(to, subject, text);
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
