import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const emailOk = String(email || '').trim().toLowerCase() === config.admin.email;
  const passOk = String(password || '') === config.admin.password;

  if (!emailOk || !passOk) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign({ sub: config.admin.email, role: 'admin' }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  res.json({ success: true, token, user: { email: config.admin.email, role: 'admin' } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: { email: req.user.sub, role: req.user.role } });
});
