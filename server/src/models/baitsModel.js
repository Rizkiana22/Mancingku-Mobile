import db from "../config/db.js";

const BaitModel = {
    getAll: async () => {
        const sql = "SELECT * FROM baits";
        const [rows] = await db.execute(sql);
        return rows;
    },

    create: async (data) => {
        const sql = "INSERT INTO baits SET ?";
        const [result] = await db.query(sql, data);
        return result;
    },

    update: async (data, id) => {
        const sql = "UPDATE baits SET ? WHERE id = ?";
        const [result] = await db.query(sql, [data, id]);
        return result;
    },

    delete: async (id) => {
        const sql = "DELETE FROM baits WHERE id = ?";
        const [result] = await db.execute(sql, [id]);
        return result;
    }
};

export default BaitModel;