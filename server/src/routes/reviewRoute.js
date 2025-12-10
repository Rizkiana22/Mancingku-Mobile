import express from "express";
import { createReview, getReviewsBySpot } from "../controllers/reviewController.js";

const router = express.Router();

// POST: Buat review baru
router.post('/review', createReview);

// GET: Ambil review berdasarkan ID Spot
router.get('/review/spot/:spotId', getReviewsBySpot);

export default router;