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

export default router;
