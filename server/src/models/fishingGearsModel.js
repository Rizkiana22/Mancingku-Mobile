import db from "../config/db.js";

const FishingGearModel = {
    getAll: async () => {
        // Menggunakan nama tabel baru: fishing_gears
        const sql = "SELECT * FROM fishing_gears";
        const [rows] = await db.execute(sql);
        return rows;
    },

    create: async (data) => {
        // Pastikan object 'data' yang dikirim dari controller 
        // sudah memiliki key: name, image, description, purchase_link
        const sql = "INSERT INTO fishing_gears SET ?";
        const [result] = await db.query(sql, data);
        return result;
    },

    update: async (data, id) => {
        const sql = "UPDATE fishing_gears SET ? WHERE id = ?";
        const [result] = await db.query(sql, [data, id]);
        return result;
    },

    delete: async (id) => {
        const sql = "DELETE FROM fishing_gears WHERE id = ?";
        const [result] = await db.execute(sql, [id]);
        return result;
    }
};

export default FishingGearModel;