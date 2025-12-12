import FishingGearModel from "../models/fishingGearsModel.js";

/*
    Controller: Mengambil seluruh data fishing gear.
    - Model mengambil data apa adanya dari tabel.
    - Kegagalan query diperlakukan sebagai 500.
*/
export const getAllFishingGear = async (req, res) => {
    try {
        const data = await FishingGearModel.getAll();
        res.json(data);
    } catch (error) {
        console.error("Error getting fishing gears:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

/*
    Controller: Membuat fishing gear baru.
    - Mengambil field yang relevan saja dari body.
    - Objek data dibangun ulang supaya tidak ada field liar yang ikut masuk DB.
*/
export const createFishingGear = async (req, res) => {
    try {
        const { name, image, description, purchase_link } = req.body;

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

/*
    Controller: Mengupdate fishing gear tertentu.
    - Params.id digunakan sebagai primary key target.
    - Field valid disalin ulang untuk menjaga konsistensi bentuk data.
    - Jika affectedRows 0, berarti ID tidak ada di database.
*/
export const updateFishingGear = async (req, res) => {
    try {
        const { id } = req.params;
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

/*
    Controller: Menghapus fishing gear berdasarkan ID.
    - Mengembalikan 404 jika target tidak ditemukan.
*/
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
