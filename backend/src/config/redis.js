const redis = require('redis');

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT || 6379;
const defaultRedisUrl = redisHost ? `redis://${redisHost}:${redisPort}` : 'redis://127.0.0.1:6379';
const redisUrl = process.env.REDIS_URL || defaultRedisUrl;

const client = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
  }
});

client.on('connect', () => {
  console.log('Redis connected');
});

client.on('error', (error) => {
  console.log('Redis error', error);
});

client.connect().catch((error) => {
  console.log('Redis connection failed', error);
});

module.exports = client;