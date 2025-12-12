import db from "../config/db.js";

/**
 * BookingModel
 * Kumpulan operasi database untuk tabel `bookings`.
 */
const BookingModel = {

    /**
     * Membuat booking baru.
     * - Validasi session_id
     * - Hitung total_amount berdasarkan harga session x jumlah orang
     * - Simpan data booking dengan status default "pending"
     */
    create: async (data) => {
        // Ambil informasi sesi: waktu dan harga
        const sessionSql = `
            SELECT start_time, end_time, price
            FROM sessions
            WHERE id = ? 
            LIMIT 1
        `;
        const [sessionRows] = await db.execute(sessionSql, [data.session_id]);

        // Jika sesi tidak ditemukan
        if (sessionRows.length === 0) {
            throw new Error("Session not found");
        }

        const session = sessionRows[0];

        // Perhitungan total biaya
        const totalAmount = session.price * data.total_people;

        // Total gears opsional, default 0
        const total_gears = data.total_gears || 0;

        // Query insert booking baru
        const insertSql = `
            INSERT INTO bookings
            (user_id, spot_id, session_id, booking_date, total_people, total_amount, status, created_at, total_gears)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), ?)
        `;

        const [result] = await db.execute(insertSql, [
            data.user_id,
            data.spot_id,
            data.session_id,
            data.booking_date,
            data.total_people,
            totalAmount,
            total_gears
        ]);

        return result;
    },

    /**
     * Mengambil detail booking berdasarkan ID.
     * Termasuk informasi sesi dan spot terkait.
     */
    getById: async (id) => {
        const sql = `
            SELECT 
                b.*,
                s.session_name,
                s.start_time,
                s.end_time,
                sp.name AS spot_name
            FROM bookings b
            JOIN sessions s ON b.session_id = s.id
            JOIN spots sp ON b.spot_id = sp.id
            WHERE b.id = ?
            LIMIT 1
        `;

        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    /**
     * Memperbarui status booking.
     * Biasanya digunakan setelah pembayaran atau pembatalan.
     */
    updateStatus: async (bookingId, status) => {
        const sql = `
            UPDATE bookings 
            SET status = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [status, bookingId]);
        return result;
    },

    /**
     * Mengambil semua booking user dengan status "paid".
     * Dilengkapi data spot dan sesi.
     */
    getByUserIdPaid: async (userId) => {
        const sql = `
            SELECT
                b.id,
                b.booking_date,
                b.total_people,
                b.total_amount,
                b.total_gears,
                b.status,
                sp.name AS spot_name,
                s.session_name,
                s.start_time,
                s.end_time
            FROM bookings b
            JOIN spots sp ON b.spot_id = sp.id
            JOIN sessions s ON b.session_id = s.id
            WHERE b.user_id = ? 
            AND b.status = 'paid'
            ORDER BY b.created_at DESC
        `;

        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }
};

export default BookingModel;
