import Redis from 'ioredis';
import { config } from './environment';

// Redis client instance
let redisClient: Redis | null = null;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  LEADERBOARD: 300, // 5 minutes - frequently updated
  MATCHES: 600, // 10 minutes - changes when matches finish
  TEAMS: 3600, // 1 hour - rarely changes
  GROUPS: 300, // 5 minutes - updated after each match
  USER_STATS: 300, // 5 minutes - updated after scoring
  DEPARTMENT_STATS: 300, // 5 minutes - updated after scoring
  BONUS_QUESTIONS: 3600, // 1 hour - rarely changes
  SCORING_RULES: 3600, // 1 hour - rarely changes
};

// Cache key prefixes
export const CACHE_KEYS = {
  LEADERBOARD_INDIVIDUAL: 'leaderboard:individual',
  LEADERBOARD_DEPARTMENT: 'leaderboard:department',
  MATCHES_ALL: 'matches:all',
  MATCHES_BY_STAGE: (stage: string) => `matches:stage:${stage}`,
  MATCH_BY_ID: (id: string) => `match:${id}`,
  TEAMS_ALL: 'teams:all',
  TEAM_BY_ID: (id: string) => `team:${id}`,
  GROUP_STANDINGS: (group: string) => `group:standings:${group}`,
  USER_PREDICTIONS: (userId: string) => `user:${userId}:predictions`,
  USER_STATS: (userId: string) => `user:${userId}:stats`,
  DEPARTMENT_STATS: (deptId: string) => `department:${deptId}:stats`,
  BONUS_QUESTIONS: 'bonus:questions',
  SCORING_RULES: 'scoring:rules',
};

/**
 * Initialize Redis client
 */
export const initRedis = async (): Promise<void> => {
  try {
    // Skip Redis if not configured or explicitly disabled (graceful degradation)
    if (!config.redis.host || process.env.REDIS_URL === 'skip' || process.env.SKIP_REDIS === 'true') {
      console.log('⚠️  Redis not configured - caching disabled (will use database only)');
      return;
    }

    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    // Connect to Redis
    await redisClient.connect();

    // Test connection
    await redisClient.ping();
    console.log('✅ Redis connection established successfully.');

    // Handle Redis errors
    redisClient.on('error', (error) => {
      console.error('❌ Redis error:', error.message);
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

  } catch (error) {
    console.error('⚠️  Failed to connect to Redis:', error);
    console.log('⚠️  Continuing without Redis - caching disabled (application will use database queries only)');
    redisClient = null;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = (): Redis | null => {
  return redisClient;
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = (): boolean => {
  return redisClient !== null && redisClient.status === 'ready';
};

/**
 * Get cached data
 * @param key Cache key
 * @returns Parsed JSON data or null
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!isRedisAvailable()) return null;

  try {
    const data = await redisClient!.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set cached data
 * @param key Cache key
 * @param value Data to cache
 * @param ttl Time to live in seconds (optional)
 */
export const setCache = async (key: string, value: any, ttl?: number): Promise<void> => {
  if (!isRedisAvailable()) return;

  try {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await redisClient!.setex(key, ttl, serialized);
    } else {
      await redisClient!.set(key, serialized);
    }
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error);
  }
};

/**
 * Delete cached data
 * @param key Cache key or pattern
 */
export const deleteCache = async (key: string): Promise<void> => {
  if (!isRedisAvailable()) return;

  try {
    await redisClient!.del(key);
  } catch (error) {
    console.error(`Redis DEL error for key ${key}:`, error);
  }
};

/**
 * Delete multiple cache keys matching a pattern
 * @param pattern Redis key pattern (e.g., "matches:*")
 */
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  if (!isRedisAvailable()) return;

  try {
    const keys = await redisClient!.keys(pattern);
    if (keys.length > 0) {
      await redisClient!.del(...keys);
      console.log(`🗑️  Deleted ${keys.length} cache keys matching "${pattern}"`);
    }
  } catch (error) {
    console.error(`Redis pattern delete error for ${pattern}:`, error);
  }
};

/**
 * Invalidate all cache (use sparingly!)
 */
export const flushCache = async (): Promise<void> => {
  if (!isRedisAvailable()) return;

  try {
    await redisClient!.flushdb();
    console.log('🗑️  Redis cache flushed');
  } catch (error) {
    console.error('Redis flush error:', error);
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
  }
};

export default {
  initRedis,
  getRedisClient,
  isRedisAvailable,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  flushCache,
  closeRedis,
  CACHE_TTL,
  CACHE_KEYS,
};
