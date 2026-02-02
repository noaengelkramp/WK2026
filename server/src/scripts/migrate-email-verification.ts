#!/usr/bin/env node

/**
 * Migration Script: Add Email Verification Columns
 * 
 * This script adds the missing email verification columns to the production database
 * that were added to the User model but never migrated to the database schema.
 * 
 * Columns to add:
 * - is_email_verified (BOOLEAN, default false)
 * - email_verification_token (VARCHAR(255), nullable)
 * - email_verification_expires (TIMESTAMP, nullable)
 */

import pg from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

const { Client } = pg;

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables');
  console.error('Please set DATABASE_URL in your .env file');
  process.exit(1);
}

const migrationSQL = `
-- Migration: Add email verification columns to users table
-- Date: 2026-02-02

BEGIN;

-- Add is_email_verified column (default false for existing users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;

-- Add email_verification_token column (nullable)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);

-- Add email_verification_expires column (nullable)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP WITH TIME ZONE;

-- Update existing admin users to be verified (for convenience)
UPDATE users 
SET is_email_verified = true 
WHERE is_admin = true;

COMMIT;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('is_email_verified', 'email_verification_token', 'email_verification_expires')
ORDER BY column_name;
`;

async function runMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for some cloud databases like Neon
    },
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    console.log('\n📝 Running migration: Add email verification columns');
    console.log('━'.repeat(60));

    const result = await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully');
    console.log('\n📊 Verification Result:');
    console.log('━'.repeat(60));
    
    // The last SELECT will be in the last result
    if (result && Array.isArray(result)) {
      const verifyResult = result[result.length - 1];
      if (verifyResult.rows && verifyResult.rows.length > 0) {
        console.table(verifyResult.rows);
      }
    }

    // Check how many users were updated
    const userCountResult = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE is_email_verified = true) as verified_users,
        COUNT(*) FILTER (WHERE is_email_verified = false) as unverified_users
      FROM users
    `);
    
    console.log('\n👥 User Status:');
    console.log('━'.repeat(60));
    console.table(userCountResult.rows);

    console.log('\n✨ Migration completed successfully!');
    console.log('   All existing admin users have been marked as verified.');
    console.log('   New users will need to verify their email addresses.');

  } catch (error: any) {
    console.error('\n❌ Migration failed:');
    console.error('━'.repeat(60));
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
console.log('🚀 Email Verification Migration Script');
console.log('━'.repeat(60));
console.log(`Database: ${DATABASE_URL.split('@')[1]?.split('?')[0] || 'Unknown'}`);
console.log('━'.repeat(60));

runMigration()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });
