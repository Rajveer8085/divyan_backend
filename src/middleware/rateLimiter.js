import rateLimit from 'express-rate-limit';

// Throttle the contact endpoint to deter spam/abuse: 5 submissions / 15 min / IP.
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions from this IP. Please try again in a little while.',
  },
});
