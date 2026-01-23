import { Request, Response, NextFunction } from 'express';
import { Match, Team } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import { getCache, setCache, CACHE_TTL, CACHE_KEYS } from '../config/redis';

/**
 * Get all matches
 */
export const getAllMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stage, status, group } = req.query;

    // Create cache key based on query params
    const cacheKey = stage 
      ? CACHE_KEYS.MATCHES_BY_STAGE(stage as string)
      : `${CACHE_KEYS.MATCHES_ALL}:${status || 'all'}:${group || 'all'}`;

    // Try to get from cache
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('✅ Cache HIT: Matches');
      res.json(cached);
      return;
    }

    console.log('⚠️  Cache MISS: Matches - querying database');

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

    const response = { matches };

    // Cache with appropriate TTL based on status
    const ttl = status === 'live' ? 60 : CACHE_TTL.MATCHES; // 1 min for live matches
    await setCache(cacheKey, response, ttl);

    res.json(response);
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
