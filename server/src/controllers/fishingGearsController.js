import FishingGearModel from "../models/fishingGearsModel.js";

export const getAllFishingGear = async (req, res) => {
    try {
        const data = await FishingGearModel.getAll();
        res.json(data);
    } catch (error) {
        console.error("Error getting fishing gears:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

export const createFishingGear = async (req, res) => {
    try {
        // Ambil data dari body
        // Kita destructuring agar aman & memastikan key-nya sesuai kolom DB baru (Inggris)
        const { name, image, description, purchase_link } = req.body;
        
        // Buat objek baru yang bersih untuk dikirim ke Model
        const data = {
            name,
            image,
            description,
            purchase_link
        };

        const result = await FishingGearModel.create(data);
        
        res.json({ 
            message: "Fishing gear created successfully", 
            id: result.insertId 
        });
    } catch (error) {
        console.error("Error creating fishing gear:", error);
        res.status(500).json({ message: "Failed to create fishing gear", error });
    }
};

export const updateFishingGear = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Sama seperti create, pastikan key sesuai kolom DB (Inggris)
        const { name, image, description, purchase_link } = req.body;
        
        const data = {
            name,
            image,
            description,
            purchase_link
        };
        
        const result = await FishingGearModel.update(data, id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Fishing gear not found" });
        }

        res.json({ message: "Fishing gear updated successfully" });
    } catch (error) {
        console.error("Error updating fishing gear:", error);
        res.status(500).json({ message: "Failed to update fishing gear", error });
    }
};

export const deleteFishingGear = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await FishingGearModel.delete(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Fishing gear not found" });
        }

        res.json({ message: "Fishing gear deleted successfully" });
    } catch (error) {
        console.error("Error deleting fishing gear:", error);
        res.status(500).json({ message: "Failed to delete fishing gear", error });
    }
};