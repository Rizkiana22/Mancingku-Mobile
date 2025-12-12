import db from "../config/db.js";

/**
 * SpotModel
 * Berisi fungsi-fungsi untuk mengelola data spot pemancingan.
 * Seluruh query menggunakan prepared statements untuk mencegah SQL injection.
 */
const SpotModel = {

  /**
   * Mengambil seluruh data spot.
   * Biasanya digunakan untuk listing semua lokasi pemancingan.
   */
  getAll: async () => {
    const sql = "SELECT * FROM spots";
    const [rows] = await db.execute(sql);
    return rows;
  },

  /**
   * Mengambil detail spot berdasarkan slug.
   * Slug digunakan untuk URL yang lebih ramah dan aman dibanding ID.
   */
  getSpotBySlug: async (slug) => {
    const sql = "SELECT * FROM spots WHERE slug = ?";
    const [rows] = await db.execute(sql, [slug]);
    return rows[0]; // Ambil satu hasil saja
  },

  /**
   * Mengambil detail spot berdasarkan ID.
   * Umumnya digunakan untuk proses internal, admin panel, atau update data.
   */
  getSpotById: async (id) => {
    const sql = "SELECT * FROM spots WHERE id = ?";
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  /**
   * Menghitung ulang rating spot berdasarkan rata-rata rating dari tabel reviews.
   * Fungsi ini dipanggil setelah user memberikan review.
   */
  updateRating: async (spotId) => {
    const sql = `
      UPDATE spots 
      SET rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE spot_id = ?
      )
      WHERE id = ?
    `;

    // Menggunakan spotId dua kali: pertama untuk subquery, kedua untuk update
    const [result] = await db.execute(sql, [spotId, spotId]);
    return result;
  },

  /**
   * Mengambil daftar fasilitas yang dimiliki suatu spot.
   * Menggunakan relasi dari tabel spot_facilities ke tabel facilities.
   */
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
