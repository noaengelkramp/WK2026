import { Request, Response, NextFunction } from 'express';
import { Match, Team, Prediction, BonusAnswer, BonusQuestion } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op, fn, col } from 'sequelize';
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

/**
 * Get aggregate prediction statistics
 */
export const getPredictionStatistics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cacheKey = CACHE_KEYS.STATS_GLOBAL_PREDICTIONS;
    const cached = await getCache<any>(cacheKey);

    if (cached) {
      console.log('✅ Cache HIT: Global prediction statistics');
      res.json(cached);
      return;
    }

    console.log('⚠️  Cache MISS: Global prediction statistics - querying database');

    // 1. Accuracy Stats (Exact vs Winner vs Incorrect)
    // Only for finished matches
    const totalPredictions = await Prediction.count({
      include: [{ model: Match, as: 'match', where: { status: 'finished' } }]
    });

    const exactScores = await Prediction.count({
      where: { isCorrectScore: true },
      include: [{ model: Match, as: 'match', where: { status: 'finished' } }]
    });

    const correctWinners = await Prediction.count({
      where: { isCorrectWinner: true, isCorrectScore: false },
      include: [{ model: Match, as: 'match', where: { status: 'finished' } }]
    });

    // 2. Champion Predictions
    const championQuestion = await BonusQuestion.findOne({
      where: { questionType: 'champion' }
    });

    let championPredictions: any[] = [];
    if (championQuestion) {
      const results = await BonusAnswer.findAll({
        where: { bonusQuestionId: championQuestion.id },
        attributes: [
          'answer',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['answer'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit: 10
      });
      championPredictions = results;
    }

    // 3. Top Scorer Predictions
    const scorerQuestion = await BonusQuestion.findOne({
      where: { questionType: 'top_scorer' }
    });

    let scorerPredictions: any[] = [];
    if (scorerQuestion) {
      const results = await BonusAnswer.findAll({
        where: { bonusQuestionId: scorerQuestion.id },
        attributes: [
          'answer',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['answer'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit: 10
      });
      scorerPredictions = results;
    }

    const response = {
      accuracy: {
        total: totalPredictions,
        exact: exactScores,
        winner: correctWinners,
        incorrect: totalPredictions - exactScores - correctWinners
      },
      championPredictions,
      scorerPredictions
    };

    await setCache(cacheKey, response, CACHE_TTL.TOURNAMENT_STATS);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
