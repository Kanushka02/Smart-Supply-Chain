const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middleware/authMiddleware');

const createResponse = () => {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res)
  };

  return res;
};

describe('Auth middleware', () => {
  it('adds decoded user data to the request for a valid bearer token', () => {
    const token = jwt.sign(
      {
        id: 1,
        role: 'ADMIN'
      },
      process.env.JWT_SECRET
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.user).toEqual(
      expect.objectContaining({
        id: 1,
        role: 'ADMIN'
      })
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when the token is missing', () => {
    const req = {
      headers: {}
    };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the token is invalid', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token'
      }
    };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
