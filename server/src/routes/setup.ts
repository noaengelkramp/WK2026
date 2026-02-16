import { Router, Request, Response } from 'express';
import { seedDatabase } from '../utils/seed';
import { populateMatchesFromApi } from '../utils/populateMatches';
import { Match } from '../models';

const router = Router();

/**
 * POST /api/setup
 * 
 * Setup endpoint to initialize or update database with match data
 * 
 * Query parameters:
 * - matchesOnly=true: Only populate matches from API (don't seed other data)
 * - force=true: Force re-seed everything even if data exists
 * 
 * Examples:
 * - POST /api/setup?matchesOnly=true - Only populate matches
 * - POST /api/setup?force=true - Re-seed everything
 * - POST /api/setup - Initial setup (seed + matches)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const matchesOnly = req.query.matchesOnly === 'true';
    const force = req.query.force === 'true';

    console.log('\n🔧 Setup endpoint called');
    console.log(`   matchesOnly: ${matchesOnly}`);
    console.log(`   force: ${force}\n`);

    const result: any = {
      success: false,
      message: '',
      steps: [],
    };

    // Check if database is already initialized
    const existingMatches = await Match.count();
    const hasData = existingMatches > 0;

    if (hasData && !force && !matchesOnly) {
      result.message = 'Database already initialized. Use ?force=true to re-seed or ?matchesOnly=true to update matches only.';
      result.matchCount = existingMatches;
      return res.status(200).json(result);
    }

    // Step 1: Seed basic data (if not matchesOnly)
    if (!matchesOnly) {
      try {
        console.log('📦 Step 1: Seeding database...');
        await seedDatabase();
        result.steps.push({ step: 'seed', status: 'success', message: 'Database seeded successfully' });
        console.log('✅ Seed completed\n');
      } catch (error: any) {
        console.error('❌ Seed failed:', error);
        result.steps.push({ step: 'seed', status: 'error', message: error.message });
        result.success = false;
        result.message = 'Failed to seed database';
        return res.status(500).json(result);
      }
    }

    // Step 2: Populate matches from Football API
    try {
      console.log('⚽ Step 2: Populating matches from Football API...');
      await populateMatchesFromApi();
      
      const matchCount = await Match.count();
      result.steps.push({ 
        step: 'populate_matches', 
        status: 'success', 
        message: `Populated ${matchCount} matches from Football API` 
      });
      result.matchCount = matchCount;
      console.log('✅ Match population completed\n');
    } catch (error: any) {
      console.error('❌ Match population failed:', error);
      result.steps.push({ step: 'populate_matches', status: 'error', message: error.message });
      result.success = false;
      result.message = 'Failed to populate matches from API';
      return res.status(500).json(result);
    }

    // Success!
    result.success = true;
    result.message = matchesOnly 
      ? 'Matches populated successfully from Football API'
      : 'Database setup completed successfully';

    console.log('✅ Setup completed successfully!\n');
    return res.status(200).json(result);

  } catch (error: any) {
    console.error('❌ Setup endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Setup failed',
      error: error.message,
    });
  }
});

export default router;
