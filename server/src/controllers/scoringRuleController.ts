import { Request, Response } from 'express';
import { ScoringRule } from '../models';

/**
 * Get all scoring rules
 * GET /api/scoring-rules
 */
export async function getAllScoringRules(_req: Request, res: Response) {
  try {
    const scoringRules = await ScoringRule.findAll({
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

    const scoringRule = await ScoringRule.findOne({
      where: { stage },
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
