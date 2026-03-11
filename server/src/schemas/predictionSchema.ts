import { z } from 'zod';

/**
 * Prediction submission schema
 */
export const submitPredictionSchema = z.object({
  body: z.object({
    matchId: z.string().uuid('Invalid match ID format'),
    homeScore: z.number().int().min(0, 'Score cannot be negative').max(99),
    awayScore: z.number().int().min(0, 'Score cannot be negative').max(99),
  })
});

/**
 * Bonus answer submission schema
 */
export const submitBonusAnswerSchema = z.object({
  body: z.object({
    questionId: z.string().uuid('Invalid question ID format'),
    answer: z.string().trim().min(1, 'Answer cannot be empty').max(500),
  })
});

/**
 * Delete prediction schema
 */
export const deletePredictionSchema = z.object({
  params: z.object({
    matchId: z.string().uuid('Invalid match ID format'),
  })
});
