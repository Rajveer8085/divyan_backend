import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { CREATOR_COOKIE } from '../middleware/creatorAuth.js';
import { CREATOR_STATUSES } from '../models/Creator.js';
import { logger } from '../utils/logger.js';
import * as repo from '../services/creator.service.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Admin-only vetting fields — never sent to the creator themselves.
const INTERNAL_FIELDS = ['internalRating', 'adminRemarks'];

const sanitizeForCreator = (creatorDoc) => {
  const obj = creatorDoc.toJSON();
  INTERNAL_FIELDS.forEach((f) => delete obj[f]);
  return obj;
};

// Cookie attributes. In production: Secure + SameSite=None so the cookie works
// when the frontend lives on a different domain (and only over HTTPS).
const cookieOptions = () => ({
  httpOnly: true,
  secure: config.isProd,
  sameSite: config.isProd ? 'none' : 'lax',
  maxAge: SEVEN_DAYS_MS,
  path: '/',
});

const signToken = (creator) =>
  jwt.sign({ sub: creator.id, role: 'creator', email: creator.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

// ── Public: creator signup ────────────────────────────────────────────
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await repo.findCreatorByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const creator = await repo.createCreator({ name, email, passwordHash });
  logger.info(`New creator signed up (id: ${creator.id}, email: ${creator.email}).`);

  const token = signToken(creator);
  res.cookie(CREATOR_COOKIE, token, cookieOptions());
  res.status(201).json({ success: true, token, creator: sanitizeForCreator(creator) });
});

// ── Public: creator login ─────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const creator = await repo.findCreatorByEmail(email, true);
  const passwordOk = creator && (await verifyPassword(password, creator.passwordHash));

  // Same generic message whether the email exists or not.
  if (!passwordOk) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (creator.status === 'suspended') {
    const err = new Error('Your account has been suspended. Please contact support.');
    err.statusCode = 403;
    throw err;
  }

  const token = signToken(creator);
  res.cookie(CREATOR_COOKIE, token, cookieOptions());
  res.json({ success: true, token, creator: sanitizeForCreator(creator) });
});

// ── Public: logout (clears the cookie) ────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(CREATOR_COOKIE, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true, message: 'Logged out' });
});

// ── Creator: own profile ──────────────────────────────────────────────
// req.creatorDoc is loaded fresh by requireCreatorAuth — no extra query needed.
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, creator: sanitizeForCreator(req.creatorDoc) });
});

// ── Creator: complete / update own profile ────────────────────────────
// Whitelisted fields only — email/password and admin vetting fields
// (status, internalRating, adminRemarks) can never be set here.
const SCALAR_FIELDS = ['name', 'fullLegalName', 'phone', 'dateOfBirth', 'engagementRate', 'portfolioUrl'];
const ARRAY_FIELDS = ['socialProfiles', 'niche', 'previousBrands', 'sampleContent'];
const OBJECT_FIELDS = ['address', 'audience', 'rateCard', 'payout', 'tax'];

// Flattens {address: {city: 'X'}} into {'address.city': 'X'} so MongoDB merges
// nested objects field-by-field instead of overwriting the whole subdocument.
const flattenInto = (obj, prefix, out) => {
  for (const [key, value] of Object.entries(obj)) {
    const path = `${prefix}.${key}`;
    if (value && typeof value === 'object' && !Array.isArray(value)) flattenInto(value, path, out);
    else out[path] = value;
  }
  return out;
};

export const updateProfile = asyncHandler(async (req, res) => {
  const set = {};

  SCALAR_FIELDS.forEach((f) => {
    if (req.body[f] !== undefined) set[f] = req.body[f];
  });
  ARRAY_FIELDS.forEach((f) => {
    if (Array.isArray(req.body[f])) set[f] = req.body[f];
  });
  OBJECT_FIELDS.forEach((f) => {
    if (req.body[f] && typeof req.body[f] === 'object' && !Array.isArray(req.body[f])) {
      flattenInto(req.body[f], f, set);
    }
  });

  // Consent: record the acceptance timestamp the moment both boxes become true.
  const consent = req.body.consent;
  if (consent && typeof consent === 'object') {
    const current = req.creatorDoc; // fresh doc from requireCreatorAuth
    const nda = consent.nda !== undefined ? consent.nda === true : current.consent.nda;
    const brand =
      consent.brandGuidelines !== undefined
        ? consent.brandGuidelines === true
        : current.consent.brandGuidelines;

    if (consent.nda !== undefined) set['consent.nda'] = consent.nda === true;
    if (consent.brandGuidelines !== undefined) set['consent.brandGuidelines'] = consent.brandGuidelines === true;
    if (nda && brand && !current.consent.consentedAt) set['consent.consentedAt'] = new Date();
  }

  if (!Object.keys(set).length) {
    const err = new Error('No valid profile fields provided');
    err.statusCode = 422;
    throw err;
  }

  const creator = await repo.updateCreatorById(req.creator.sub, set);
  if (!creator) {
    const err = new Error('Account not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, creator: sanitizeForCreator(creator) });
});

// ── Admin: list creators (newest first), optional ?status= filter ─────
export const listCreators = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status !== undefined) {
    if (!CREATOR_STATUSES.includes(req.query.status)) {
      const err = new Error(`status filter must be one of: ${CREATOR_STATUSES.join(', ')}`);
      err.statusCode = 422;
      throw err;
    }
    filter.status = req.query.status;
  }
  res.json({ success: true, data: await repo.listCreators(filter) });
});

// ── Admin: vetting — status / internal rating / remarks ───────────────
export const updateVetting = asyncHandler(async (req, res) => {
  const patch = {};
  if (req.body.status !== undefined) patch.status = req.body.status;
  if (req.body.internalRating !== undefined) patch.internalRating = req.body.internalRating;
  if (req.body.adminRemarks !== undefined) patch.adminRemarks = req.body.adminRemarks;

  if (!Object.keys(patch).length) {
    const err = new Error('Provide at least one of: status, internalRating, adminRemarks');
    err.statusCode = 422;
    throw err;
  }

  const creator = await repo.updateCreatorById(req.params.id, patch);
  if (!creator) {
    const err = new Error('Creator not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: creator });
});

// ── Admin: delete a creator ───────────────────────────────────────────
export const deleteCreator = asyncHandler(async (req, res) => {
  const removed = await repo.deleteCreator(req.params.id);
  if (!removed) {
    const err = new Error('Creator not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, message: 'Creator removed' });
});
