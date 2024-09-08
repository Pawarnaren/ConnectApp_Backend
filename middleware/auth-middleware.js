import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate using JWT
export const authenticateUser = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Token should be in the format "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};

// Middleware to authenticate using email
export const authenticateUserByEmail = async (req, res, next) => {
    try {
        const email = req.headers['x-user-email'];

        if (!email) {
            return res.status(401).json({ message: 'Email header not provided' });
        }
        
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error authenticating user by email:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Middle to authenticate user by token
export const authenticateUserByToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};