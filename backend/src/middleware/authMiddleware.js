const jwt = require('jsonwebtoken');

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

module.exports = (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        message: 'No token'
      });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);

    return next();
  } catch {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }
};
