const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const redisUrl = process.env.REDIS_URL;

const connection = redisUrl
  ? new IORedis(redisUrl, {
      maxRetriesPerRequest: null
    })
  : new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null
    });

const orderQueue = new Queue('orderQueue', {
  connection
});

module.exports = {
  connection,
  orderQueue
};
