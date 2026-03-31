import { Request, Response } from 'express';
import { BonusQuestion } from '../models';

/**
 * Get all active bonus questions
 * GET /api/bonus-questions
 */
export async function getAllBonusQuestions(_req: Request, res: Response) {
  try {
    const reqAny = _req as any;
    if (!reqAny.event) {
      res.status(400).json({ success: false, error: 'Event context is required' });
      return;
    }

    const bonusQuestions = await BonusQuestion.findAll({
      where: { isActive: true, eventId: reqAny.event.id },
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

    if (!(req as any).event) {
      res.status(400).json({ success: false, error: 'Event context is required' });
      return;
    }

    const bonusQuestion = await BonusQuestion.findOne({
      where: { id, eventId: (req as any).event.id },
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
