import dbPool from "../config/db.js"

/**
 * UserModel
 * Berisi fungsi-fungsi untuk berinteraksi dengan tabel `users`
 * menggunakan query SQL berbasis prepared statements.
 */
const UserModel = {

    /**
     * Membuat user baru di database.
     * Data yang diterima seharusnya sudah divalidasi dan password
     * sudah di-hash di level controller atau service.
     */
    create: async (data) => {
        const { name, email, password, phone, role } = data;

        // Jika tidak ada role, secara default user akan menjadi 'user'
        const userRole = role || 'user';

        const sql = `
            INSERT INTO users (name, email, password, phone, role) 
            VALUES (?, ?, ?, ?, ?)
        `;

        // Eksekusi query dengan prepared statement untuk mencegah SQL injection
        const [result] = await dbPool.execute(sql, [
            name,
            email,
            password, // Sudah dalam bentuk hashed dari controller
            phone,
            userRole
        ]);

        return result;
    },


    /**
     * Mengambil data user berdasarkan ID.
     * Mengembalikan object user atau undefined jika ID tidak ditemukan.
     */
    findById: async (id) => {
        const sql = `
            SELECT id, email, name, phone 
            FROM users 
            WHERE id = ?
        `;
        
        // Mengambil baris hasil query, destructuring supaya langsung dapat array rows
        const [rows] = await dbPool.execute(sql, [id]);

        // Hanya ambil baris pertama karena ID bersifat unik
        return rows[0];
    },


    /**
     * Memperbarui data user berdasarkan ID.
     * Hanya field name dan phone yang diperbolehkan di-update
     * agar tidak terjadi perubahan role atau email sembarangan.
     */
    update: async (id, data) => {
        const { name, phone } = data;

        const sql = `
            UPDATE users 
            SET name = ?, phone = ? 
            WHERE id = ?
        `;

        // Parameter pada array wajib sesuai urutan tanda tanya pada query
        const [result] = await dbPool.execute(sql, [name, phone, id]);
        
        return result;
    }
}

export default UserModel;
