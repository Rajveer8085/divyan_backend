import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { removeUploadedFile } from './upload.js';

export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // A file may have been saved by multer before the request failed (e.g. validation
  // error, 404). Remove it so failed requests don't leave orphaned uploads behind.
  if (req.file?.filename) removeUploadedFile(`/uploads/${req.file.filename}`);

  const status = err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  logger.error(err.message);
  if (status >= 500) logger.error(err.stack);

  res.status(status).json({
    success: false,
    message: status >= 500 && config.isProd ? 'Something went wrong. Please try again later.' : err.message,
  });
};
