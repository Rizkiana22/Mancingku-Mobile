import db from "../config/db.js";

/**
 * BookingGearsModel
 * Relasi booking ↔ gear (transaction-aware).
 */
const BookingGearsModel = {

  /**
   * Tambah satu gear ke booking
   * Digunakan DI DALAM TRANSACTION
   */
  create: async (
    { booking_id, gear_id, quantity, price },
    conn = db
  ) => {
    const sql = `
      INSERT INTO booking_gears
      (booking_id, gear_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await conn.execute(sql, [
      booking_id,
      gear_id,
      quantity,
      price,
    ]);

    return result;
  },

  /**
   * Bulk insert gear ke booking
   * Digunakan saat create booking
   */
  bulkCreate: async (bookingId, gears, conn = db) => {
    if (!gears || gears.length === 0) return;

    const values = gears.map(g => [
      bookingId,
      g.gear_id,
      g.quantity,
      g.price,
    ]);

    const sql = `
      INSERT INTO booking_gears
      (booking_id, gear_id, quantity, price)
      VALUES ?
    `;

    const [result] = await conn.query(sql, [values]);
    return result;
  },

  /**
   * Ambil gear berdasarkan booking_id
   */
  getByBookingId: async (bookingId) => {
    const sql = `
      SELECT 
        bg.id,
        bg.quantity,
        bg.price,
        g.id AS gear_id,
        g.name,
        g.description
      FROM booking_gears bg
      JOIN gears g ON g.id = bg.gear_id
      WHERE bg.booking_id = ?
    `;

    const [rows] = await db.execute(sql, [bookingId]);
    return rows;
  },

  /**
   * Hapus semua gear dari booking
   * Biasanya dipakai saat rollback / cancel
   */
  deleteByBookingId: async (bookingId, conn = db) => {
    const sql = `
      DELETE FROM booking_gears
      WHERE booking_id = ?
    `;

    const [result] = await conn.execute(sql, [bookingId]);
    return result;
  },
};

export default BookingGearsModel;