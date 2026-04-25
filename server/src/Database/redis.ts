import Redis from 'ioredis';

/**
 * 🚀 Centralized Redis Client (ioredis)
 * Singleton — shared across all modules. BullMQ calls .duplicate() internally
 * for its own Queue/Worker connections, those are separate and expected.
 */

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Singleton: reuse across hot-reloads in development
const globalForRedis = global as unknown as { redis: Redis; redisReady: boolean };

const redis = globalForRedis.redis || new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: true,
  connectTimeout: 10000,
  keepAlive: 10000,
  // Back off quickly at first, then slow down — avoids hammering Upstash on startup
  retryStrategy(times) {
    if (times > 20) return null; // Give up after 20 attempts (server is likely misconfigured)
    return Math.min(times * 200, 5000);
  },
});

if (!globalForRedis.redis) {
  globalForRedis.redis = redis;
  globalForRedis.redisReady = false;
}

// Log only on the first successful 'ready' event — not on every reconnect
if (redis.listeners('ready').length === 0) {
  redis.on('ready', () => {
    if (!globalForRedis.redisReady) {
      console.log('✅ Redis connected');
      globalForRedis.redisReady = true;
    }
  });
}

if (redis.listeners('error').length === 0) {
  redis.on('error', (err: Error) => {
    // Suppress harmless Upstash idle-timeout resets
    if ((err as any).code === 'ECONNRESET' || err.message.includes('ECONNRESET')) return;
    console.error('❌ Redis error:', err.message);
  });
}

export default redis;
