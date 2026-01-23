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
import departmentRoutes from './routes/departments';
import teamRoutes from './routes/teams';
import matchRoutes from './routes/matches';
import predictionRoutes from './routes/predictions';
import standingsRoutes from './routes/standings';
import scoringRulesRoutes from './routes/scoringRules';
import bonusQuestionsRoutes from './routes/bonusQuestions';
import adminRoutes from './routes/admin';

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
app.use('/api/departments', departmentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/scoring-rules', scoringRulesRoutes);
app.use('/api/bonus-questions', bonusQuestionsRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize Redis (optional - graceful degradation if not available)
    await initRedis();

    // Sync database (create tables)
    await syncDatabase(false); // Set to true to force recreate tables

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

export default app;
