import { Request, Response, NextFunction } from 'express';
import { Match, Team } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

/**
 * Get all matches
 */
export const getAllMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stage, status, group } = req.query;

    const where: any = {};
    if (stage) where.stage = stage;
    if (status) where.status = status;
    if (group) where.groupLetter = group;

    const matches = await Match.findAll({
      where,
      include: [
        { model: Team, as: 'homeTeam' },
        { model: Team, as: 'awayTeam' },
      ],
      order: [['matchDate', 'ASC'], ['matchNumber', 'ASC']],
    });

    res.json({ matches });
  } catch (error) {
    next(error);
  }
};

/**
 * Get match by ID
 */
export const getMatchById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const match = await Match.findByPk(id as string, {
      include: [
        { model: Team, as: 'homeTeam' },
        { model: Team, as: 'awayTeam' },
      ],
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    res.json({ match });
  } catch (error) {
    next(error);
  }
};

/**
 * Get upcoming matches
 */
export const getUpcomingMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const matches = await Match.findAll({
      where: {
        matchDate: {
          [Op.gte]: new Date(),
        },
        status: 'scheduled',
      },
      include: [
        { model: Team, as: 'homeTeam' },
        { model: Team, as: 'awayTeam' },
      ],
      order: [['matchDate', 'ASC']],
      limit,
    });

    res.json({ matches });
  } catch (error) {
    next(error);
  }
};
