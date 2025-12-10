import express from "express";
import {
    getAllFishingGear,
    createFishingGear,
    updateFishingGear,
    deleteFishingGear
} from "../controllers/fishingGearsController.js"; 

const router = express.Router();

// GET: Ambil semua data fishing gear
router.get('/fishingGear', getAllFishingGear);

// POST: Tambah fishing gear baru
router.post('/fishingGear', createFishingGear);

// PUT: Update fishing gear berdasarkan ID
router.put('/fishingGear/:id', updateFishingGear);

// DELETE: Hapus fishing gear berdasarkan ID
router.delete('/fishingGear/:id', deleteFishingGear);

export default router;