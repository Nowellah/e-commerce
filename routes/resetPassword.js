import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

let resetTokens = {}; //Temporary store for reset tokens

const router = express.Router();

//request password reset
router.post('/request-reset', async(req, res) =>{
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    resetTokens[email] = token;

    //Setup Email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'abnowellah@gmail.com',
            pass: "cgdncccqvwevwhje"
        },
    });

    const mailOptions = {
        from:'abnowellah@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Use this token to reset your password: ${token}`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) return res.status(500).json({ message: 'Error sending email' });
        res.json({ message: 'Reset email sent' });
    });
});

//confirm reset token and update password
router.post('/reset-password', async(req, res)=>{
    const {email, token, newPassword} = req.body;

    if (resetTokens[email] !== token) {
        return res.status(400).json({ message: 'invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

delete resetTokens[email]; //remove token after use

    res.json({ message: 'Password reset successful' });
});

export default router;