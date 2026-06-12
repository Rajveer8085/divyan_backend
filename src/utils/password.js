import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

// Hash a plaintext password with a unique random salt (scrypt — OWASP-recommended,
// built into Node, no native dependency). Stored as "salt:hash".
export const hashPassword = async (plain) => {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(plain, salt, KEYLEN);
  return `${salt}:${derived.toString('hex')}`;
};

// Constant-time verification to avoid leaking timing information.
export const verifyPassword = async (plain, stored) => {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hashHex] = stored.split(':');
  const expected = Buffer.from(hashHex, 'hex');
  const derived = await scryptAsync(plain, salt, KEYLEN);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
};
