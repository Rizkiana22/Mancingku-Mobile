import BookingModel from "../models/bookingsModel.js";

/*
    Controller: Membuat booking baru.
    - Data langsung diambil dari body request.
    - Model akan menangani validasi lanjutan (misal: sesi tidak ditemukan).
    - Jika sukses, kembalikan insertId untuk keperluan tracking di client.
*/
export const createBooking = async (req, res) => {
    try {
        const data = req.body;
        
        const result = await BookingModel.create(data);

        res.json({
            message: "Booking created successfully",
            bookingId: result.insertId
        });

    } catch (error) {
        // Error khusus jika sesi booking tidak valid
        if (error.message === "Session not found") {
            return res.status(404).json({ message: "Sesi tidak ditemukan" });
        }

        res.status(500).json({ message: "Server Error saat membuat booking" });
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

        const result = await BookingModel.updateStatus(id, "paid");

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Booking tidak ditemukan atau tidak ada perubahan"
            });
        }

        res.json({ message: "Status booking berhasil diupdate menjadi PAID" });

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
