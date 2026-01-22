import { sequelize } from '../config/database';
import { seedAllMatches } from './seedAllMatches';

/**
 * Standalone script to seed all 104 matches
 * Run with: npm run seed:matches
 */
async function runMatchSeeder() {
  try {
    console.log('🚀 Starting World Cup 2026 match seeder...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Seed all matches
    await seedAllMatches();

    console.log('\n✨ Match seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Match seeding failed:', error);
    process.exit(1);
  }
}

runMatchSeeder();
