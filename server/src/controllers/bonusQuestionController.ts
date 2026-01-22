import { Request, Response } from 'express';
import { BonusQuestion } from '../models';

/**
 * Get all active bonus questions
 * GET /api/bonus-questions
 */
export async function getAllBonusQuestions(_req: Request, res: Response) {
  try {
    const bonusQuestions = await BonusQuestion.findAll({
      where: { isActive: true },
      order: [
        ['questionType', 'ASC'],
      ],
    });

    res.status(200).json({
      success: true,
      count: bonusQuestions.length,
      bonusQuestions,
    });
  } catch (error) {
    console.error('Error fetching bonus questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bonus questions',
    });
  }
}

/**
 * Get bonus question by ID
 * GET /api/bonus-questions/:id
 */
export async function getBonusQuestionById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const bonusQuestion = await BonusQuestion.findOne({
      where: { id },
    });

    if (!bonusQuestion) {
      res.status(404).json({
        success: false,
        error: `Bonus question not found with ID: ${id}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      bonusQuestion,
    });
  } catch (error) {
    console.error('Error fetching bonus question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bonus question',
    });
  }
}
