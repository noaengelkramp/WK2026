-- Migration: Add email verification columns to users table
-- Date: 2026-02-02
-- Description: Adds columns for email verification functionality

-- Add is_email_verified column (default false for existing users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;

-- Add email_verification_token column (nullable)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);

-- Add email_verification_expires column (nullable)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP WITH TIME ZONE;

-- Update existing admin users to be verified (optional, for convenience)
UPDATE users 
SET is_email_verified = true 
WHERE is_admin = true;

-- Comment on columns
COMMENT ON COLUMN users.is_email_verified IS 'Whether user has verified their email address';
COMMENT ON COLUMN users.email_verification_token IS 'Token sent in verification email';
COMMENT ON COLUMN users.email_verification_expires IS 'Expiration timestamp for verification token';
