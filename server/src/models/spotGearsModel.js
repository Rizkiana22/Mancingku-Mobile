import db from "../config/db.js";

/**
 * SpotGearModel
 * Relasi many-to-many antara spot dan gear
 */
const SpotGearModel = {
  /**
   * Cek apakah gear tersedia di spot tertentu
   */
  exists: async (spotId, gearId, conn = db) => {
    const sql = `
      SELECT 1
      FROM spot_gears
      WHERE spot_id = ? AND gear_id = ?
      LIMIT 1
    `;
    const [rows] = await conn.execute(sql, [spotId, gearId]);
    return rows.length > 0;
  },

  /**
   * Ambil semua gear milik satu spot
   * (dipakai di booking / frontend)
   */
  getBySpotId: async (spotId) => {
    const sql = `
      SELECT 
        g.id,
        g.name,
        g.description,
        g.stock,
        g.price
      FROM spot_gears sg
      JOIN gears g ON g.id = sg.gear_id
      WHERE sg.spot_id = ?
      ORDER BY g.name
    `;
    const [rows] = await db.execute(sql, [spotId]);
    return rows;
  },

  /**
   * Assign gear ke spot (admin)
   */
  create: async ({ spot_id, gear_id }) => {
    const sql = `
      INSERT INTO spot_gears (spot_id, gear_id)
      VALUES (?, ?)
    `;
    const [result] = await db.execute(sql, [spot_id, gear_id]);
    return result;
  },

  /**
   * Hapus gear dari spot (admin)
   */
  delete: async (spot_id, gear_id) => {
    const sql = `
      DELETE FROM spot_gears
      WHERE spot_id = ? AND gear_id = ?
    `;
    const [result] = await db.execute(sql, [spot_id, gear_id]);
    return result;
  },
};

export default SpotGearModel;