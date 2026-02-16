import { Router, Request, Response } from 'express';
import { seedDatabase } from '../utils/seed';
import { populateMatchesFromApi } from '../utils/populateMatches';
import { Match } from '../models';
import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

const router = Router();

/**
 * POST /api/setup
 * 
 * Setup endpoint to initialize or update database with match data
 * 
 * Query parameters:
 * - matchesOnly=true: Only populate matches from API (don't seed other data)
 * - force=true: Force re-seed everything even if data exists
 * - asOfDate=YYYY-MM-DD: Populate matches as they were on this date (for testing)
 * 
 * Examples:
 * - POST /api/setup?matchesOnly=true - Only populate matches
 * - POST /api/setup?force=true - Re-seed everything
 * - POST /api/setup - Initial setup (seed + matches)
 * - POST /api/setup?matchesOnly=true&asOfDate=2022-12-11 - Historic snapshot
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const matchesOnly = req.query.matchesOnly === 'true';
    const force = req.query.force === 'true';
    const asOfDate = req.query.asOfDate as string | undefined;

    // Validate asOfDate if provided
    if (asOfDate) {
      const date = new Date(asOfDate);
      const minDate = new Date('2022-11-20');
      const maxDate = new Date('2022-12-18');
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }
      
      if (date < minDate || date > maxDate) {
        return res.status(400).json({
          success: false,
          message: 'Date must be between Nov 20, 2022 and Dec 18, 2022 (2022 World Cup dates)',
        });
      }
    }

    console.log('\n🔧 Setup endpoint called');
    console.log(`   matchesOnly: ${matchesOnly}`);
    console.log(`   force: ${force}`);
    console.log(`   asOfDate: ${asOfDate || 'none (use all data)'}\n`);

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
      await populateMatchesFromApi(asOfDate);
      
      const matchCount = await Match.count();
      const finishedCount = await Match.count({ where: { status: 'finished' } });
      const scheduledCount = await Match.count({ where: { status: 'scheduled' } });
      
      // Use raw SQL to count TBD teams (fixes TypeScript null handling issue)
      const [tbdResult] = await sequelize.query(
        'SELECT COUNT(*) as count FROM matches WHERE home_team_id IS NULL',
        { type: QueryTypes.SELECT }
      ) as [{ count: string }];
      const tbdCount = parseInt(tbdResult.count);
      
      result.steps.push({ 
        step: 'populate_matches', 
        status: 'success', 
        message: asOfDate 
          ? `Populated ${matchCount} matches as of ${asOfDate} (${finishedCount} finished, ${scheduledCount} scheduled, ${tbdCount} TBD teams)`
          : `Populated ${matchCount} matches from Football API`
      });
      result.matchCount = matchCount;
      result.breakdown = {
        finished: finishedCount,
        scheduled: scheduledCount,
        tbdTeams: tbdCount,
      };
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
