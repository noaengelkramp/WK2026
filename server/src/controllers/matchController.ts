import { Request, Response, NextFunction } from 'express';
import { Match, Team } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import { getCache, setCache, CACHE_TTL, CACHE_KEYS } from '../config/redis';
import { config } from '../config/environment';
import { footballApiService } from '../services/footballApiService';

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

/**
 * Get tournament statistics (Top Scorers, Cards)
 */
export const getTournamentStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const season = (req.query.season as string) || config.footballApi.season;
    
    // Cache keys
    const scorersCacheKey = CACHE_KEYS.STATS_TOP_SCORERS(season);
    const cardsCacheKey = CACHE_KEYS.STATS_TOP_CARDS(season);

    // Try to get from cache
    const [cachedScorers, cachedCards] = await Promise.all([
      getCache<any[]>(scorersCacheKey),
      getCache<any[]>(cardsCacheKey),
    ]);

    let topScorers = cachedScorers;
    let topCards = cachedCards;

    // Fetch from API if not in cache
    if (!topScorers || !topCards) {
      console.log(`⚠️  Cache MISS: Tournament stats for season ${season}`);
      
      const [apiScorers, apiCards] = await Promise.all([
        !topScorers ? footballApiService.getTopScorers(season) : Promise.resolve(topScorers),
        !topCards ? footballApiService.getTopCards(season) : Promise.resolve(topCards),
      ]);

      if (!topScorers) {
        topScorers = apiScorers;
        await setCache(scorersCacheKey, topScorers, CACHE_TTL.TOURNAMENT_STATS);
      }

      if (!topCards) {
        topCards = apiCards;
        await setCache(cardsCacheKey, topCards, CACHE_TTL.TOURNAMENT_STATS);
      }
    } else {
      console.log('✅ Cache HIT: Tournament stats');
    }

    res.json({
      topScorers: topScorers || [],
      topCards: topCards || [],
    });
  } catch (error) {
    next(error);
  }
};
