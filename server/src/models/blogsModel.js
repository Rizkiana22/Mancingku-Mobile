import db from "../config/db.js";

/**
 * BlogModel
 * Menangani operasi CRUD untuk tabel `blogs`.
 */
const BlogModel = {

    /**
     * Mengambil seluruh blog, diurutkan dari yang terbaru.
     */
    getAll: async () => {
        const sql = `
            SELECT * 
            FROM blogs 
            ORDER BY created_at DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    /**
     * Mengambil satu blog berdasarkan slug.
     */
    getBySlug: async (slug) => {
        const sql = `
            SELECT * 
            FROM blogs 
            WHERE slug = ? 
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [slug]);
        return rows[0];
    },

    /**
     * Membuat blog baru.
     * Controller harus mengirim object data dengan field:
     * - title
     * - slug
     * - image
     * - content
     * - author_id
     */
    create: async (data) => {
        const sql = `
            INSERT INTO blogs 
            SET ?
        `;
        const [result] = await db.query(sql, data);
        return result;
    },

    /**
     * Mengupdate blog berdasarkan ID.
     * Object 'data' hanya berisi field yang ingin diubah.
     */
    update: async (data, id) => {
        const sql = `
            UPDATE blogs 
            SET ? 
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [data, id]);
        return result;
    },

    /**
     * Menghapus blog berdasarkan ID.
     */
    delete: async (id) => {
        const sql = `
            DELETE FROM blogs 
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [id]);
        return result;
    }
};

export default BlogModel;
