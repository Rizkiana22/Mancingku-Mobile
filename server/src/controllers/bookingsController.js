import BookingModel from "../models/bookingsModel.js";

export const createBooking = async (req, res) => {
    try {
        const data = req.body;
        
        // Panggil model
        const result = await BookingModel.create(data);

        res.json({
            message: "Booking created successfully",
            bookingId: result.insertId
        });

    } catch (error) {
        if (error.message === "Session not found") {
            return res.status(404).json({ message: "Sesi tidak ditemukan" });
        }

        res.status(500).json({ message: "Server Error saat membuat booking" });
    }
};

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

export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Hardcode status jadi 'paid' sesuai request sebelumnya
        const result = await BookingModel.updateStatus(id, "paid");

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking tidak ditemukan atau tidak ada perubahan" });
        }

        res.json({ message: "Status booking berhasil diupdate menjadi PAID" });

    } catch (error) {
        console.error("UPDATE STATUS ERROR:", error);
        res.status(500).json({ message: "Gagal update status" });
    }
};

export const getByUserIdPaid = async (req, res) => {
    try {
        const { id } = req.params; // userId diambil dari params
        const bookings = await BookingModel.getByUserIdPaid(id);

        res.json(bookings);

    } catch (error) {
        console.error("Error mengambil booking user:", error);
        res.status(500).json({ message: "Gagal mengambil data booking user" });
    }
};