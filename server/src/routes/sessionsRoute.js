import express from "express";
import { getSessionsBySpot, getNextSession, getOperationalHours } from "../controllers/sessionsController.js";

const router = express.Router();

router.get('/sessions/:spotId', getSessionsBySpot);
router.get('/sessions/:spotId/next', getNextSession);
router.get('/sessions/:spotId/operational-hours', getOperationalHours);

export default router;