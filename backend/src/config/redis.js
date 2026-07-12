const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  socket: {
    reconnectStrategy: false
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