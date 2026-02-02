import { Request, Response } from 'express';
import { Match, User, Customer, Team, Prediction } from '../models';
import { processMatchScoring } from '../services/scoringService';
import footballApiService from '../services/footballApiService';
import { Op } from 'sequelize';

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

// ==================== USER MANAGEMENT ====================

/**
 * Get all users with search and pagination
 * GET /api/admin/users?search=&page=1&limit=50
 */
export async function getAllUsers(req: Request, res: Response) {
  try {
    const { search = '', page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build search filter
    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { customerNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['customerNumber', 'companyName', 'isActive'],
        },
      ],
    });

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
}

/**
 * Get single user by ID
 * GET /api/admin/users/:id
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['customerNumber', 'companyName', 'isActive'],
        },
      ],
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: `User not found with ID: ${id}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
}

/**
 * Create new user
 * POST /api/admin/users
 * Body: { email, password, firstName, lastName, customerNumber, isAdmin, languagePreference }
 */
export async function createUser(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName, customerNumber, isAdmin = false, languagePreference = 'en' } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !customerNumber) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, firstName, lastName, customerNumber',
      });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
      return;
    }

    // Check if customer number is valid and active
    const customer = await Customer.findOne({ where: { customerNumber } });
    if (!customer) {
      res.status(400).json({
        success: false,
        error: 'Invalid customer number',
      });
      return;
    }

    if (!customer.isActive) {
      res.status(400).json({
        success: false,
        error: 'Customer number is inactive',
      });
      return;
    }

    // Check if customer number already has a user
    const existingCustomerUser = await User.findOne({ where: { customerNumber } });
    if (existingCustomerUser) {
      res.status(409).json({
        success: false,
        error: 'Customer number already has an account',
      });
      return;
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      customerNumber,
      isAdmin,
      languagePreference,
    });

    console.log(`✅ Admin created user: ${email} (${customerNumber})`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
    });
  }
}

/**
 * Update user
 * PUT /api/admin/users/:id
 * Body: { email?, firstName?, lastName?, customerNumber?, isAdmin?, languagePreference? }
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({
        success: false,
        error: `User not found with ID: ${id}`,
      });
      return;
    }

    // If updating customer number, validate it
    if (updates.customerNumber && updates.customerNumber !== user.customerNumber) {
      const customer = await Customer.findOne({ where: { customerNumber: updates.customerNumber } });
      if (!customer) {
        res.status(400).json({
          success: false,
          error: 'Invalid customer number',
        });
        return;
      }

      if (!customer.isActive) {
        res.status(400).json({
          success: false,
          error: 'Customer number is inactive',
        });
        return;
      }

      // Check if new customer number already has a user
      const existingCustomerUser = await User.findOne({ where: { customerNumber: updates.customerNumber } });
      if (existingCustomerUser && existingCustomerUser.id !== id) {
        res.status(409).json({
          success: false,
          error: 'Customer number already has an account',
        });
        return;
      }
    }

    // If updating email, check uniqueness
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updates.email } });
      if (existingUser && existingUser.id !== id) {
        res.status(409).json({
          success: false,
          error: 'Email already in use',
        });
        return;
      }
    }

    // Update user (exclude password from updates)
    const { password, passwordHash, ...allowedUpdates } = updates;
    await user.update(allowedUpdates);

    console.log(`✅ Admin updated user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
}

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await User.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({
        success: false,
        error: `User not found with ID: ${id}`,
      });
      return;
    }

    // Prevent deleting yourself
    if (req.user && req.user.userId === id) {
      res.status(403).json({
        success: false,
        error: 'Cannot delete your own account',
      });
      return;
    }

    const userEmail = user.email;
    await user.destroy();

    console.log(`✅ Admin deleted user: ${userEmail}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
    });
  }
}

/**
 * Reset user password
 * POST /api/admin/users/:id/reset-password
 * Body: { newPassword }
 */
export async function resetUserPassword(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
      });
      return;
    }

    const user = await User.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({
        success: false,
        error: `User not found with ID: ${id}`,
      });
      return;
    }

    // Hash new password
    const passwordHash = await User.hashPassword(newPassword);
    await user.update({ passwordHash });

    console.log(`✅ Admin reset password for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
    });
  }
}

// ==================== CUSTOMER MANAGEMENT ====================

/**
 * Get all customers with search and pagination
 * GET /api/admin/customers?search=&page=1&limit=50
 */
export async function getAllCustomers(req: Request, res: Response) {
  try {
    const { search = '', page = '1', limit = '50', activeOnly = 'false' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build search filter
    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { customerNumber: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (activeOnly === 'true') {
      whereClause.isActive = true;
    }

    // Get customers with pagination
    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset,
      order: [['customerNumber', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'isAdmin'],
          required: false,
        },
      ],
    });

    res.status(200).json({
      success: true,
      customers,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
    });
  }
}

/**
 * Get single customer by ID
 * GET /api/admin/customers/:id
 */
export async function getCustomerById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'isAdmin', 'createdAt'],
          required: false,
        },
      ],
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        error: `Customer not found with ID: ${id}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
    });
  }
}

