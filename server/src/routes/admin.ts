import express from 'express';
import { updateMatchResult, getAllMatchesAdmin, updateMatch } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// POST /api/admin/matches/:id/result - Update match result
router.post('/matches/:id/result', updateMatchResult);

// GET /api/admin/matches - Get all matches (admin view)
router.get('/matches', getAllMatchesAdmin);

// PUT /api/admin/matches/:id - Update match details
router.put('/matches/:id', updateMatch);

export default router;
