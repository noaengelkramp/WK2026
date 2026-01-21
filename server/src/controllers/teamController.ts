import { Request, Response, NextFunction } from 'express';
import { Team } from '../models';
import { AppError } from '../middleware/errorHandler';

/**
 * Get all teams
 */
export const getAllTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { group } = req.query;

    const where = group && typeof group === 'string' ? { groupLetter: group } : {};

    const teams = await Team.findAll({
      where,
      order: [['groupLetter', 'ASC'], ['fifaRank', 'ASC']],
    });

    res.json({ teams });
  } catch (error) {
    next(error);
  }
};

/**
 * Get team by ID
 */
export const getTeamById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id as string);

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    res.json({ team });
  } catch (error) {
    next(error);
  }
};
