import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import AuthModel from "../models/authModel.js";

dotenv.config(); // Load environment variables dari file .env

/**
 * Controller: Register User Baru
 * Melakukan validasi input, cek apakah email sudah dipakai,
 * hash password, lalu simpan user ke database.
 */
export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input dasar
        if (!email || !password) { 
            return res.status(400).json({ message: "Email dan password wajib diisi" });
        }

        // Cek apakah email sudah terdaftar
        const existingUser = await AuthModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        // Hashing password dengan salt
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Simpan user baru
        await AuthModel.register(email, hashPassword);

        res.json({ message: "Registrasi berhasil!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error saat Register" });
    }
};

/**
 * Controller: Login User
 * Validasi email & password, cek kecocokan hash,
 * lalu buat JWT token untuk autentikasi.
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) { 
            return res.status(400).json({ message: "Email dan password wajib diisi" });
        }
        
        // Ambil user berdasarkan email
        const user = await AuthModel.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Email salah" });
        }

        // Cek password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Password salah" });
        }

        /**
         * Buat token JWT
         * Payload berisi informasi dasar user.
         * Secret key diambil dari .env.
         */
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const secretKey = process.env.JWT_SECRET || "RAHASIA_NEGARA";

        // Token berlaku selama 1 hari
        const token = jwt.sign(payload, secretKey, { expiresIn: "1d" });

        res.json({
            message: "Login berhasil",
            token: token,
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
