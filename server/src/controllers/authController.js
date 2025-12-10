import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // 1. Import JWT
import dotenv from "dotenv";    // 2. Import dotenv untuk baca .env
import AuthModel from "../models/authModel.js"; 

dotenv.config(); // Load konfigurasi .env

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password){ 
            return res.status(400).json({ message: "Email dan password wajib diisi" });
        }

        const existingUser = await AuthModel.findByEmail(email);

        if (existingUser){
            return res.status(400).json({ message: "Email sudah terdaftar" });
        } 

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        await AuthModel.register(email, hashPassword);

        res.json({ message: "Registrasi berhasil!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error saat Register" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password){ 
            return res.status(400).json({ message: "Email dan password wajib diisi" });
        }
        
        const user = await AuthModel.findByEmail(email);

        if (!user) {
            return res.status(400).json({ message: "Email salah" });
        }

        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(400).json({ message: "Password salah" });
        }

        // --- BAGIAN BARU: MEMBUAT TOKEN (JWT) ---
        
        // 1. Siapkan data yang mau dimasukkan ke dalam token
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role // Pastikan kolom 'role' ada di database kamu
        };

        // 2. Ambil Secret Key dari .env (atau pakai default kalau gak ada)
        const secretKey = process.env.JWT_SECRET || 'RAHASIA_NEGARA';

        // 3. Buat Tokennya (Expired dalam 1 hari)
        const token = jwt.sign(payload, secretKey, { expiresIn: '1d' });

        // ----------------------------------------

        res.json({
            message: "Login berhasil",
            token: token, // <--- Token dikirim ke frontend di sini
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error saat Login" });
    }
};