import express, { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';


const router = express.Router();

router.get('/users', async (req, res) => {
    
    try {
    const users = await User.find().select('-password'); //excludes password
    res.json(users);

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
    
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; //1hour expiry
        await user.save();

        const resetLink = 'http://localhost:5000/api/auth/reset-password/token';

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            subject: 'Password Reset',
                pass: process.env.EMAIL_PASS,
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset',
            html: `<p>You requested a password reset.</p> <p>Click <a href="${resetLink}">here</a> to reset your password.</p> <p>If you did not request this, please ignore this email.</p>`,
        });

        res.json({ message: 'password reset link sent to your email. ' });
    } catch (err) {
        res.status(500).json({ message: 'server error' });
    }
})

//register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        //check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });


        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //save user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        //create token for email verification
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        //send email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: 'Email Verification',
            html: `<p>Click on this link to verify your email: http://localhost:5000/api/auth/verify/${token}</p>`
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "User registered successfully, verification email sent. " });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

//email verification
router.get('/verify/:token', async (req, res) => {
    const token = req.params.token;

    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user and update
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).send('user not found');
        if (user.isVerified) {
            return res.send('Email already verified. you can now login.');
        }

        user.isVerified = true;
        await user.save();

        res.send('Email verified successfully. You can now log in.');

    } catch (err) {
        res.status(400).send('invalid or expired token');
    }
});

//login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "user not found" });

        //check if email is verified
        if (!user.isVerified) {
            return res.status(401).json({ message: 'please Verify your email before logging in.' });
        }

        //compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        //generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'login successful', token });
    } catch (err) {
        res.status(500).json({ message: 'server error' });
    }
});

export default router;