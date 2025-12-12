import db from "../config/db.js";

/**
 * AuthModel
 * Menyediakan operasi database terkait autentikasi user.
 */
const AuthModel = {

    /**
     * Mencari user berdasarkan email.
     * Digunakan saat login atau validasi pendaftaran.
     * 
     * @param {string} email - Email yang dicari.
     * @returns {object|null} Data user atau null jika tidak ditemukan.
     */
    findByEmail: async (email) => {
        const sql = `
            SELECT * 
            FROM users 
            WHERE email = ?
        `;
        const [rows] = await db.execute(sql, [email]);
        return rows[0]; 
    },

    /**
     * Mendaftarkan user baru.
     * Hanya mengisi email, password yang sudah di-hash,
     * dan default role sebagai 'user'.
     * 
     * @param {string} email - Email user.
     * @param {string} hashedPassword - Password yang telah di-hash.
     * @returns {object} Result dari query INSERT.
     */
    register: async (email, hashedPassword) => {
        const sql = `
            INSERT INTO users (email, password, role)
            VALUES (?, ?, 'user')
        `;
        const [result] = await db.execute(sql, [email, hashedPassword]);
        return result;
    }
};

export default AuthModel;
