import BaitModel from "../models/baitsModel.js";

export const getAllBaits = async (req, res) => {
    try {
        const data = await BaitModel.getAll();
        res.json(data);
    } catch (error) {
        console.error("Error getting baits:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

export const createBait = async (req, res) => {
    try {
        // Destructuring body agar aman & sesuai kolom DB
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

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Bait not found" });
        }

        res.json({ message: "Bait updated successfully" });
    } catch (error) {
        console.error("Error updating bait:", error);
        res.status(500).json({ message: "Failed to update bait", error });
    }
};

export const deleteBait = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await BaitModel.delete(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Bait not found" });
        }

        res.json({ message: "Bait deleted successfully" });
    } catch (error) {
        console.error("Error deleting bait:", error);
        res.status(500).json({ message: "Failed to delete bait", error });
    }
};