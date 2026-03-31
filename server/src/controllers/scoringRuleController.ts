import { Request, Response } from 'express';
import { ScoringRule } from '../models';

/**
 * Get all scoring rules
 * GET /api/scoring-rules
 */
export async function getAllScoringRules(_req: Request, res: Response) {
  try {
    const reqAny = _req as any;
    if (!reqAny.event) {
      res.status(400).json({ success: false, error: 'Event context is required' });
      return;
    }

    const scoringRules = await ScoringRule.findAll({
      where: { eventId: reqAny.event.id },
      order: [
        ['stage', 'ASC'],
      ],
    });

    res.status(200).json({
      success: true,
      count: scoringRules.length,
      scoringRules,
    });
  } catch (error) {
    console.error('Error fetching scoring rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scoring rules',
    });
  }
}

/**
 * Get scoring rule by stage
 * GET /api/scoring-rules/:stage
 */
export async function getScoringRuleByStage(req: Request, res: Response) {
  try {
    const { stage } = req.params;

    if (!(req as any).event) {
      res.status(400).json({ success: false, error: 'Event context is required' });
      return;
    }

    const scoringRule = await ScoringRule.findOne({
      where: { stage, eventId: (req as any).event.id },
    });

    if (!scoringRule) {
      res.status(404).json({
        success: false,
        error: `Scoring rule not found for stage: ${stage}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      scoringRule,
    });
  } catch (error) {
    console.error('Error fetching scoring rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scoring rule',
    });
  }
}
