import db from "../config/db.js";

/**
 * GearsModel
 * Mengelola master data peralatan pancing.
 * Digunakan oleh admin, booking, dan invoice.
 */
const GearsModel = {
  /**
   * Ambil semua gear
   */
  getAll: async () => {
    const sql = `
      SELECT id, name, description, stock, price
      FROM gears
      ORDER BY name ASC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  /**
   * Ambil gear berdasarkan ID
   * Digunakan oleh proses booking
   */
  getById: async (id, conn = db) => {
    const sql = `
      SELECT id, name, description, stock, price
      FROM gears
      WHERE id = ?
      FOR UPDATE
    `;
    const [rows] = await conn.execute(sql, [id]);
    return rows[0];
  },

  /**
   * Ambil semua gear berdasarkan spot
   */
  getBySpotId: async (spotId) => {
    const sql = `
      SELECT g.id, g.name, g.description, g.stock, g.price
      FROM spot_gears sg
      JOIN gears g ON g.id = sg.gear_id
      WHERE sg.spot_id = ?
      ORDER BY g.name
    `;
    const [rows] = await db.execute(sql, [spotId]);
    return rows;
  },



  /**
   * Buat gear baru
   */
  create: async ({ name, description, stock, price }) => {
    const sql = `
      INSERT INTO gears (name, description, stock, price)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      name,
      description,
      stock,
      price,
    ]);
    return result;
  },

  /**
   * Update gear
   */
  update: async (id, { name, description, stock, price }) => {
    const sql = `
      UPDATE gears
      SET name = ?, description = ?, stock = ?, price = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [
      name,
      description,
      stock,
      price,
      id,
    ]);
    return result;
  },

  /**
   * Kurangi stok gear
   * WAJIB dipanggil di dalam TRANSACTION
   */
  reduceStock: async (id, quantity, conn = db) => {
    const sql = `
      UPDATE gears
      SET stock = stock - ?
      WHERE id = ? AND stock >= ?
    `;
    const [result] = await conn.execute(sql, [
      quantity,
      id,
      quantity,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Stok gear tidak mencukupi");
    }

    return result;
  },

  /**
   * Hapus gear
   */
  delete: async (id) => {
    const sql = `DELETE FROM gears WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result;
  },
};

export default GearsModel;
