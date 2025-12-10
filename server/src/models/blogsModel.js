import db from "../config/db.js";

const BlogModel = {
    getAll: async () => {
        const sql = "SELECT * FROM blogs ORDER BY created_at DESC";
        const [rows] = await db.execute(sql);
        return rows;
    },

    getBySlug: async (slug) => {
        const sql = "SELECT * FROM blogs WHERE slug = ? LIMIT 1";
        const [rows] = await db.execute(sql, [slug]);
        return rows[0];
    },

    create: async (data) => {
        // Menggunakan db.query untuk mendukung syntax 'SET ?'
        const sql = "INSERT INTO blogs SET ?";
        const [result] = await db.query(sql, data);
        return result;
    },

    update: async (data, id) => {
        const sql = "UPDATE blogs SET ? WHERE id = ?";
        const [result] = await db.query(sql, [data, id]);
        return result;
    },

    delete: async (id) => {
        const sql = "DELETE FROM blogs WHERE id = ?";
        const [result] = await db.execute(sql, [id]);
        return result;
    }
};

export default BlogModel;