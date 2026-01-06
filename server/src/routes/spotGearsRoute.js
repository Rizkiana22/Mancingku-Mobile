import express from "express";
import {
  getGearsBySpot,
  addGearToSpot,
  removeGearFromSpot,
} from "../controllers/spotGearsController.js";

const router = express.Router();

/**
 * PUBLIC / BOOKING
 */
router.get("/spots/:spotId/gears", getGearsBySpot);

/**
 * ADMIN
 */
router.post("/spot-gears", addGearToSpot);
router.delete("/spot-gears", removeGearFromSpot);

export default router;
