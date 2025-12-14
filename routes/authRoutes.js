import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = express.Router();

// Utility: create transporter using env variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Get all users (excluding passwords)
router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post("/forgot-password", async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `http://localhost:5000/api/auth/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
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

// Register
router.post("/register", async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: "Email Verification",
      html: `<p>Click on this link to verify your email: http://localhost:5000/api/auth/verify/${token}</p>`,
    });

    res
      .status(201)
      .json({
        message: "User registered successfully, verification email sent.",
      });
  } catch (err) {
    next(err);
  }
});

// Email verification
router.get("/verify/:token", async (req, res, next) => {
  const token = req.params.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).send("User not found");
    if (user.isVerified)
      return res.send("Email already verified. You can now login.");

    user.isVerified = true;
    await user.save();

    res.send("Email verified successfully. You can now log in.");
  } catch (err) {
    res.status(400).send("Invalid or expired token");
  }
});

// Login
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    next(err);
  }
});

export default router;
