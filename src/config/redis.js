const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  lazyConnect: true,
});

const connectRedis = async () => {
  try {
    await redis.connect();
    console.log('✅ Redis connected');
  } catch (error) {
    console.warn('❌ Redis unavailable:', error.message);
  }
};

module.exports = { redis, connectRedis };
