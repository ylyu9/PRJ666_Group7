import express from 'express';
import { chatWithAI } from '../controllers/ai.controllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, chatWithAI);

export default router; 