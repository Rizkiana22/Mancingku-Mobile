import db from "../config/db.js";

/**
 * FishingGearModel
 * Operasi CRUD untuk tabel `fishing_gears`.
 */
const FishingGearModel = {

    /**
     * Mengambil semua data fishing gear.
     */
    getAll: async () => {
        const sql = "SELECT * FROM fishing_gears";
        const [rows] = await db.execute(sql);
        return rows;
    },

    /**
     * Menambahkan fishing gear baru.
     * Controller harus mengirim object dengan:
     * - name
     * - image
     * - description
     * - purchase_link
     */
    create: async (data) => {
        const sql = `
            INSERT INTO fishing_gears 
            SET ?
        `;
        const [result] = await db.query(sql, data);
        return result;
    },

    /**
     * Memperbarui fishing gear berdasarkan ID.
     * 'data' hanya berisi field yang ingin di-update.
     */
    update: async (data, id) => {
        const sql = `
            UPDATE fishing_gears 
            SET ? 
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [data, id]);
        return result;
    },

    /**
     * Menghapus fishing gear berdasarkan ID.
     */
    delete: async (id) => {
        const sql = `
            DELETE FROM fishing_gears 
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [id]);
        return result;
    }
};

export default FishingGearModel;
