import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
};
