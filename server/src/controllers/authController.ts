import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User, UserStatistics, Customer } from '../models';
import { generateTokens } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import emailService from '../services/emailService';
import { Op } from 'sequelize';
import { resolveCustomerNumberForEvent, MAX_ACCOUNTS_PER_CUSTOMER_PER_EVENT } from '../utils/eventCustomerPolicy';
import signupWebhookService from '../services/signupWebhookService';
import { getVisibleCustomerNumber } from '../utils/customerNumber';

const sanitizeUserResponse = (user: any) => {
  const raw = user?.toJSON ? user.toJSON() : user;
  if (!raw) return raw;

  const fullCustomerNumber = raw.customerNumber as string | undefined;
  return {
    ...raw,
    customerNumber: undefined,
    visibleCustomerNumber: fullCustomerNumber ? getVisibleCustomerNumber(fullCustomerNumber) : undefined,
  };
};

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.event) {
      throw new AppError('Event context is required for registration', 400);
    }

    const { email, username, password, customerNumber, languagePreference } = req.body;

    // Validate required fields
    if (!email || !username || !password) {
      throw new AppError('Missing required fields', 400);
    }

    const displayName = username;

    const normalizedCustomerNumber = await resolveCustomerNumberForEvent({
      eventCode: req.event.code,
      customerPrefix: req.event.customerPrefix,
      email,
      customerNumberInput: customerNumber,
    });

    // Check if user already exists in this event
    const existingUser = await User.findOne({ where: { email, eventId: req.event.id } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Check if username already exists in this event
    const existingUsername = await User.findOne({ where: { username, eventId: req.event.id } });
    if (existingUsername) {
      throw new AppError('Username already taken', 409);
    }

    // Check per-event customer account limit
    const existingCustomerUsersCount = await User.count({
      where: { customerNumber: normalizedCustomerNumber, eventId: req.event.id },
    });
    if (existingCustomerUsersCount >= MAX_ACCOUNTS_PER_CUSTOMER_PER_EVENT) {
      throw new AppError(`Maximum ${MAX_ACCOUNTS_PER_CUSTOMER_PER_EVENT} accounts reached for this customer number in this event.`, 409);
    }

    // Validate customer exists and is active
    const customer = await Customer.findOne({ where: { customerNumber: normalizedCustomerNumber } });
    if (!customer) {
      throw new AppError('Customer number not found in our system. Please contact support.', 404);
    }

    if (!customer.isActive) {
      throw new AppError('This customer account is not active. Please contact support.', 403);
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const selectedLanguage = languagePreference || req.event.defaultLocale;
    if (!req.event.allowedLocales.includes(selectedLanguage)) {
      throw new AppError(`Language must be one of: ${req.event.allowedLocales.join(', ')}`, 400);
    }

    // Create user
    const user = await User.create({
      eventId: req.event.id,
      email,
      username,
      passwordHash,
      firstName: displayName,
      lastName: '-',
      customerNumber: normalizedCustomerNumber,
      languagePreference: selectedLanguage,
      role: 'user',
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Create user statistics
    await UserStatistics.create({
      eventId: req.event.id,
      userId: user.id,
      totalPoints: 0,
      exactScores: 0,
      correctWinners: 0,
      predictionsMade: 0,
      bonusPoints: 0,
    });

    // Send verification email (async, don't wait)
    emailService.sendVerificationEmail(
      user.email,
      user.username,
      emailVerificationToken,
      user.languagePreference
    ).catch(err => {
      console.error('Failed to send verification email:', err);
      // Don't block registration if email fails
    });

    // Send signup email data to external webhook (async, non-blocking)
    signupWebhookService.sendSignupEmail({
      email: user.email,
      eventCode: req.event.code,
      languagePreference: user.languagePreference,
    }).catch(err => {
      console.error('Failed to send signup webhook:', err);
    });

    // Generate tokens (allow login even without verification)
    const tokens = generateTokens({
      userId: user.id,
      eventId: user.eventId,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: sanitizeUserResponse(user),
      emailVerificationSent: true,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.event) {
      throw new AppError('Event context is required for login', 400);
    }

    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
      throw new AppError('Email/Username and password are required', 400);
    }

    // Find user by email or username within current event
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: [{ model: Customer, as: 'customer' }],
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.role !== 'platform_admin' && user.eventId !== req.event.id) {
      throw new AppError('This account belongs to a different event', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      eventId: user.eventId,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      user: sanitizeUserResponse(user),
      ...tokens,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await User.findByPk(req.user.userId, {
      include: [
        { model: Customer, as: 'customer' },
        { model: UserStatistics, as: 'statistics' },
      ],
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user: sanitizeUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { firstName, lastName, languagePreference } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (req.event && req.user.role !== 'platform_admin' && user.eventId !== req.event.id) {
      throw new AppError('Cannot update user outside current event', 403);
    }

    if (languagePreference && req.event && !req.event.allowedLocales.includes(languagePreference)) {
      throw new AppError(`Language must be one of: ${req.event.allowedLocales.join(', ')}`, 400);
    }

    // Update user
    await user.update({
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(languagePreference && { languagePreference }),
    });

    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Verification token is required', 400);
    }

    // Find user with this verification token
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    // Check if token expired
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new AppError('Verification token has expired. Please request a new one.', 400);
    }

    // Check if already verified
    if (user.isEmailVerified) {
      res.json({
        message: 'Email already verified',
        user: sanitizeUserResponse(user),
      });
      return;
    }

    // Verify email
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    // Send welcome email (async, don't wait)
    emailService.sendWelcomeEmail(
      user.email,
      user.username,
      user.languagePreference
    ).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.json({
      message: 'Email verified successfully!',
      user: sanitizeUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (req.event && req.user.role !== 'platform_admin' && user.eventId !== req.event.id) {
      throw new AppError('Cannot access user outside current event', 403);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email already verified', 400);
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.update({
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Send verification email
    await emailService.sendVerificationEmail(
      user.email,
      user.username,
      emailVerificationToken,
      user.languagePreference
    );

    res.json({
      message: 'Verification email sent successfully',
      emailVerificationSent: true,
    });
  } catch (error) {
    next(error);
  }
};
