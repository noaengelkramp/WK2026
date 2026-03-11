import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment';
import { testConnection, syncDatabase } from './config/database';
import { initRedis, closeRedis, isRedisAvailable } from './config/redis';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import models to ensure they're registered with Sequelize before sync
import './models';

// Import routes
import authRoutes from './routes/auth';
import teamRoutes from './routes/teams';
import matchRoutes from './routes/matches';
import predictionRoutes from './routes/predictions';
import standingsRoutes from './routes/standings';
import scoringRulesRoutes from './routes/scoringRules';
import bonusQuestionsRoutes from './routes/bonusQuestions';
import adminRoutes from './routes/admin';
import setupRoutes from './routes/setup';

const app: Application = express();

// Body parser - MUST be before any routes or rate limiters that use req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiter to all requests
app.use(limiter);

// Specific limiter for auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login/register attempts, please try again after 15 minutes',
});

app.use('/api/auth', authLimiter);

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', async (_req, res) => {
  try {
    const health: any = { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      netlify: process.env.NETLIFY === 'true',
      redis: isRedisAvailable() ? 'connected' : 'disconnected',
      database: 'unknown'
    };

    // Test database connection
    try {
      await testConnection();
      health.database = 'connected';
    } catch (error: any) {
      health.database = 'disconnected';
      health.status = 'degraded';
      health.databaseError = error.message;
      console.error('Health check - database error:', error);
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      message: 'Health check failed'
    });
  }
});

// API Routes
app.use('/api/health', async (_req, res) => {
  try {
    const health: any = { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      netlify: process.env.NETLIFY === 'true',
      redis: isRedisAvailable() ? 'connected' : 'disconnected',
      database: 'unknown'
    };

    // Test database connection
    try {
      await testConnection();
      health.database = 'connected';
    } catch (error: any) {
      health.database = 'disconnected';
      health.status = 'degraded';
      health.databaseError = error.message;
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString()
    });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/scoring-rules', scoringRulesRoutes);
app.use('/api/bonus-questions', bonusQuestionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/setup', setupRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Initialize database and Redis connections
// This runs on both local development and serverless environments
const initializeConnections = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize Redis (optional - graceful degradation if not available)
    await initRedis();

    // NEVER sync database in Netlify serverless environment
    // In production/Netlify, tables must exist from migrations
    const isNetlify = process.env.NETLIFY === 'true';
    const isProduction = config.nodeEnv === 'production';
    
    if (isNetlify || isProduction) {
      console.log('✅ Skipping database sync (production/Netlify - using migrations)');
      console.log(`   Environment: ${config.nodeEnv}, Netlify: ${isNetlify}`);
    } else {
      // Only sync in local development
      await syncDatabase(false); // Change to false to prevent wiping the database
      console.log('✅ Database synced (development mode)');
    }

    console.log('✅ Database and connections initialized');
  } catch (error) {
    console.error('❌ Failed to initialize connections:', error);
    throw error;
  }
};

// Start server (only for local development)
const startServer = async () => {
  try {
    await initializeConnections();

    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🗄️  Database: ${config.database.name}`);
      console.log(`🌐 Client URL: ${config.clientUrl}`);
      console.log(`⚡ Redis: ${isRedisAvailable() ? 'Connected' : 'Disabled (using database only)'}`);
      console.log(`⚽ Football API: ${config.footballApi.key ? 'Configured' : 'Not configured'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if not in Netlify serverless environment
if (process.env.NETLIFY !== 'true') {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('⚠️  SIGTERM received, shutting down gracefully...');
    await closeRedis();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('⚠️  SIGINT received, shutting down gracefully...');
    await closeRedis();
    process.exit(0);
  });

  startServer();
}

// Export initialization promise for serverless environments
// This allows the Netlify function to wait for initialization before handling requests
export const initPromise = process.env.NETLIFY === 'true' 
  ? initializeConnections()
  : Promise.resolve();

export default app;
