import { Request, Response } from 'express';
import { UserStatistics, User, Customer, BonusAnswer, BonusQuestion } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import { getCache, setCache, CACHE_TTL, CACHE_KEYS } from '../config/redis';
import { sortByTieBreak } from '../utils/tieBreak';

const attachChampionTieBreak = async (eventId: string, rows: any[]) => {
  if (!rows.length) return [];

  const championQuestion = await BonusQuestion.findOne({
    where: { eventId, questionType: 'champion' },
    attributes: ['id'],
  });

  if (!championQuestion) {
    return rows.map((row) => ({ ...row, championPredictionCorrect: false }));
  }

  const answers = await BonusAnswer.findAll({
    where: {
      eventId,
      bonusQuestionId: championQuestion.id,
      isCorrect: true,
    },
    attributes: ['userId'],
  });

  const usersWithCorrectChampion = new Set(answers.map((answer) => answer.userId));

  return rows.map((row) => ({
    ...row,
    championPredictionCorrect: usersWithCorrectChampion.has(row.userId),
  }));
};

/**
 * Get individual user standings (leaderboard) with anonymization
 */
export const getIndividualStandings = async (req: Request, res: Response) => {
  try {
    const { limit = '100', offset = '0', search = '' } = req.query;
    const currentUserId = (req as any).user?.userId; // Get current user if authenticated
    const currentEventId = (req as any).event?.id || (req as any).user?.eventId;

    if (!currentEventId) {
      throw new AppError('Event context is required for standings', 400);
    }

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    // Create cache key with query params (but not including user ID for shared cache)
    const cacheKey = `${CACHE_KEYS.LEADERBOARD_INDIVIDUAL}:${currentEventId}:${limitNum}:${offsetNum}:${search}`;

    // Try to get from cache (but we'll need to apply anonymization after)
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('✅ Cache HIT: Individual standings');
      // Apply anonymization based on current user
      const anonymized = anonymizeStandings(cached.standings, currentUserId);
      res.json({ ...cached, standings: anonymized });
      return;
    }

    console.log('⚠️  Cache MISS: Individual standings - querying database');

    // Build where clause for search
    const whereClause: any = {};
    whereClause.eventId = currentEventId;
    if (search) {
      whereClause[Op.or] = [
        { '$user.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$user.lastName$': { [Op.iLike]: `%${search}%` } },
        { '$user.username$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Get standings with user and customer info
    const standings = await UserStatistics.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'username', 'createdAt'],
          include: [
            {
              model: Customer,
              as: 'customer',
              attributes: ['companyName'],
            },
          ],
        },
      ],
      order: [
        ['totalPoints', 'DESC'],
        ['exactScores', 'DESC'],
        ['correctWinners', 'DESC'],
        ['createdAt', 'ASC'], // Tie-breaker: earlier registration
      ],
      limit: limitNum,
      offset: offsetNum,
    });

    // Get total count for pagination
    const total = await UserStatistics.count({ where: whereClause });

    // Add rank to each entry
    const standingsWithRank = standings.map((stat, index) => {
      const statJSON: any = stat.toJSON();
      return {
        rank: offsetNum + index + 1,
        userId: statJSON.user?.id,
        username: statJSON.user?.username,
        companyName: statJSON.user?.customer?.companyName,
        firstName: statJSON.user?.firstName,
        lastName: statJSON.user?.lastName,
        registrationDate: statJSON.user?.createdAt,
        totalPoints: stat.totalPoints,
        exactScores: stat.exactScores,
        correctWinners: stat.correctWinners,
        predictionsMade: stat.predictionsMade,
        bonusPoints: stat.bonusPoints,
      };
    });

    const withChampionTieBreak = await attachChampionTieBreak(currentEventId, standingsWithRank);
    const sortedWithTieBreak = sortByTieBreak(withChampionTieBreak).map((standing, index) => ({
      ...standing,
      rank: offsetNum + index + 1,
    }));

    const response = {
      standings: sortedWithTieBreak,
      total,
      limit: limitNum,
      offset: offsetNum,
    };

    // Cache the result (without anonymization - we'll apply it per user)
    await setCache(cacheKey, response, CACHE_TTL.LEADERBOARD);

    // Apply anonymization based on current user
    const anonymized = anonymizeStandings(sortedWithTieBreak, currentUserId);

    res.json({ ...response, standings: anonymized });
  } catch (error) {
    console.error('Error fetching individual standings:', error);
    throw new AppError('Failed to fetch individual standings', 500);
  }
};

/**
 * Anonymize standings - only show current user's full info
 */
function anonymizeStandings(standings: any[], currentUserId?: string) {
  return standings.map((standing) => {
    const isCurrentUser = currentUserId && standing.userId === currentUserId;
    
    if (isCurrentUser) {
      // Show full info for current user
      return {
        ...standing,
        isCurrentUser: true,
      };
    } else {
      // Anonymize other users - Show username, hide real name
      return {
        rank: standing.rank,
        username: standing.username, // Show username clearly
        totalPoints: standing.totalPoints,
        exactScores: standing.exactScores,
        correctWinners: standing.correctWinners,
        predictionsMade: standing.predictionsMade,
        bonusPoints: standing.bonusPoints,
        championPredictionCorrect: standing.championPredictionCorrect,
        isCurrentUser: false,
      };
    }
  });
}

/**
 * Get top N users (for homepage) - fully anonymized
 */
