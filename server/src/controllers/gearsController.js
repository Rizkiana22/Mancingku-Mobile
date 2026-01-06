import GearsModel from "../models/gearsModel.js";

/**
 * Ambil semua gear
 */
export const getAllGears = async (req, res) => {
  try {
    const gears = await GearsModel.getAll();
    console.log("GEARS FROM DB:", gears)
    res.json(gears);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data gear" });
  }
};

/**
 * Ambil gear berdasarkan ID
 */
export const getGearById = async (req, res) => {
  try {
    const { id } = req.params;
    const gear = await GearsModel.getById(id);

    if (!gear) {
      return res.status(404).json({ message: "Gear tidak ditemukan" });
    }

    res.json(gear);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil detail gear" });
  }
};

/**
 * Ambil semua gear untuk satu spot
 */
export const getGearsBySpot = async (req, res) => {
  try {
    const { spotId } = req.params;
    const gears = await GearsModel.getBySpotId(spotId);
    res.json(gears);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil gear spot" });
  }
};


/**
 * Tambah gear baru
 * (biasanya admin)
 */
export const createGear = async (req, res) => {
  try {
    const { name, description, stock, price } = req.body;

    if (!name || stock == null || price == null) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    await GearsModel.create({
      name,
      description,
      stock,
      price,
    });

    res.status(201).json({ message: "Gear berhasil ditambahkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menambahkan gear" });
  }
};

/**
 * Update gear
 */
export const updateGear = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await GearsModel.update(id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Gear tidak ditemukan" });
    }

    res.json({ message: "Gear berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memperbarui gear" });
  }
};

/**
 * Hapus gear
 */
export const deleteGear = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await GearsModel.delete(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Gear tidak ditemukan" });
    }

    res.json({ message: "Gear berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus gear" });
  }
};