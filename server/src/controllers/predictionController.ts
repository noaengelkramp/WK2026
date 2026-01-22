import { Request, Response } from 'express';
import { Prediction, Match, Team, BonusAnswer, BonusQuestion } from '../models';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config/environment';

/**
 * Get current user's predictions
 */
export const getMyPredictions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Get all match predictions
    const predictions = await Prediction.findAll({
      where: { userId },
      include: [
        {
          model: Match,
          as: 'match',
          include: [
            { model: Team, as: 'homeTeam' },
            { model: Team, as: 'awayTeam' },
          ],
        },
      ],
      order: [['match', 'matchDate', 'ASC']],
    });

    // Get bonus answers
    const bonusAnswers = await BonusAnswer.findAll({
      where: { userId },
      include: [{ model: BonusQuestion, as: 'question' }],
    });

    res.json({
      predictions,
      bonusAnswers,
      totalPredictions: predictions.length,
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw new AppError('Failed to fetch predictions', 500);
  }
};

/**
 * Submit or update a match prediction
 */
export const submitPrediction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { matchId, homeScore, awayScore } = req.body;

    // Validate input
    if (!matchId || homeScore === undefined || awayScore === undefined) {
      throw new AppError('Match ID, home score, and away score are required', 400);
    }

    if (homeScore < 0 || awayScore < 0) {
      throw new AppError('Scores cannot be negative', 400);
    }

    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
      throw new AppError('Scores must be integers', 400);
    }

    // Check if match exists
    const match = await Match.findByPk(matchId);
    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Check if prediction deadline has passed
    const now = new Date();
    const deadline = config.tournament.predictionDeadline;
    if (now > deadline) {
      throw new AppError('Prediction deadline has passed', 403);
    }

    // Check if match has already started
    if (match.status !== 'scheduled') {
      throw new AppError('Cannot predict match that has already started or finished', 403);
    }

    // Find existing prediction or create new
    const [prediction, created] = await Prediction.findOrCreate({
      where: { userId, matchId },
      defaults: {
        userId,
        matchId,
        homeScore,
        awayScore,
      },
    });

    // Update if already exists
    if (!created) {
      await prediction.update({
        homeScore,
        awayScore,
      });
    }

    // Return prediction with match details
    const updatedPrediction = await Prediction.findByPk(prediction.id, {
      include: [
        {
          model: Match,
          as: 'match',
          include: [
            { model: Team, as: 'homeTeam' },
            { model: Team, as: 'awayTeam' },
          ],
        },
      ],
    });

    res.json({
      message: created ? 'Prediction submitted' : 'Prediction updated',
      prediction: updatedPrediction,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error submitting prediction:', error);
    throw new AppError('Failed to submit prediction', 500);
  }
};

/**
 * Submit or update bonus question answer
 */
export const submitBonusAnswer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { bonusQuestionId, answer } = req.body;

    // Validate input
    if (!bonusQuestionId || !answer) {
      throw new AppError('Bonus question ID and answer are required', 400);
    }

    // Check if bonus question exists
    const bonusQuestion = await BonusQuestion.findByPk(bonusQuestionId);
    if (!bonusQuestion) {
      throw new AppError('Bonus question not found', 404);
    }

    if (!bonusQuestion.isActive) {
      throw new AppError('Bonus question is not active', 403);
    }

    // Check if prediction deadline has passed
    const now = new Date();
    const deadline = config.tournament.predictionDeadline;
    if (now > deadline) {
      throw new AppError('Prediction deadline has passed', 403);
    }

    // Find existing answer or create new
    const [bonusAnswer, created] = await BonusAnswer.findOrCreate({
      where: { userId, bonusQuestionId },
      defaults: { userId, bonusQuestionId, answer },
    });

    // Update if already exists
    if (!created) {
      await bonusAnswer.update({ answer });
    }

    // Return answer with question details
    const updatedAnswer = await BonusAnswer.findByPk(bonusAnswer.id, {
      include: [{ model: BonusQuestion, as: 'question' }],
    });

    res.json({
      message: created ? 'Bonus answer submitted' : 'Bonus answer updated',
      bonusAnswer: updatedAnswer,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error submitting bonus answer:', error);
    throw new AppError('Failed to submit bonus answer', 500);
  }
};

/**
 * Get prediction statistics for current user
 */
export const getMyStatistics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Get total predictions made
    const totalPredictions = await Prediction.count({
      where: { userId },
    });

    // Get predictions by match status
    const finishedMatches = await Prediction.count({
      where: { userId },
      include: [
        {
          model: Match,
          as: 'match',
          where: { status: 'finished' },
        },
      ],
    });

    // Get correct predictions
    const exactScores = await Prediction.count({
      where: { userId, isCorrectScore: true },
    });

    const correctWinners = await Prediction.count({
      where: { userId, isCorrectWinner: true },
    });

    // Calculate completion percentage (out of 104 matches)
    const totalMatches = 104; // World Cup 2026 has 104 matches
    const completionPercentage = Math.round((totalPredictions / totalMatches) * 100);

    res.json({
      totalPredictions,
      finishedMatches,
      exactScores,
      correctWinners,
      completionPercentage,
      remainingMatches: totalMatches - totalPredictions,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw new AppError('Failed to fetch statistics', 500);
  }
};

/**
 * Delete a prediction (only before deadline)
 */
export const deletePrediction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { matchId } = req.params;

    // Check if prediction deadline has passed
    const now = new Date();
    const deadline = config.tournament.predictionDeadline;
    if (now > deadline) {
      throw new AppError('Cannot delete predictions after deadline', 403);
    }

    // Find prediction
    const prediction = await Prediction.findOne({
      where: { userId, matchId },
    });

    if (!prediction) {
      throw new AppError('Prediction not found', 404);
    }

    await prediction.destroy();

    res.json({
      message: 'Prediction deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error deleting prediction:', error);
    throw new AppError('Failed to delete prediction', 500);
  }
};
