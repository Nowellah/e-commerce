import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Setup reusable transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Request password reset
router.post("/request-reset", async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        const resetLink = `http://localhost:5000/api/password/reset/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
        });

        res.json({ message: "Password reset link sent to your email." });
    } catch (err) {
        next(err);
    }
});

// Confirm reset token and update password
router.post("/reset-password/:token", async (req, res, next) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }, // ensure token not expired
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear reset token fields
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        next(err);
    }
});

export default router;
