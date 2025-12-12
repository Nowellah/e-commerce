import jwt from 'jsonwebtoken';

function authMiddleware(req, res, next){
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Malformed or missing Authorization header" });
    }
    const token = authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "no token provided" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Add user info to request
        next();
    } catch(err){
        console.error("JWT verification error:", err);
        res.status(401).json({ error: "Invalid token" });
    }
}

export default authMiddleware;