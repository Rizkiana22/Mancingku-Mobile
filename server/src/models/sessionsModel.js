import db from "../config/db.js";

const SessionModel = {
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
            (TIME(NOW()) > s.end_time), -- Logic: Sesi yg lewat ditaruh bawah
            s.start_time
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [spotId]);
    return rows[0]; 
  },

  getOperationalHours: async (spotId) => {
    const sql = "SELECT start_time, end_time FROM spots WHERE id = ?";
    const [rows] = await db.execute(sql, [spotId]);
    return rows[0];
  }
};

export default SessionModel;