/**
 * Create new customer
 * POST /api/admin/customers
 * Body: { customerNumber, companyName, isActive }
 */
export async function createCustomer(req: Request, res: Response) {
  try {
    const { customerNumber, companyName, isActive = true } = req.body;

    // Validation
    if (!customerNumber || !companyName) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: customerNumber, companyName',
      });
      return;
    }

    // Validate customer number format
    const customerNumberRegex = /^C\d{4}_\d{7}$/;
    if (!customerNumberRegex.test(customerNumber)) {
      res.status(400).json({
        success: false,
        error: 'Invalid customer number format. Expected: C1234_1234567',
      });
      return;
    }

    // Check if customer number already exists
    const existingCustomer = await Customer.findOne({ where: { customerNumber } });
    if (existingCustomer) {
      res.status(409).json({
        success: false,
        error: 'Customer number already exists',
      });
      return;
    }

    // Create customer
    const customer = await Customer.create({
      customerNumber,
      companyName,
      isActive,
    });

    console.log(`✅ Admin created customer: ${customerNumber} (${companyName})`);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer',
    });
  }
}

/**
 * Update customer
 * PUT /api/admin/customers/:id
 * Body: { companyName?, isActive? }
 */
export async function updateCustomer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { companyName, isActive } = req.body;

    const customer = await Customer.findOne({ where: { id } });

    if (!customer) {
      res.status(404).json({
        success: false,
        error: `Customer not found with ID: ${id}`,
      });
      return;
    }

    // Update customer (don't allow changing customerNumber)
    const updates: any = {};
    if (companyName !== undefined) updates.companyName = companyName;
    if (isActive !== undefined) updates.isActive = isActive;

    await customer.update(updates);

    console.log(`✅ Admin updated customer: ${customer.customerNumber}`);

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      customer,
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer',
    });
  }
}

/**
 * Delete customer (only if no associated user)
 * DELETE /api/admin/customers/:id
 */
export async function deleteCustomer(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          required: false,
        },
      ],
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        error: `Customer not found with ID: ${id}`,
      });
      return;
    }

    // Check if customer has an associated user
    if ((customer as any).user) {
      res.status(409).json({
        success: false,
        error: 'Cannot delete customer with an associated user account. Delete the user first.',
      });
      return;
    }

    const customerNumber = customer.customerNumber;
    await customer.destroy();

    console.log(`✅ Admin deleted customer: ${customerNumber}`);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer',
    });
  }
}

/**
 * Bulk import customers from CSV data
 * POST /api/admin/customers/bulk-import
 * Body: { customers: Array<{ customerNumber, companyName, isActive? }> }
 */
export async function bulkImportCustomers(req: Request, res: Response) {
  try {
    const { customers } = req.body;

    if (!Array.isArray(customers) || customers.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid request. Expected array of customers.',
      });
      return;
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ customerNumber: string; error: string }>,
    };

    // Validate and import each customer
    for (const customerData of customers) {
      try {
        const { customerNumber, companyName, isActive = true } = customerData;

        // Validation
        if (!customerNumber || !companyName) {
          results.failed++;
          results.errors.push({ customerNumber: customerNumber || 'unknown', error: 'Missing required fields' });
          continue;
        }

        // Validate format
        const customerNumberRegex = /^C\d{4}_\d{7}$/;
        if (!customerNumberRegex.test(customerNumber)) {
          results.failed++;
          results.errors.push({ customerNumber, error: 'Invalid format' });
          continue;
        }

        // Check if exists
        const existing = await Customer.findOne({ where: { customerNumber } });
        if (existing) {
          results.failed++;
          results.errors.push({ customerNumber, error: 'Already exists' });
          continue;
        }

        // Create customer
        await Customer.create({
          customerNumber,
          companyName,
          isActive,
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          customerNumber: customerData.customerNumber || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`✅ Bulk import completed: ${results.success} success, ${results.failed} failed`);

    res.status(200).json({
      success: true,
      message: `Bulk import completed: ${results.success} customers added, ${results.failed} failed`,
      results,
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk import customers',
    });
  }
}

// ==================== DASHBOARD ====================

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard/stats
 */
export async function getDashboardStats(_req: Request, res: Response) {
  try {
    // Get counts
    const [
      totalUsers,
      totalCustomers,
      totalMatches,
      totalTeams,
      totalPredictions,
      finishedMatches,
      activeCustomers,
    ] = await Promise.all([
      User.count(),
      Customer.count(),
      Match.count(),
      Team.count(),
      Prediction.count(),
      Match.count({ where: { status: 'finished' } }),
      Customer.count({ where: { isActive: true } }),
    ]);

    // Get recent registrations (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentUsers = await User.count({
      where: { createdAt: { [Op.gte]: weekAgo } },
    });

    // Get predictions percentage
    const usersWithPredictions = await Prediction.count({
      distinct: true,
      col: 'userId',
    });
    const predictionParticipation = totalUsers > 0 
      ? Math.round((usersWithPredictions / totalUsers) * 100) 
      : 0;

    // Calculate average predictions per user
    const avgPredictionsPerUser = totalUsers > 0 
      ? Math.round(totalPredictions / totalUsers) 
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          recentSignups: recentUsers,
          withPredictions: usersWithPredictions,
          participationRate: predictionParticipation,
        },
        customers: {
          total: totalCustomers,
          active: activeCustomers,
        },
        matches: {
          total: totalMatches,
          finished: finishedMatches,
          upcoming: totalMatches - finishedMatches,
        },
        teams: {
          total: totalTeams,
        },
        predictions: {
          total: totalPredictions,
          averagePerUser: avgPredictionsPerUser,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
    });
  }
}

