import express from 'express';
import { getAllScoringRules, getScoringRuleByStage } from '../controllers/scoringRuleController';

const router = express.Router();

// GET /api/scoring-rules - Get all scoring rules
router.get('/', getAllScoringRules);

// GET /api/scoring-rules/:stage - Get scoring rule by stage
router.get('/:stage', getScoringRuleByStage);

export default router;
