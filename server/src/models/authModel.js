import db from "../config/db.js";

const AuthModel = {
    findByEmail: async (email) => {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [rows] = await db.execute(sql, [email]);
        return rows[0]; 
    },

    register: async (email, hashedPassword) => {
        const sql = "INSERT INTO users (email, password, role) VALUES (?, ?, 'user')";
        const [result] = await db.execute(sql, [email, hashedPassword]);
        return result;
    }
};

export default AuthModel;