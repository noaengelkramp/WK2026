import { testConnection, syncDatabase } from '../config/database';
// Import models to ensure they're registered with Sequelize
import '../models';

/**
 * Database migration script
 * Creates all tables based on Sequelize models
 */
async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection
    await testConnection();
    
    // Sync database (create tables)
    // Using force=false to preserve existing data if tables exist
    const force = process.argv.includes('--force');
    if (force) {
      console.log('⚠️  WARNING: Running with --force will DROP ALL TABLES!');
    }
    
    await syncDatabase(force);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
