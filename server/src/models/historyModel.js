import db from "../config/db.js"; // Sesuaikan path config DB kamu

const HistoryModel = {
    // Ambil semua tiket user & otomatis tentukan status (Active/History)
    getByUserId: async (userId) => {
        const query = `
            SELECT 
                b.id,
                s.name AS spot,
                -- Format tanggal jadi: 12 Jan 2024
                DATE_FORMAT(b.booking_date, '%d %b %Y') AS date,
                b.total_amount AS price,
                
                -- Logic Backend: Tentukan Active/History
                CASE 
                    WHEN b.status = 'pending' THEN 'active'
                    WHEN b.status = 'paid' AND b.booking_date >= CURDATE() THEN 'active'
                    ELSE 'history' -- Cancelled atau Tanggal lewat
                END AS status_tab, -- Kita namain status_tab biar beda sama status asli
                
                b.status AS original_status -- Tetap kirim status asli buat warna badge
            FROM bookings b
            JOIN spots s ON b.spot_id = s.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `;

        try {
            const [rows] = await db.execute(query, [userId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
};

export default HistoryModel;