/**
 * Get API-Football status and usage
 * GET /api/admin/dashboard/api-status
 */
export async function getApiStatus(_req: Request, res: Response) {
  try {
    // Check if API key is configured
    if (!footballApiService.isConfigured()) {
      res.status(200).json({
        success: true,
        apiStatus: {
          configured: false,
          message: 'API key not configured',
        },
      });
      return;
    }

    // Get API status
    const statusResponse = await footballApiService['client'].get('/status');
    const apiData = statusResponse.data.response;

    // Get request count from service
    const requestCount = footballApiService.getRequestCount();

    res.status(200).json({
      success: true,
      apiStatus: {
        configured: true,
        account: {
          name: `${apiData.account.firstname} ${apiData.account.lastname}`,
          email: apiData.account.email,
        },
        subscription: {
          plan: apiData.subscription.plan,
          active: apiData.subscription.active,
          expires: apiData.subscription.end,
        },
        requests: {
          today: apiData.requests.current,
          limit: apiData.requests.limit_day,
          remaining: apiData.requests.limit_day - apiData.requests.current,
          sessionCount: requestCount,
        },
        status: apiData.requests.current < 70 ? 'healthy' : 
                apiData.requests.current < 90 ? 'warning' : 'critical',
      },
    });
  } catch (error: any) {
    console.error('Error fetching API status:', error);
    
    // Check if it's an API error
    if (error.response?.data) {
      res.status(200).json({
        success: false,
        apiStatus: {
          configured: true,
          error: error.response.data.errors || 'API request failed',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch API status',
    });
  }
}

/**
 * Sync data from API-Football (teams, fixtures)
 * POST /api/admin/dashboard/sync
 * Body: { syncType: 'teams' | 'fixtures' | 'standings' | 'all', season?: '2022' | '2026' }
 */
export async function syncFromApi(req: Request, res: Response) {
  try {
    const { syncType = 'all', season = '2022' } = req.body;

    if (!footballApiService.isConfigured()) {
      res.status(400).json({
        success: false,
        error: 'API-Football is not configured',
      });
      return;
    }

    const results: any = {
      syncType,
      season,
      success: false,
      data: {},
      errors: [],
    };

    // Sync teams
    if (syncType === 'teams' || syncType === 'all') {
      try {
        const teams = await footballApiService.getTeams(season);
        results.data.teams = {
          count: teams.length,
          synced: new Date().toISOString(),
        };
      } catch (error) {
        results.errors.push(`Teams sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Sync fixtures
    if (syncType === 'fixtures' || syncType === 'all') {
      try {
        const fixtures = await footballApiService.getFixtures(season);
        results.data.fixtures = {
          count: fixtures.length,
          synced: new Date().toISOString(),
        };
      } catch (error) {
        results.errors.push(`Fixtures sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Sync standings
    if (syncType === 'standings' || syncType === 'all') {
      try {
        const standings = await footballApiService.getStandings(season);
        results.data.standings = {
          count: standings.length,
          synced: new Date().toISOString(),
        };
      } catch (error) {
        results.errors.push(`Standings sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    results.success = results.errors.length === 0;

    console.log(`✅ API sync completed: ${syncType} (${season})`);

    res.status(200).json({
      success: true,
      message: results.success 
        ? 'Data synced successfully from API-Football' 
        : 'Sync completed with errors',
      results,
    });
  } catch (error) {
    console.error('Error syncing from API:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync data from API',
    });
  }
}
