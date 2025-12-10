import express from "express";
import {
    getAllBaits,
    createBait,
    updateBait,
    deleteBait
} from "../controllers/baitsController.js";

const router = express.Router();

router.get('/bait', getAllBaits);
router.post('/bait', createBait);
router.put('/bait/:id', updateBait);
router.delete('/bait/:id', deleteBait);

export default router;