export const getTopUsers = async (req: Request, res: Response) => {
  try {
    const { limit = '5' } = req.query;
    const limitNum = parseInt(limit as string);
    const currentEventId = (req as any).event?.id || (req as any).user?.eventId;

    if (!currentEventId) {
      throw new AppError('Event context is required for standings', 400);
    }

    const cacheKey = `${CACHE_KEYS.LEADERBOARD_INDIVIDUAL}:top:${currentEventId}:${limitNum}`;

    // Try to get from cache
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('✅ Cache HIT: Top users');
      res.json(cached);
      return;
    }

    console.log('⚠️  Cache MISS: Top users - querying database');

    const topUsers = await UserStatistics.findAll({
      where: { eventId: currentEventId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
          include: [
            {
              model: Customer,
              as: 'customer',
              attributes: ['companyName'],
            },
          ],
        },
      ],
      order: [
        ['totalPoints', 'DESC'],
        ['exactScores', 'DESC'],
        ['correctWinners', 'DESC'],
      ],
      limit: limitNum,
    });

    const topUsersRaw = topUsers.map((stat) => {
      const statJSON: any = stat.toJSON();
      return {
        userId: statJSON.user?.id,
        username: statJSON.user?.username,
        registrationDate: statJSON.user?.createdAt,
        totalPoints: stat.totalPoints,
        exactScores: stat.exactScores,
        correctWinners: stat.correctWinners,
      };
    });

    const topUsersWithChampion = await attachChampionTieBreak(currentEventId, topUsersRaw);
    const topUsersSorted = sortByTieBreak(topUsersWithChampion);

    // Show usernames for homepage - remove customerNumber
    const topUsersAnonymized = topUsersSorted.map((stat, index) => {
      return {
        rank: index + 1,
        username: stat.username,
        totalPoints: stat.totalPoints,
        exactScores: stat.exactScores,
        correctWinners: stat.correctWinners,
        championPredictionCorrect: stat.championPredictionCorrect,
      };
    });

    const response = { topUsers: topUsersAnonymized };

    // Cache the result
    await setCache(cacheKey, response, CACHE_TTL.LEADERBOARD);

    res.json(response);
  } catch (error) {
    console.error('Error fetching top users:', error);
    throw new AppError('Failed to fetch top users', 500);
  }
};

/**
 * Get current user's rank and surrounding users
 */
export const getMyRanking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const eventId = (req as any).user.eventId;

    // Get user's statistics
    const userStats = await UserStatistics.findOne({
      where: { userId, eventId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'username', 'createdAt'],
          include: [
            {
              model: Customer,
              as: 'customer',
              attributes: ['companyName'],
            },
          ],
        },
      ],
    });

    if (!userStats) {
      throw new AppError('User statistics not found', 404);
    }

    // Get user's rank by counting users with higher points
    const rank = (await UserStatistics.count({
      where: {
        eventId,
        totalPoints: { [Op.gt]: userStats.totalPoints },
      },
    })) + 1;

    // Get total participants
    const totalParticipants = await UserStatistics.count({ where: { eventId } });

    // Get users above (anonymized)
    const contextAbove = await UserStatistics.findAll({
      where: {
        eventId,
        totalPoints: { [Op.gte]: userStats.totalPoints },
        userId: { [Op.ne]: userId },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
        },
      ],
      order: [
        ['totalPoints', 'DESC'],
        ['exactScores', 'DESC'],
        ['correctWinners', 'DESC'],
      ],
      limit: 3,
    });

    // Get users below (anonymized)
    const contextBelow = await UserStatistics.findAll({
      where: {
        eventId,
        totalPoints: { [Op.lt]: userStats.totalPoints },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
        },
      ],
      order: [
        ['totalPoints', 'DESC'],
        ['exactScores', 'DESC'],
        ['correctWinners', 'DESC'],
      ],
      limit: 3,
    });

    const [contextAboveWithChampion, contextBelowWithChampion] = await Promise.all([
      attachChampionTieBreak(eventId, contextAbove.map((stat) => {
        const statJSON: any = stat.toJSON();
        return {
          userId: statJSON.user?.id,
          username: statJSON.user?.username,
          registrationDate: statJSON.user?.createdAt,
          totalPoints: stat.totalPoints,
          exactScores: stat.exactScores,
          correctWinners: stat.correctWinners,
        };
      })),
      attachChampionTieBreak(eventId, contextBelow.map((stat) => {
        const statJSON: any = stat.toJSON();
        return {
          userId: statJSON.user?.id,
          username: statJSON.user?.username,
          registrationDate: statJSON.user?.createdAt,
          totalPoints: stat.totalPoints,
          exactScores: stat.exactScores,
          correctWinners: stat.correctWinners,
        };
      })),
    ]);

    const sortedAbove = sortByTieBreak(contextAboveWithChampion).slice(0, 3);
    const sortedBelow = sortByTieBreak(contextBelowWithChampion).slice(0, 3);

    // Anonymize context users - use username instead of customerNumber
    const anonymizeContext = (users: any[]) => {
      return users.map((stat) => {
        return {
          username: stat.username,
          totalPoints: stat.totalPoints,
          exactScores: stat.exactScores,
          correctWinners: stat.correctWinners,
          championPredictionCorrect: stat.championPredictionCorrect,
        };
      });
    };

    res.json({
      rank,
      totalParticipants,
      userStats,
      contextAbove: anonymizeContext(sortedAbove),
      contextBelow: anonymizeContext(sortedBelow),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching user ranking:', error);
    throw new AppError('Failed to fetch user ranking', 500);
  }
};
