import express from 'express';
import { getAllBonusQuestions, getBonusQuestionById } from '../controllers/bonusQuestionController';

const router = express.Router();

// GET /api/bonus-questions - Get all active bonus questions
router.get('/', getAllBonusQuestions);

// GET /api/bonus-questions/:id - Get bonus question by ID
router.get('/:id', getBonusQuestionById);

export default router;
