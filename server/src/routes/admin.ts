import express from 'express';
import {
  updateMatchResult,
  getAllMatchesAdmin,
  updateMatch,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkImportCustomers,
  getDashboardStats,
  getApiStatus,
  syncFromApi,
  getAllTeamsAdmin,
  updateTeam,
  createTeam,
  deleteTeam,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { populateMatchesFromApi } from '../utils/populateMatches';
import { Match } from '../models';
import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';
import { invalidateMatches, invalidateGroupStandings } from '../services/cacheService';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// ==================== DASHBOARD ====================
// GET /api/admin/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// GET /api/admin/dashboard/api-status - Get API-Football status
router.get('/dashboard/api-status', getApiStatus);

// POST /api/admin/dashboard/sync - Sync data from API-Football
router.post('/dashboard/sync', syncFromApi);

// ==================== MATCH MANAGEMENT ====================
// POST /api/admin/matches/:id/result - Update match result
router.post('/matches/:id/result', updateMatchResult);

// GET /api/admin/matches - Get all matches (admin view)
router.get('/matches', getAllMatchesAdmin);

// PUT /api/admin/matches/:id - Update match details
router.put('/matches/:id', updateMatch);

// ==================== USER MANAGEMENT ====================
// GET /api/admin/users - Get all users with search and pagination
router.get('/users', getAllUsers);

// GET /api/admin/users/:id - Get single user by ID
router.get('/users/:id', getUserById);

// POST /api/admin/users - Create new user
router.post('/users', createUser);

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', deleteUser);

// POST /api/admin/users/:id/reset-password - Reset user password
router.post('/users/:id/reset-password', resetUserPassword);

// ==================== CUSTOMER MANAGEMENT ====================
// GET /api/admin/customers - Get all customers with search and pagination
router.get('/customers', getAllCustomers);

// GET /api/admin/customers/:id - Get single customer by ID
router.get('/customers/:id', getCustomerById);

// POST /api/admin/customers - Create new customer
router.post('/customers', createCustomer);

// PUT /api/admin/customers/:id - Update customer
router.put('/customers/:id', updateCustomer);

// DELETE /api/admin/customers/:id - Delete customer
router.delete('/customers/:id', deleteCustomer);

// POST /api/admin/customers/bulk-import - Bulk import customers
router.post('/customers/bulk-import', bulkImportCustomers);

// ==================== TEAM MANAGEMENT ====================
// GET /api/admin/teams - Get all teams (admin view)
router.get('/teams', getAllTeamsAdmin);

// PUT /api/admin/teams/:id - Update team
router.put('/teams/:id', updateTeam);

// POST /api/admin/teams - Create new team
router.post('/teams', createTeam);

// DELETE /api/admin/teams/:id - Delete team
router.delete('/teams/:id', deleteTeam);

// ==================== TESTING & HISTORIC DATA ====================
/**
 * POST /api/admin/populate-historic
 * 
 * Populate matches with historic data from a specific date during 2022 World Cup
 * Body: { date: 'YYYY-MM-DD' }
 */
router.post('/populate-historic', async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required in request body',
      });
    }
    
    // Validate date format
    const targetDate = new Date(date);
    const minDate = new Date('2022-11-20');
    const maxDate = new Date('2022-12-18');
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }
    
    if (targetDate < minDate || targetDate > maxDate) {
      return res.status(400).json({
        success: false,
        message: 'Date must be between Nov 20, 2022 and Dec 18, 2022',
      });
    }
    
    console.log(`\n🧪 Admin triggered historic populate: ${date}`);
    
    // Call the populate function
    await populateMatchesFromApi(date);
    
    // Clear all match and group standings caches to ensure fresh data
    console.log('🗑️  Clearing caches...');
    await invalidateMatches();
    await invalidateGroupStandings();
    console.log('✅ Caches cleared');
    
    // Get statistics
    const matchCount = await Match.count();
    const finishedCount = await Match.count({ where: { status: 'finished' } });
    const scheduledCount = await Match.count({ where: { status: 'scheduled' } });
    
    // Use raw SQL to count TBD teams (fixes TypeScript null handling issue)
    const [tbdResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM matches WHERE home_team_id IS NULL',
      { type: QueryTypes.SELECT }
    ) as [{ count: string }];
    const tbdCount = parseInt(tbdResult.count);
    
    return res.status(200).json({
      success: true,
      message: `Matches populated as of ${date}`,
      data: {
        totalMatches: matchCount,
        finished: finishedCount,
        scheduled: scheduledCount,
        tbdTeams: tbdCount,
      },
    });
    
  } catch (error: any) {
    console.error('❌ Error populating historic matches:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to populate historic matches',
      error: error.message,
    });
  }
});

export default router;
