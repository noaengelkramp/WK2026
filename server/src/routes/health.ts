import { Router, Request, Response } from 'express';
import { testConnection } from '../config/database';
import { getRedisClient } from '../config/redis';

const router = Router();

/**
 * Health check endpoint
 * Returns status of database and Redis connections
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      netlify: process.env.NETLIFY === 'true',
      database: 'unknown',
      redis: 'unknown',
    };

    // Check database connection
    try {
      await testConnection();
      health.database = 'connected';
    } catch (error) {
      health.database = 'disconnected';
      health.status = 'degraded';
      console.error('Health check - database error:', error);
    }

    // Check Redis connection
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        await redisClient.ping();
        health.redis = 'connected';
      } catch (error) {
        health.redis = 'disconnected';
        console.error('Health check - redis error:', error);
      }
    } else {
      health.redis = 'not configured';
    }

    // Return appropriate status code
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
