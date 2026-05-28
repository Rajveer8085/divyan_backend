import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  logger.error(err.message);
  if (status >= 500) logger.error(err.stack);

  res.status(status).json({
    success: false,
    message: status >= 500 && config.isProd ? 'Something went wrong. Please try again later.' : err.message,
  });
};
