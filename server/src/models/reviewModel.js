import db from "../config/db.js";

const ReviewModel = {
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

    getAverageRating: async (spot_id) => {
        const sql = `SELECT AVG(rating) AS avg_rating FROM reviews WHERE spot_id = ?`;
        const [rows] = await db.execute(sql, [spot_id]);
        return rows[0].avg_rating; // Langsung kembalikan nilai rata-ratanya
    }
};

export default ReviewModel;