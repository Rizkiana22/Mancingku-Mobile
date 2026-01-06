import BookingGearsModel from "../models/bookingGearsModel.js";

/**
 * Mengambil daftar peralatan yang disewa dalam satu booking
 */
export const getBookingGearsByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    const results =
      await BookingGearsModel.getByBookingId(bookingId);

    res.json(results);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data peralatan booking" });
  }
};

/**
 * Menambahkan gear ke booking (single insert)
 * Biasanya untuk admin atau extend booking
 */
export const addGearToBooking = async (req, res) => {
  try {
    const { booking_id, gear_id, quantity, price } = req.body;

    if (!booking_id || !gear_id || !quantity || !price) {
      return res
        .status(400)
        .json({ message: "Data tidak lengkap" });
    }

    await BookingGearsModel.create({
      booking_id,
      gear_id,
      quantity,
      price,
    });

    res.status(201).json({ message: "Peralatan berhasil ditambahkan" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan peralatan booking" });
  }
};

/**
 * Menghapus seluruh peralatan dari booking
 */
export const deleteBookingGears = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    await BookingGearsModel.deleteByBookingId(bookingId);

    res.json({ message: "Peralatan booking berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menghapus peralatan booking" });
  }
};