import express from 'express';
import {
  getUsers,
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js';

const router = express.Router();

// User management
router.get('/users', getUsers);

// Auth flows
router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);

// Password reset flows
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;