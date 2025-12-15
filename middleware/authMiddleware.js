import jwt from 'jsonwebtoken';
import User from '../models/User.js';

async function authMiddleware(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Malformed or missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found or unauthorized' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default authMiddleware;