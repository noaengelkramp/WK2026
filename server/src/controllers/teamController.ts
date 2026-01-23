import { Request, Response, NextFunction } from 'express';
import { Team } from '../models';
import { AppError } from '../middleware/errorHandler';
import { getCache, setCache, CACHE_TTL, CACHE_KEYS } from '../config/redis';

/**
 * Get all teams
 */
export const getAllTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { group } = req.query;

    const cacheKey = group ? `${CACHE_KEYS.TEAMS_ALL}:${group}` : CACHE_KEYS.TEAMS_ALL;

    // Try to get from cache
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('✅ Cache HIT: Teams');
      res.json(cached);
      return;
    }

    console.log('⚠️  Cache MISS: Teams - querying database');

    const where = group && typeof group === 'string' ? { groupLetter: group } : {};

    const teams = await Team.findAll({
      where,
      order: [['groupLetter', 'ASC'], ['fifaRank', 'ASC']],
    });

    const response = { teams };

    // Cache teams (rarely change)
    await setCache(cacheKey, response, CACHE_TTL.TEAMS);

    res.json(response);
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
    const teamId = Array.isArray(id) ? id[0] : id;

    const cacheKey = CACHE_KEYS.TEAM_BY_ID(teamId);

    // Try to get from cache
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('✅ Cache HIT: Team by ID');
      res.json(cached);
      return;
    }

    console.log('⚠️  Cache MISS: Team by ID - querying database');

    const team = await Team.findByPk(teamId);

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    const response = { team };

    // Cache team data
    await setCache(cacheKey, response, CACHE_TTL.TEAMS);

    res.json(response);
  } catch (error) {
    next(error);
  }
};
