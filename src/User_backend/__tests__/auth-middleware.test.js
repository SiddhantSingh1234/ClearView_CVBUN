import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/auth.js';

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next() when token is valid', () => {
    const token = jwt.sign({ userId: 'user123' }, 'your-secret-key');
    req.header.mockReturnValue(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(req.userId).toBe('user123');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when no token is provided', () => {
    req.header.mockReturnValue(null);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 when token is invalid', () => {
    req.header.mockReturnValue('Bearer invalidtoken');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});