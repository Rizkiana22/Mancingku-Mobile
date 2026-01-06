import SpotGearModel from "../models/spotGearsModel.js";

/**
 * Ambil semua gear yang tersedia di satu spot
 * GET /spots/:spotId/gears
 */
export const getGearsBySpot = async (req, res) => {
  try {
    const { spotId } = req.params;

    if (!spotId) {
      return res.status(400).json({ message: "spotId wajib" });
    }

    const gears = await SpotGearModel.getBySpotId(spotId);
    res.json(gears);
  } catch (error) {
    console.error("GET GEARS BY SPOT ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil gear spot" });
  }
};

/**
 * Assign gear ke spot (admin)
 * POST /spot-gears
 */
export const addGearToSpot = async (req, res) => {
  try {
    const { spot_id, gear_id } = req.body;

    if (!spot_id || !gear_id) {
      return res.status(400).json({ message: "spot_id dan gear_id wajib" });
    }

    await SpotGearModel.create({ spot_id, gear_id });

    res.status(201).json({
      message: "Gear berhasil ditambahkan ke spot",
    });
  } catch (error) {
    console.error("ADD GEAR TO SPOT ERROR:", error);
    res.status(500).json({ message: "Gagal menambahkan gear ke spot" });
  }
};

/**
 * Hapus gear dari spot (admin)
 * DELETE /spot-gears
 */
export const removeGearFromSpot = async (req, res) => {
  try {
    const { spot_id, gear_id } = req.body;

    if (!spot_id || !gear_id) {
      return res.status(400).json({ message: "spot_id dan gear_id wajib" });
    }

    await SpotGearModel.delete(spot_id, gear_id);

    res.json({
      message: "Gear berhasil dihapus dari spot",
    });
  } catch (error) {
    console.error("REMOVE GEAR FROM SPOT ERROR:", error);
    res.status(500).json({ message: "Gagal menghapus gear dari spot" });
  }
};