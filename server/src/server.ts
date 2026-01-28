import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/environment';
import { testConnection, syncDatabase } from './config/database';
import { initRedis, closeRedis, isRedisAvailable } from './config/redis';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

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

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    redis: isRedisAvailable() ? 'connected' : 'disconnected'
  });
});

// API Routes
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

    // Don't force sync in production - use migrations instead
    const shouldForceSync = config.nodeEnv === 'development';
    await syncDatabase(shouldForceSync);

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
    closeRedis().finally(() => process.exit(1));
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    closeRedis().finally(() => process.exit(1));
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

  // Start the server
  startServer();
} else {
  // In Netlify environment, just initialize connections
  // The serverless-express wrapper will handle requests
  console.log('🌐 Running in Netlify serverless mode');
  initializeConnections().catch(error => {
    console.error('❌ Failed to initialize in serverless mode:', error);
  });
}

export default app;
