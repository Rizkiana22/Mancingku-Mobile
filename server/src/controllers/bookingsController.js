import db from "../config/db.js";
import BookingModel from "../models/bookingsModel.js";
import BookingGearsModel from "../models/bookingGearsModel.js";
import GearsModel from "../models/gearsModel.js";
import SessionModel from "../models/sessionsModel.js";
import SpotGearModel from "../models/spotGearsModel.js";

export const createBooking = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const userId = req.user.id;
    const { session_id, booking_date, total_people, gears = [] } = req.body;

    if (!session_id || !booking_date || total_people <= 0) {
      return res.status(400).json({ message: "Data booking tidak valid" });
    }

    await conn.beginTransaction();

    // 1. Ambil session (WAJIB)
    const session = await SessionModel.getById(session_id, conn);
    if (!session) {
      throw new Error("Session tidak ditemukan");
    }

    // 2. Buat booking
    const bookingResult = await BookingModel.create(
      {
        user_id: userId,
        session_id,
        booking_date,
        total_people,
      },
      conn
    );

    const bookingId = bookingResult.insertId;

    let totalGears = 0;
    let totalGearPrice = 0;

    // 3. Proses gear
    for (const g of gears) {
      if (!g.gear_id || g.quantity <= 0) continue;

      const gear = await GearsModel.getById(g.gear_id, conn);
      if (!gear) {
        throw new Error("Gear tidak ditemukan");
      }

      // Validasi gear milik spot
      const exists = await SpotGearModel.exists(
        session.spot_id,
        gear.id,
        conn
      );

      if (!exists) {
        throw new Error("Gear tidak tersedia untuk spot ini");
      }

      // Kurangi stok
      await GearsModel.reduceStock(gear.id, g.quantity, conn);

      // Simpan snapshot booking gear
      await BookingGearsModel.create(
        {
          booking_id: bookingId,
          gear_id: gear.id,
          quantity: g.quantity,
          price: gear.price,
        },
        conn
      );

      totalGears += g.quantity;
      totalGearPrice += gear.price * g.quantity;
    }

    // 4. Update total booking
    const totalAmount =
      session.price * total_people + totalGearPrice;

    await BookingModel.updateTotals(
      bookingId,
      {
        total_amount: totalAmount,
        total_gears: totalGears,
      },
      conn
    );

    await conn.commit();

    res.status(201).json({
      message: "Booking berhasil dibuat",
      bookingId,
    });

  } catch (error) {
    await conn.rollback();
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
};

/*
    Controller: Mendapatkan booking berdasarkan ID.
    - Jika booking tidak ada, kembalikan 404.
    - Mengirimkan seluruh detail booking apa adanya.
*/
export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await BookingModel.getById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking tidak ditemukan" });
        }

        res.json(booking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

/*
    Controller: Update status booking menjadi 'paid'.
    - Menggunakan param id dari URL.
    - Status di-hardcode sesuai kebutuhan proses pembayaran.
    - Jika tidak ada baris yang terpengaruh, berarti ID tidak valid.
*/
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await BookingModel.getById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    // ⛔ Cek kepemilikan
    if (booking.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    if (booking.status === "paid") {
      return res.json({ message: "Booking sudah dibayar" });
    }

    await BookingModel.updateStatus(id, "paid");

    res.json({ message: "Pembayaran berhasil" });

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Gagal update status" });
  }
};


/*
    Controller: Mengambil semua booking 'paid' milik user tertentu.
    - ID user diambil dari req.params.
    - Tidak ada validasi ketat karena hanya read-only.
*/
export const getByUserIdPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const bookings = await BookingModel.getByUserIdPaid(id);

        res.json(bookings);

    } catch (error) {
        console.error("Error mengambil booking user:", error);
        res.status(500).json({ message: "Gagal mengambil data booking user" });
    }
};
