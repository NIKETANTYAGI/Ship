import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err: Error) => {
  console.error('Redis connection error:', err.message);
});

// Test ping on startup
redis.ping().then((result) => {
  console.log('Redis PING:', result); // Should print "PONG"
});

export default redis;
