import express from "express"
import { getAllSpots, getSpotById, getSpotBySlug } from "../controllers/spotsController.js"

const router = express.Router();

router.get('/spots', getAllSpots);
router.get('/spots/:id', getSpotById);
router.get("/spots/slug/:slug", getSpotBySlug);

export default router;