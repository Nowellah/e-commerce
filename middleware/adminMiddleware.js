export default function adminMiddleware(req, res, next) {
  try {
    // Ensure user is attached by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: no user found' });
    }

    // Check role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    next(err); // Pass to global error handler
  }
}