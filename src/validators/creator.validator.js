import { body } from 'express-validator';
import {
  CREATOR_STATUSES,
  SOCIAL_PLATFORMS,
  AUDIENCE_AGE_RANGES,
  PAYOUT_METHODS,
  RATE_CURRENCIES,
} from '../models/Creator.js';

const URL_OPTS = { protocols: ['http', 'https'], require_protocol: true };

export const creatorSignupRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 80 }).withMessage('Name is too long'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('A valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters'),
];

export const creatorLoginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('A valid email is required')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// Profile completion / update. Everything is optional (partial updates are
// allowed) — but anything that IS sent must be valid.
export const creatorProfileRules = [
  // Display name (set at signup) can be edited here; cannot be blanked.
  body('name')
    .optional().trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 80 }).withMessage('Name is too long'),

  // ── 1. Basic identity & contact ───────────────────────────────────
  body('fullLegalName')
    .optional({ checkFalsy: true }).trim()
    .isLength({ max: 120 }).withMessage('Full legal name is too long'),

  body('phone')
    .optional({ checkFalsy: true }).trim()
    .matches(/^\+?[0-9\s().-]{6,20}$/).withMessage('Phone number looks invalid'),

  body('dateOfBirth')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const ageYears = (Date.now() - new Date(value).getTime()) / (365.25 * 24 * 3600 * 1000);
      if (ageYears < 18) throw new Error('Creators must be at least 18 years old');
      if (ageYears > 100) throw new Error('Date of birth looks invalid');
      return true;
    }),

  body('address.line').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('address.city').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('address.state').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('address.pincode').optional({ checkFalsy: true }).trim().isLength({ max: 12 }),
  body('address.country').optional({ checkFalsy: true }).trim().isLength({ max: 60 }),

  // ── 2. Digital presence & audience insights ───────────────────────
  body('socialProfiles')
    .optional()
    .isArray({ max: 10 }).withMessage('socialProfiles must be an array of at most 10 entries'),
  body('socialProfiles.*.platform')
    .isIn(SOCIAL_PLATFORMS).withMessage(`platform must be one of: ${SOCIAL_PLATFORMS.join(', ')}`),
  body('socialProfiles.*.url')
    .isURL(URL_OPTS).withMessage('Each social profile needs a valid http(s) URL'),
  body('socialProfiles.*.handle').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('socialProfiles.*.followerCount').optional().isInt({ min: 0 }).withMessage('followerCount must be a non-negative integer').toInt(),
  body('socialProfiles.*.avgLikes').optional().isInt({ min: 0 }).toInt(),
  body('socialProfiles.*.avgComments').optional().isInt({ min: 0 }).toInt(),
  body('socialProfiles.*.avgShares').optional().isInt({ min: 0 }).toInt(),

  body('audience.primaryAgeRange')
    .optional({ checkFalsy: true })
    .isIn(AUDIENCE_AGE_RANGES).withMessage(`primaryAgeRange must be one of: ${AUDIENCE_AGE_RANGES.join(', ')}`),
  body('audience.genderSplit.male').optional().isFloat({ min: 0, max: 100 }).toFloat(),
  body('audience.genderSplit.female').optional().isFloat({ min: 0, max: 100 }).toFloat(),
  body('audience.genderSplit.other').optional().isFloat({ min: 0, max: 100 }).toFloat(),
  // The percentages provided in this request must not total more than 100.
  body('audience.genderSplit').optional().custom((gs) => {
    if (gs && typeof gs === 'object' && !Array.isArray(gs)) {
      const sum = ['male', 'female', 'other'].reduce((acc, k) => acc + (Number(gs[k]) || 0), 0);
      if (sum > 100) throw new Error('genderSplit percentages cannot total more than 100');
    }
    return true;
  }),
  body('audience.topLocations')
    .optional()
    .isArray({ max: 10 }).withMessage('topLocations can list at most 10 locations'),
  body('audience.topLocations.*').trim().isLength({ min: 1, max: 80 }),

  body('engagementRate')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 }).withMessage('engagementRate must be between 0 and 100')
    .toFloat(),

  // ── 3. Professional work portfolio ────────────────────────────────
  body('portfolioUrl')
    .optional({ checkFalsy: true })
    .isURL(URL_OPTS).withMessage('Portfolio link must be a valid http(s) URL'),
  body('niche')
    .optional()
    .isArray({ max: 10 }).withMessage('niche can list at most 10 categories'),
  body('niche.*').trim().isLength({ min: 1, max: 60 }),
  body('previousBrands')
    .optional()
    .isArray({ max: 50 }).withMessage('previousBrands can list at most 50 brands'),
  body('previousBrands.*').trim().isLength({ min: 1, max: 80 }),
  body('sampleContent')
    .optional()
    .isArray({ max: 5 }).withMessage('sampleContent can list at most 5 links'),
  body('sampleContent.*').isURL(URL_OPTS).withMessage('Each sample content item must be a valid http(s) URL'),

  // ── 5. Legal & commercial details ─────────────────────────────────
  body('rateCard.currency')
    .optional({ checkFalsy: true })
    .isIn(RATE_CURRENCIES).withMessage(`currency must be one of: ${RATE_CURRENCIES.join(', ')}`),
  body('rateCard.perVideo').optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
  body('rateCard.perReel').optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
  body('rateCard.perPost').optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),

  body('payout.method')
    .optional({ checkFalsy: true })
    .isIn(PAYOUT_METHODS).withMessage(`payout method must be one of: ${PAYOUT_METHODS.join(', ')}`),
  body('payout.bankAccountName').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('payout.bankAccountNumber')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{6,20}$/).withMessage('Bank account number must be 6–20 digits'),
  body('payout.ifsc')
    .optional({ checkFalsy: true })
    .customSanitizer((v) => String(v).toUpperCase().trim())
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('IFSC code looks invalid (e.g. HDFC0001234)'),
  body('payout.upiId')
    .optional({ checkFalsy: true }).trim()
    .matches(/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/).withMessage('UPI ID looks invalid (e.g. name@upi)'),
  body('payout.paypalEmail')
    .optional({ checkFalsy: true }).trim()
    .isEmail().withMessage('PayPal email looks invalid'),

  body('tax.pan')
    .optional({ checkFalsy: true })
    .customSanitizer((v) => String(v).toUpperCase().trim())
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage('PAN looks invalid (format: ABCDE1234F)'),
  body('tax.gstin')
    .optional({ checkFalsy: true })
    .customSanitizer((v) => String(v).toUpperCase().trim())
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/).withMessage('GSTIN looks invalid'),

  body('consent.nda')
    .optional()
    .isBoolean({ strict: true }).withMessage('consent.nda must be true or false'),
  body('consent.brandGuidelines')
    .optional()
    .isBoolean({ strict: true }).withMessage('consent.brandGuidelines must be true or false'),
];

// Admin vetting — status / rating / remarks.
export const creatorVettingRules = [
  body('status')
    .optional()
    .isIn(CREATOR_STATUSES).withMessage(`Status must be one of: ${CREATOR_STATUSES.join(', ')}`),
  body('internalRating')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 }).withMessage('internalRating must be an integer from 1 to 5')
    .toInt(),
  body('adminRemarks')
    .optional().trim()
    .isLength({ max: 1000 }).withMessage('adminRemarks is too long (max 1000 characters)'),
];
