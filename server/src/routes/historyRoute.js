import express from 'express';
import historyController from '../controllers/historyController.js';

const router = express.Router();

// Endpoint: GET /history/:userId
router.get('/history/:userId', historyController.getHistory);

export default router;