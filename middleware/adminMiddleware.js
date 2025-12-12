import jwt from 'jsonwebtoken';
import User from '../models/User';

const adminOnly = async(req, res, next) => {
    try  {
        const token = req.headers.authorization?.split(" ")[1];
        if(!token) return res.status(401).json({ message: "access denied" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if(!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access only' });
        }
        req.user = user;
        next();
    } catch(err){
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = adminOnly;