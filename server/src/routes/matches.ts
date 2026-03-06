import { Router } from 'express';
import { getAllMatches, getMatchById, getUpcomingMatches, getTournamentStatistics, getPredictionStatistics } from '../controllers/matchController';

const router = Router();

router.get('/', getAllMatches);
router.get('/upcoming', getUpcomingMatches);
router.get('/statistics', getTournamentStatistics);
router.get('/prediction-stats', getPredictionStatistics);
router.get('/:id', getMatchById);

export default router;
