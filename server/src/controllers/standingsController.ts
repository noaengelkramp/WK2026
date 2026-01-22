import { Request, Response } from 'express';
import { UserStatistics, User, Department, DepartmentStatistics } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

/**
 * Get individual user standings (leaderboard)
 */
export const getIndividualStandings = async (req: Request, res: Response) => {
  try {
    const { limit = '100', offset = '0', search = '' } = req.query;

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    // Build where clause for search
    const whereClause: any = {};
    if (search) {
      whereClause['$user.firstName$'] = { $like: `%${search}%` };
      whereClause['$user.lastName$'] = { $like: `%${search}%` };
    }

    // Get standings with user and department info
    const standings = await UserStatistics.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      order: [
        ['totalPoints', 'DESC'],
        ['exactScores', 'DESC'],
        ['correctWinners', 'DESC'],
        ['user', 'createdAt', 'ASC'], // Tie-breaker: earlier registration
      ],
      limit: limitNum,
      offset: offsetNum,
    });

    // Get total count for pagination
    const total = await UserStatistics.count({ where: whereClause });

    // Add rank to each entry
    const standingsWithRank = standings.map((stat, index) => ({
      rank: offsetNum + index + 1,
      ...stat.toJSON(),
    }));

    res.json({
      standings: standingsWithRank,
      total,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error('Error fetching individual standings:', error);
    throw new AppError('Failed to fetch individual standings', 500);
  }
};

/**
 * Get department standings
 */
export const getDepartmentStandings = async (req: Request, res: Response) => {
  try {
    const standings = await DepartmentStatistics.findAll({
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'description', 'logoUrl'],
        },
      ],
      order: [
        ['totalPoints', 'DESC'],
        ['averagePoints', 'DESC'],
        ['participantCount', 'DESC'],
      ],
    });

    // Add rank to each department
    const standingsWithRank = standings.map((stat, index) => ({
      rank: index + 1,
      ...stat.toJSON(),
    }));

    res.json({
      standings: standingsWithRank,
      total: standings.length,
    });
  } catch (error) {
    console.error('Error fetching department standings:', error);
    throw new AppError('Failed to fetch department standings', 500);
  }
};

/**
 * Get top N users (for homepage)
 */
export const getTopUsers = async (req: Request, res: Response) => {
  try {
    const { limit = '5' } = req.query;
    const limitNum = parseInt(limit as string);

    const topUsers = await UserStatistics.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['name'],
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

    // Add rank
    const topUsersWithRank = topUsers.map((stat, index) => ({
      rank: index + 1,
      ...stat.toJSON(),
    }));

    res.json({ topUsers: topUsersWithRank });
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

    // Get user's statistics
    const userStats = await UserStatistics.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name'],
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
        totalPoints: { [Op.gt]: userStats.totalPoints },
      },
    })) as number;

    // Get total participants
    const totalParticipants = await UserStatistics.count();

    // Get users above and below (context)
    const contextAbove = await UserStatistics.findAll({
      where: {
        totalPoints: { [Op.gte]: userStats.totalPoints },
        userId: { [Op.ne]: userId },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['name'],
            },
          ],
        },
      ],
      order: [
        ['totalPoints', 'DESC'],
        ['exactScores', 'DESC'],
        ['correctWinners', 'DESC'],
      ],
      limit: 3,
    });

    const contextBelow = await UserStatistics.findAll({
      where: {
        totalPoints: { [Op.lt]: userStats.totalPoints },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['name'],
            },
          ],
        },
      ],
      order: [
        ['totalPoints', 'DESC'],
        ['exactScores', 'DESC'],
        ['correctWinners', 'DESC'],
      ],
      limit: 3,
    });

    res.json({
      rank: rank + 1,
      totalParticipants,
      userStats,
      contextAbove,
      contextBelow,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching user ranking:', error);
    throw new AppError('Failed to fetch user ranking', 500);
  }
};
