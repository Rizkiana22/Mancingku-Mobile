import express from "express";
import verifyToken from "../middleware/authUser.js";

import { createBooking, updateStatus, getBookingById, getByUserIdPaid } from "../controllers/bookingsController.js";

const router = express.Router();

router.post('/booking', verifyToken, createBooking);
router.get('/booking/:id', verifyToken, getBookingById);
router.patch('/booking/:id/pay', updateStatus);
router.get('/booking/user/:id', verifyToken, getByUserIdPaid);

export default router;