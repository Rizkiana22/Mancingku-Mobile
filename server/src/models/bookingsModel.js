import db from "../config/db.js";

/**
 * BookingModel
 * Operasi database untuk tabel bookings (transaction-aware).
 */
const BookingModel = {

  /**
   * Create booking (TANPA hitung harga).
   * Dipanggil di dalam TRANSACTION.
   */
  create: async (data, conn = db) => {
    // Ambil spot_id dari session
    const sessionSql = `
      SELECT spot_id, price
      FROM sessions
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
    `;

    const [sessionRows] = await conn.execute(
      sessionSql,
      [data.session_id]
    );

    if (sessionRows.length === 0) {
      throw new Error("Session tidak ditemukan");
    }

    const session = sessionRows[0];

    const insertSql = `
      INSERT INTO bookings
      (user_id, spot_id, session_id, booking_date, total_people, total_amount, total_gears, status, created_at)
      VALUES (?, ?, ?, ?, ?, 0, 0, 'pending', NOW())
    `;

    const [result] = await conn.execute(insertSql, [
      data.user_id,
      session.spot_id,
      data.session_id,
      data.booking_date,
      data.total_people,
    ]);

    return {
      insertId: result.insertId,
      sessionPrice: session.price,
    };
  },

  /**
   * Update total_amount dan total_gears
   */
  updateTotals: async (
    bookingId,
    { total_amount, total_gears },
    conn = db
  ) => {
    const sql = `
      UPDATE bookings
      SET total_amount = ?, total_gears = ?
      WHERE id = ?
    `;

    const [result] = await conn.execute(sql, [
      total_amount,
      total_gears,
      bookingId,
    ]);

    return result;
  },

  /**
   * Ambil detail booking
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
   * Update status booking
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
   * Ambil booking paid milik user
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
  },
};

export default BookingModel;
