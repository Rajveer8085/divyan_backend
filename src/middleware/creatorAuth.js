import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { getCreatorById } from '../services/creator.service.js';

// Name of the httpOnly cookie that carries the creator's session token.
export const CREATOR_COOKIE = 'creator_token';

// Protects creator-only routes. Reads the JWT from the httpOnly cookie first,
// falling back to an Authorization: Bearer header for non-browser clients.
// Then re-checks the live account so suspended/deleted accounts lose access
// immediately instead of lingering until the 7-day token expires.
export const requireCreatorAuth = async (req, res, next) => {
  const fromCookie = req.cookies?.[CREATOR_COOKIE];
  const header = req.headers.authorization || '';
  const fromHeader = header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = fromCookie || fromHeader;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }

  // Reject admin (or any non-creator) tokens on creator routes.
  if (payload.role !== 'creator') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  try {
    const creator = await getCreatorById(payload.sub);
    if (!creator) {
      return res.status(401).json({ success: false, message: 'Account no longer exists' });
    }
    if (creator.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }
    req.creator = payload;
    req.creatorDoc = creator; // reused by handlers to avoid a second DB query
    next();
  } catch (err) {
    next(err);
  }
};
