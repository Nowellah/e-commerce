import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import errorHandler from "./middleware/errorHandler.js";

import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import resetPasswordRoutes from "./routes/resetPassword.js";
import sendEmail from "./utils/sendEmail.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes
app.get("/", (req, res) => {
    res.send("Server is running...");
});

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/password", resetPasswordRoutes);

app.post(
    "/api/sendEmail",
    asyncHandler(async (req, res) => {
        const { to, subject, text } = req.body;
        if (!to || !subject || !text) {
            return res
                .status(400)
                .json({ message: "Missing required fields: to, subject, text" });
        }
        await sendEmail(to, subject, text);
        res.json({ message: "Email sent successfully" });
    })
);

// Global error handler (must be last middleware)
app.use(errorHandler);

// MongoDB connection + server start
const PORT = process.env.PORT || 5000;
const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

startServer();