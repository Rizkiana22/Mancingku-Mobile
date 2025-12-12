import db from "../config/db.js";

/**
 * ReviewModel
 * Mengelola data ulasan (review) untuk setiap spot pemancingan.
 * Mencakup pembuatan review baru, pengambilan daftar review,
 * dan perhitungan rating rata-rata.
 */
const ReviewModel = {

    /**
     * Membuat review baru.
     * Field created_at diisi otomatis oleh database menggunakan NOW().
     *
     * Parameter:
     *   data = { user_id, spot_id, rating, comment }
     * 
     * Catatan keamanan:
     *   - Validasi rating (1–5) sebaiknya dilakukan di controller.
     *   - Pastikan user memang punya akses memberikan review untuk spot tersebut.
     */
    create: async (data) => {
        const sql = `
            INSERT INTO reviews 
            (user_id, spot_id, rating, comment, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;
        
        const [result] = await db.execute(sql, [
            data.user_id,
            data.spot_id,
            data.rating,
            data.comment
        ]);
        
        return result;
    },

    /**
     * Mengambil semua review untuk satu spot.
     * Mengembalikan daftar review terbaru terlebih dahulu.
     *
     * SUBSTRING_INDEX digunakan untuk menampilkan username
     * dengan cara memotong bagian sebelum '@' dari email.
     * Contoh: "andi@gmail.com" -> "andi"
     *
     * Ini umum dipakai untuk menyembunyikan informasi sensitif user.
     */
    getBySpot: async (spotId) => {
        const sql = `
            SELECT 
                reviews.*, 
                SUBSTRING_INDEX(users.email, '@', 1) AS user_name
            FROM reviews
            JOIN users ON reviews.user_id = users.id
            WHERE reviews.spot_id = ?
            ORDER BY reviews.created_at DESC
        `;
        
        const [rows] = await db.execute(sql, [spotId]);
        return rows;
    },

    /**
     * Mengambil nilai rata-rata rating untuk spot tertentu.
     * Mengembalikan satu angka (float) atau null jika belum ada review.
     */
    getAverageRating: async (spot_id) => {
        const sql = `
            SELECT AVG(rating) AS avg_rating 
            FROM reviews 
            WHERE spot_id = ?
        `;
        
        const [rows] = await db.execute(sql, [spot_id]);
        
        // rows[0].avg_rating berisi nilai float atau null
        return rows[0].avg_rating;
    }
};

export default ReviewModel;
