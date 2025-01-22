import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const protect = async (req, res, next) => {
    try {
        // Extract token from header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Not authorized, no token provided' });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired, please log in again' });
            }
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Fetch user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'User not found, authorization denied' });
        }

        // Attach user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Protect middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
