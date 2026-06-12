import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    // Tokens are signed with the same secret across roles (admin, creator).
    // Admin routes must reject any non-admin token to prevent privilege escalation.
    if (payload.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
};
