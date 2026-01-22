import { Router } from 'express';
import {
  getMyPredictions,
  submitPrediction,
  submitBonusAnswer,
  getMyStatistics,
  deletePrediction,
} from '../controllers/predictionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All prediction routes require authentication
router.use(authenticate);

// Get current user's predictions
router.get('/my', getMyPredictions);

// Get current user's statistics
router.get('/my/statistics', getMyStatistics);

// Submit or update a prediction
router.post('/', submitPrediction);

// Submit or update bonus answer
router.post('/bonus', submitBonusAnswer);

// Delete a prediction
router.delete('/:matchId', deletePrediction);

export default router;
