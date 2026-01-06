import express from "express";
import {
  getBookingGearsByBookingId,
  addGearToBooking,
  deleteBookingGears,
} from "../controllers/bookingGearsController.js";

const router = express.Router();

/**
 * GET    /booking-gears/:bookingId
 * POST   /booking-gears
 * DELETE /booking-gears/:bookingId
 */

router.get("/booking-gears/:bookingId", getBookingGearsByBookingId);
router.post("/booking-gears", addGearToBooking);
router.delete("/booking-gears/:bookingId", deleteBookingGears);

export default router;