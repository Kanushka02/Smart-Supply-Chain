const redis = require('../config/redis');

const cache = async (req, res, next) => {
  try {
    const key = req.originalUrl;
    const cachedData = await redis.get(key);

    if (cachedData) {
      console.log('Cache Hit');
      return res.json(JSON.parse(cachedData));
    }

    console.log('Cache Miss');
    next();
  } catch (error) {
    console.error('Cache middleware error', error);
    next();
  }
};

module.exports = cache;