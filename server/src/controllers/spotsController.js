import spotModel from "../models/spotsModel.js";

export const getAllSpots = async (req, res) => {
    try {
        const results = await spotModel.getAll();
        res.send(results);
    } catch {
        res.status(500).json({ message: "Gagal mengambil data spot "});
    }
}

export const getSpotById = async (req, res) => {
    try {
        const spotId = req.params.id;
        const results = await spotModel.getSpotById(spotId);

        if(!results) {
            return res.status(404).json({ message: "Spot tidak ditemukan "});
        }

        res.send(results);
    } catch {
        res.status(500).json({ message: "Gagal mengambil data spot "});
    }
}

export const getSpotBySlug = async (req, res) => {
    try {
        const spotSlug = req.params.slug;

        const resultSpot = await spotModel.getSpotBySlug(spotSlug);
        
        if(!resultSpot) {
            return res.status(404).json({ message: "Spot tidak ditemukan" });
        }
        const spotId = resultSpot.id;
        const resultFacilities = await spotModel.getSpotFacilities(spotId);

        const results = {
            ...resultSpot,
            fasilitas: resultFacilities
        };

        res.send(results);
    } catch {
        res.status(500).json({ message: "Gagal mengambil data spot "});
    }
}

