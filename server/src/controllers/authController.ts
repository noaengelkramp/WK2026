import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User, UserStatistics, Customer } from '../models';
import { generateTokens } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import emailService from '../services/emailService';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, customerNumber, languagePreference } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !customerNumber) {
      throw new AppError('All fields are required', 400);
    }

    // Validate customer number format
    const customerNumberRegex = /^C\d{4}_\d{7}$/;
    if (!customerNumberRegex.test(customerNumber)) {
      throw new AppError('Invalid customer number format. Expected format: C1234_1234567', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Check if customer number already used
    const existingCustomerUser = await User.findOne({ where: { customerNumber } });
    if (existingCustomerUser) {
      throw new AppError('This customer number is already registered. One account per customer is allowed.', 409);
    }

    // Validate customer exists and is active
    const customer = await Customer.findOne({ where: { customerNumber } });
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

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      customerNumber,
      languagePreference: languagePreference || 'en',
      isAdmin: false,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Create user statistics
    await UserStatistics.create({
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
      user.firstName,
      emailVerificationToken,
      user.languagePreference
    ).catch(err => {
      console.error('Failed to send verification email:', err);
      // Don't block registration if email fails
    });

    // Generate tokens (allow login even without verification)
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: user.toJSON(),
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
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user with customer
    const user = await User.findOne({
      where: { email },
      include: [{ model: Customer, as: 'customer' }],
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      ...tokens,
    });
  } catch (error) {
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

    res.json({ user });
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

    // Update user
    await user.update({
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(languagePreference && { languagePreference }),
    });

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
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
        user: user.toJSON(),
      });
      return;
    }

    // Verify email
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    // Send welcome email (async, don't wait)
    emailService.sendWelcomeEmail(
      user.email,
      user.firstName,
      user.languagePreference
    ).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.json({
      message: 'Email verified successfully!',
      user: user.toJSON(),
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
      user.firstName,
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
