import express from "express";
import {
  getAllGears,
  getGearById,
  getGearsBySpot,
  createGear,
  updateGear,
  deleteGear,
} from "../controllers/gearsController.js";

const router = express.Router();

/**
 * GET    /fishingGear
 * GET    /fishingGear/:id
 * POST   /fishingGear
 * PUT    /fishingGear/:id
 * DELETE /fishingGear/:id
 */
router.get("/gears", getAllGears);
router.get("/gears/:id", getGearById);
router.get("/spots/:spotId/gears", getGearsBySpot);
router.post("/gears", createGear);
router.put("/gears/:id", updateGear);
router.delete("/gears/:id", deleteGear);

export default router;
