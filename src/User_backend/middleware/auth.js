import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    console.log(decoded)
    req.userId = decoded.userId;
    console.log(req.userId)
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

export default auth;