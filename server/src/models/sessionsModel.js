import db from "../config/db.js";

/**
 * SessionModel
 * Mengelola data sesi pemancingan untuk setiap spot.
 * Termasuk perhitungan kursi tersisa, sesi berikutnya, dan jam operasional.
 */
export const SessionModel = {

  /**
   * Mengambil semua sesi untuk satu spot berdasarkan tanggal tertentu.
   * Jika parameter `date` tidak diberikan, sistem otomatis memakai tanggal hari ini.
   *
   * Perhitungan seats_left:
   *   seats_left = capacity - jumlah booking yang statusnya pending/paid pada tanggal tersebut.
   */
  getAllBySpot: async (spotId, date = null) => {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const sql = `
        SELECT 
            s.*,
            (s.capacity - COALESCE(SUM(b.total_people), 0)) AS seats_left
        FROM sessions s
        LEFT JOIN bookings b ON 
            b.session_id = s.id 
            AND b.status IN ('pending', 'paid')
            AND b.booking_date = ?
        WHERE s.spot_id = ?
        GROUP BY s.id
        ORDER BY s.start_time ASC
    `;

    const [rows] = await db.execute(sql, [targetDate, spotId]);
    return rows;
  },

  /**
   * Mengambil sesi berikutnya yang relevan untuk hari ini.
   * Logika pemilihan:
   *   - Jika waktu sekarang sudah lewat end_time sesi, sesi itu ditaruh ke bagian bawah.
   *   - Mengurutkan berdasarkan sesi yang masih berjalan/akan datang.
   *   - Mengambil hanya 1 sesi (LIMIT 1).
   *
   * Perhitungan seats_left sama seperti getAllBySpot tetapi menggunakan tanggal hari ini (CURDATE).
   */
  getNextSession: async (spotId) => {
    const sql = `
        SELECT 
            s.*,
            (s.capacity - COALESCE(SUM(b.total_people), 0)) AS seats_left
        FROM sessions s
        LEFT JOIN bookings b ON 
            b.session_id = s.id 
            AND b.status IN ('pending', 'paid')
            AND b.booking_date = CURDATE()
        WHERE s.spot_id = ?
        GROUP BY s.id
        ORDER BY 
            (TIME(NOW()) > s.end_time),  -- Sesi yang sudah lewat dipindah ke bawah
            s.start_time
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [spotId]);
    return rows[0];
  },

  /**
   * Ambil session sederhana untuk proses booking
   * (transaction-safe)
   */
  getById: async (id, conn = db) => {
    const sql = `
      SELECT id, spot_id, price
      FROM sessions
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await conn.execute(sql, [id]);
    return rows[0];
  },


  getDetailById: async (sessionId, date = null) => {
    const targetDate = date || new Date().toISOString().split("T")[0];

    const sql = `
      SELECT 
        s.id,
        s.session_name,
        s.start_time,
        s.end_time,
        s.price,
        s.capacity,
        sp.id AS spot_id,
        sp.name AS spot_name,
        sp.address,
        (s.capacity - COALESCE(SUM(b.total_people), 0)) AS seats_left
      FROM sessions s
      JOIN spots sp ON sp.id = s.spot_id
      LEFT JOIN bookings b 
        ON b.session_id = s.id
        AND b.status IN ('pending', 'paid')
        AND b.booking_date = ?
      WHERE s.id = ?
      GROUP BY s.id
      LIMIT 1
    `;
    const [rows] = await db.execute(sql, [targetDate, sessionId]);
    // console.log("QUERY RESULT:", rows);
    return rows[0];
    
  },
};

export default SessionModel;
