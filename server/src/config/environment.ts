import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Database
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    name: process.env.DATABASE_NAME || 'wk2026',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    url: process.env.DATABASE_URL || `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // External API - API-Football (FREE TIER - 100 requests/day)
  footballApi: {
    key: process.env.FOOTBALL_API_KEY || '', // Get free key from https://www.api-football.com/
    baseUrl: process.env.FOOTBALL_API_BASE_URL || 'https://v3.football.api-sports.io',
    // World Cup 2026 IDs (will be available closer to tournament)
    leagueId: process.env.FOOTBALL_LEAGUE_ID || '1', // World Cup = 1
    season: process.env.FOOTBALL_SEASON || '2026',
  },

  // Tournament Settings
  tournament: {
    predictionDeadline: new Date(process.env.PREDICTION_DEADLINE || '2026-06-11T23:00:00Z'),
    tournamentStart: new Date(process.env.TOURNAMENT_START || '2026-06-11T00:00:00Z'),
    tournamentEnd: new Date(process.env.TOURNAMENT_END || '2026-07-19T23:59:59Z'),
  },

  // Email (SMTP)
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@wk2026.com',
  },

  // Redis (optional, for caching)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config;
