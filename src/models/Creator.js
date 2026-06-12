import mongoose from 'mongoose';

// Single source of truth for enums — imported by validators and controllers.
export const CREATOR_STATUSES = ['pending', 'under_review', 'approved', 'rejected', 'suspended'];
export const SOCIAL_PLATFORMS = ['instagram', 'youtube', 'linkedin', 'twitter', 'facebook', 'tiktok', 'other'];
export const AUDIENCE_AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+', 'mixed'];
export const PAYOUT_METHODS = ['bank', 'upi', 'paypal'];
export const RATE_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

// One social platform entry: link + follower count + average engagement metrics.
const socialProfileSchema = new mongoose.Schema(
  {
    platform: { type: String, enum: SOCIAL_PLATFORMS, required: true },
    url: { type: String, required: true, trim: true },
    handle: { type: String, trim: true, default: '' },
    followerCount: { type: Number, min: 0, default: 0 },
    avgLikes: { type: Number, min: 0, default: 0 },
    avgComments: { type: Number, min: 0, default: 0 },
    avgShares: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const creatorSchema = new mongoose.Schema(
  {
    // ── Account / auth ───────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Never selected by default — kept out of every query unless explicitly requested.
    passwordHash: { type: String, required: true, select: false },

    // ── 1. Basic identity & contact ──────────────────────────────────
    fullLegalName: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    dateOfBirth: { type: Date, default: null },
    address: {
      line: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: 'India' },
    },

    // ── 2. Digital presence & audience insights ──────────────────────
    socialProfiles: { type: [socialProfileSchema], default: [] },
    audience: {
      primaryAgeRange: { type: String, enum: [...AUDIENCE_AGE_RANGES, ''], default: '' },
      genderSplit: {
        male: { type: Number, min: 0, max: 100, default: 0 },
        female: { type: Number, min: 0, max: 100, default: 0 },
        other: { type: Number, min: 0, max: 100, default: 0 },
      },
      topLocations: { type: [String], default: [] },
    },
    // Overall engagement rate in percent (more important than follower count).
    engagementRate: { type: Number, min: 0, max: 100, default: null },

    // ── 3. Professional work portfolio ───────────────────────────────
    portfolioUrl: { type: String, trim: true, default: '' },
    niche: { type: [String], default: [] },
    previousBrands: { type: [String], default: [] },
    sampleContent: { type: [String], default: [] },

    // ── 5. Legal & commercial details ────────────────────────────────
    rateCard: {
      currency: { type: String, enum: RATE_CURRENCIES, default: 'INR' },
      perVideo: { type: Number, min: 0, default: null },
      perReel: { type: Number, min: 0, default: null },
      perPost: { type: Number, min: 0, default: null },
    },
    payout: {
      method: { type: String, enum: [...PAYOUT_METHODS, ''], default: '' },
      bankAccountName: { type: String, trim: true, default: '' },
      bankAccountNumber: { type: String, trim: true, default: '' },
      ifsc: { type: String, trim: true, uppercase: true, default: '' },
      upiId: { type: String, trim: true, default: '' },
      paypalEmail: { type: String, trim: true, lowercase: true, default: '' },
    },
    tax: {
      pan: { type: String, trim: true, uppercase: true, default: '' },
      gstin: { type: String, trim: true, uppercase: true, default: '' },
    },
    consent: {
      nda: { type: Boolean, default: false },
      brandGuidelines: { type: Boolean, default: false },
      consentedAt: { type: Date, default: null },
    },

    // ── 6. Admin vetting (internal use only — stripped from creator responses) ──
    status: { type: String, enum: CREATOR_STATUSES, default: 'pending' },
    internalRating: { type: Number, min: 1, max: 5, default: null },
    adminRemarks: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// True once the creator has filled the minimum needed for the admin to vet them.
creatorSchema.virtual('profileComplete').get(function () {
  return Boolean(
    this.fullLegalName &&
      this.phone &&
      this.dateOfBirth &&
      this.socialProfiles?.length &&
      this.niche?.length &&
      this.consent?.nda &&
      this.consent?.brandGuidelines
  );
});

// Expose `id`, hide `_id` / `__v`, and never leak the password hash in responses.
creatorSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
});

export const Creator = mongoose.model('Creator', creatorSchema);
