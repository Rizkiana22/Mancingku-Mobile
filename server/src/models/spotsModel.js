import db from "../config/db.js";

const SpotModel = {
  getAll: async () => {
    const sql = "SELECT * FROM spots";
    const [rows] = await db.execute(sql);
    return rows; 
  },

  getSpotBySlug: async (slug) => {
    const sql = "SELECT * FROM spots WHERE slug = ?";
    const [rows] = await db.execute(sql, [slug]);
    return rows[0]; 
  },

  getSpotById: async (id) => {
    const sql = "SELECT * FROM spots WHERE id = ?";
    const [rows] = await db.execute(sql, [id]);
    return rows[0]; 
  },

  updateRating: async (spotId) => {
    const sql = `
      UPDATE spots 
      SET rating = (
        SELECT AVG(rating) FROM reviews WHERE spot_id = ?
      )
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [spotId, spotId]);
    return result;
  },

  getSpotFacilities: async (spotId) => {
    const sql = `
      SELECT f.id, f.name, f.icon 
      FROM spot_facilities sf
      JOIN facilities f ON f.id = sf.facility_id
      WHERE sf.spot_id = ?
    `;
    const [rows] = await db.execute(sql, [spotId]);
    return rows; 
  },
};

export default SpotModel;