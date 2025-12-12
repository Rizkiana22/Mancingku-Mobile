import BaitModel from "../models/baitsModel.js";

/**
 * GET /baits
 * Mengambil semua bait dari database.
 */
export const getAllBaits = async (req, res) => {
    try {
        const data = await BaitModel.getAll();
        res.json(data);
    } catch (error) {
        console.error("Error getting baits:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

/**
 * POST /baits
 * Membuat bait baru berdasarkan body request.
 */
export const createBait = async (req, res) => {
    try {
        // Ambil field sesuai struktur tabel
        const { name, image, description, purchase_link } = req.body;
        
        const data = {
            name,
            image,
            description,
            purchase_link
        };

        const result = await BaitModel.create(data);
        
        res.json({ 
            message: "Bait created successfully",
            id: result.insertId
        });
    } catch (error) {
        console.error("Error creating bait:", error);
        res.status(500).json({ message: "Failed to create bait", error });
    }
};

/**
 * PUT /baits/:id
 * Mengupdate bait berdasarkan ID dari URL params.
 */
export const updateBait = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, description, purchase_link } = req.body;
        
        const data = {
            name,
            image,
            description,
            purchase_link
        };
        
        const result = await BaitModel.update(data, id);

        // Cek apakah ID ada di database
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Bait not found" });
        }

        res.json({ message: "Bait updated successfully" });
    } catch (error) {
        console.error("Error updating bait:", error);
        res.status(500).json({ message: "Failed to update bait", error });
    }
};

/**
 * DELETE /baits/:id
 * Menghapus bait berdasarkan ID.
 */
export const deleteBait = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await BaitModel.delete(id);

        // Kalau affectedRows = 0 berarti ID-nya tidak valid
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Bait not found" });
        }

        res.json({ message: "Bait deleted successfully" });
    } catch (error) {
        console.error("Error deleting bait:", error);
        res.status(500).json({ message: "Failed to delete bait", error });
    }
};
