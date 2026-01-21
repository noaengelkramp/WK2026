import { Request, Response, NextFunction } from 'express';
import { User, UserStatistics, Department } from '../models';
import { generateTokens } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, departmentId, languagePreference } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !departmentId) {
      throw new AppError('All fields are required', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Validate department exists
    const department = await Department.findByPk(departmentId);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      departmentId,
      languagePreference: languagePreference || 'en',
      isAdmin: false,
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

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
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

    // Find user with department
    const user = await User.findOne({
      where: { email },
      include: [{ model: Department, as: 'department' }],
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
        { model: Department, as: 'department' },
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
