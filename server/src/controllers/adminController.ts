import { Request, Response } from 'express';
import { Match } from '../models';
import { processMatchScoring } from '../services/scoringService';

/**
 * Update match result and trigger scoring
 * POST /api/admin/matches/:id/result
 * 
 * Body: { homeScore: number, awayScore: number }
 */
export async function updateMatchResult(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { homeScore, awayScore } = req.body;

    // Validation
    if (homeScore === undefined || awayScore === undefined) {
      res.status(400).json({
        success: false,
        error: 'homeScore and awayScore are required',
      });
      return;
    }

    if (typeof homeScore !== 'number' || typeof awayScore !== 'number') {
      res.status(400).json({
        success: false,
        error: 'homeScore and awayScore must be numbers',
      });
      return;
    }

    if (homeScore < 0 || awayScore < 0) {
      res.status(400).json({
        success: false,
        error: 'Scores cannot be negative',
      });
      return;
    }

    // Find match
    const match = await Match.findOne({
      where: { id },
    });

    if (!match) {
      res.status(404).json({
        success: false,
        error: `Match not found with ID: ${id}`,
      });
      return;
    }

    // Update match with result
    await match.update({
      homeScore,
      awayScore,
      status: 'finished',
    });

    console.log(`✅ Match ${id} result updated: ${homeScore}-${awayScore}`);

    // Process scoring for all predictions on this match
    try {
      await processMatchScoring(match.id);
      console.log(`✅ Scoring processed for match ${match.id}`);
    } catch (scoringError) {
      console.error('Error processing scoring:', scoringError);
      // Don't fail the request if scoring fails - match result is saved
      res.status(200).json({
        success: true,
        message: 'Match result saved, but scoring calculation had errors',
        match,
        scoringError: scoringError instanceof Error ? scoringError.message : 'Unknown error',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Match result updated and scoring processed',
      match,
    });
  } catch (error) {
    console.error('Error updating match result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update match result',
    });
  }
}

/**
 * Get all matches (admin view with more details)
 * GET /api/admin/matches
 */
export async function getAllMatchesAdmin(_req: Request, res: Response) {
  try {
    const matches = await Match.findAll({
      order: [['matchNumber', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches',
    });
  }
}

/**
 * Update match details (admin only)
 * PUT /api/admin/matches/:id
 */
export async function updateMatch(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const match = await Match.findOne({
      where: { id },
    });

    if (!match) {
      res.status(404).json({
        success: false,
        error: `Match not found with ID: ${id}`,
      });
      return;
    }

    // Update match
    await match.update(updates);

    res.status(200).json({
      success: true,
      message: 'Match updated successfully',
      match,
    });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update match',
    });
  }
}
