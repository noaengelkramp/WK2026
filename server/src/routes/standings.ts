import { Router } from 'express';
import {
  getIndividualStandings,
  getTopUsers,
  getMyRanking,
} from '../controllers/standingsController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (can view standings without login)
router.get('/individual', optionalAuth, getIndividualStandings);
router.get('/top', optionalAuth, getTopUsers);

// Protected routes (require login)
router.get('/my-ranking', authenticate, getMyRanking);

export default router;
