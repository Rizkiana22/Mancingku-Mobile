import express from "express"
import { getAllSpots, getSpotById, getSpotBySlug, getPopularSpots } from "../controllers/spotsController.js"

const router = express.Router();

router.get('/spots/popular', getPopularSpots);
router.get("/spots/slug/:slug", getSpotBySlug);
router.get('/spots/:id', getSpotById);
router.get('/spots', getAllSpots);

export default router;