import dbPool from "../config/db.js"

const UserModel = {
    create: async (data) => {
        const {name, email, password, phone, role} = data;

        const userRole = role || 'user';

        const sql = `   INSERT INTO users (name, email, password, phone, role) 
                        VALUES (?, ?, ?, ?, ?)`;

        const[result] = await dbPool.execute(sql,[name, email, password, phone, userRole]);
    },

    findById: async (id) => {
        const sql = `
            SELECT id, email, name, phone 
            FROM users 
            WHERE id = ?
        `;
        
        // Menggunakan await (bukan callback)
        // Destructuring [rows] supaya langsung dapet datanya
        const [rows] = await dbPool.execute(sql, [id]);
        
        // Kembalikan elemen pertama (object user) atau undefined jika tidak ketemu
        return rows[0];
    },


    update: async (id, data) => {
        // Pecah data (name, phone) dari parameter object
        const { name, phone } = data;

        const sql = `
            UPDATE users 
            SET name = ?, phone = ? 
            WHERE id = ?
        `;

        // Urutan parameter array harus sesuai tanda tanya di SQL
        const [result] = await dbPool.execute(sql, [name, phone, id]);
        
        return result;
    }
}


export default UserModel;