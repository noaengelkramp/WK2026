import { z } from 'zod';

/**
 * Common regex and constants
 */
const CUSTOMER_NUMBER_REGEX = /^(C\d{4}_\d{7}|\d{7})$/;

/**
 * User registration schema
 */
export const registerSchema = z.object({
  body: z.object({
    email: z.string()
      .trim()
      .email('Invalid email address')
      .max(255),
    username: z.string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long'),
    customerNumber: z.string()
      .regex(CUSTOMER_NUMBER_REGEX, 'Invalid customer number format. Use 7 digits or C1234_1234567')
      .optional(),
    languagePreference: z.string().trim().min(2).max(20).optional(),
  })
});

/**
 * User login schema
 */
export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(1, 'Email or username is required'),
    password: z.string().min(1, 'Password is required'),
  })
});

/**
 * User profile update schema
 */
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1, 'First name cannot be empty').max(100).optional(),
    lastName: z.string().trim().min(1, 'Last name cannot be empty').max(100).optional(),
    languagePreference: z.string().trim().min(2).max(20).optional(),
  })
});

/**
 * Email verification schema
 */
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token is required'),
  })
});
