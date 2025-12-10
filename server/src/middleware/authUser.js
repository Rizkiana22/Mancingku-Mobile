// File: middleware/authUser.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ message: "Akses ditolak! Token tidak ditemukan." });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Akses ditolak! Token kosong." });
    }

    try {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            console.error('FATAL ERROR: JWT_SECRET is not defined. Please set this environment variable.');
            throw new Error('JWT_SECRET is not defined.');
        }
        const decoded = jwt.verify(token, secretKey);
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token tidak valid atau kadaluarsa." });
    }
};

// Gunakan export default agar mudah di-import dengan nama bebas
export default verifyToken;