import db from "../config/db.js";

/**
 * BaitModel
 * Menyediakan operasi CRUD untuk tabel `baits`.
 */
const BaitModel = {

    /**
     * Mengambil seluruh data umpan (baits).
     */
    getAll: async () => {
        const sql = `
            SELECT * 
            FROM baits
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    /**
     * Menambahkan data umpan baru.
     * Controller wajib mengirim object 'data' dengan field:
     * - name
     * - image
     * - description
     * - price
     */
    create: async (data) => {
        const sql = `
            INSERT INTO baits 
            SET ?
        `;
        const [result] = await db.query(sql, data);
        return result;
    },

    /**
     * Mengupdate data umpan berdasarkan ID.
     * Object 'data' hanya berisi field yang ingin diubah.
     */
    update: async (data, id) => {
        const sql = `
            UPDATE baits 
            SET ? 
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [data, id]);
        return result;
    },

    /**
     * Menghapus data umpan berdasarkan ID.
     */
    delete: async (id) => {
        const sql = `
            DELETE FROM baits 
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [id]);
        return result;
    }
};

export default BaitModel;
