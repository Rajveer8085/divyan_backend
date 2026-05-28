import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const toNumber = (value, fallback) => (value !== undefined ? Number(value) : fallback);
const env = process.env.NODE_ENV || 'development';


console.log(process.env.CLIENT_URL,"this is cleint url on server ")
export const config = {
  env,
  isProd: env === 'production',
  isTest: env === 'test',
  port: toNumber(process.env.PORT, 9999),
  mongoUri: process.env.MONGO_URI || '',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  smtp: {
    host: process.env.SMTP_HOST,
    port: toNumber(process.env.SMTP_PORT, 587),
    secure: String(process.env.SMTP_SECURE) === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  mailFrom: process.env.MAIL_FROM || 'Divyan Technologies <no-reply@divyan.co.in>',
  adminEmail: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  admin: {
    email: (process.env.ADMIN_LOGIN_EMAIL || 'admin@rjvr.com').toLowerCase(),
    password: process.env.ADMIN_LOGIN_PASSWORD || 'Rajveer',
  },
};

// Warn (don't crash) if mail isn't configured — lets the server boot for local testing.
const requiredMail = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
const missing = requiredMail.filter((key) => !process.env[key]);
if (missing.length) {
  logger.warn(
    `Missing SMTP env vars: ${missing.join(', ')}. Email delivery will fail until set. ` +
      `Copy .env.example to .env and fill in the values.`
  );
}
