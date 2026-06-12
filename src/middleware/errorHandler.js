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

  // Map common Mongoose errors to sensible status codes.
  let status = err.statusCode;
  let message = err.message;
  let errors; // optional field-level array, mirrors the express-validator shape

  if (!status) {
    if (err.code === 11000) {
      status = 409; // duplicate unique key (e.g. email already registered)
      message = 'A record with that value already exists';
    } else if (err.name === 'ValidationError' && err.errors) {
      // Mongoose schema validation that slipped past express-validator.
      status = 422;
      message = 'Validation failed';
      errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    } else if (err.name === 'CastError') {
      // e.g. a malformed :id that can't be cast to an ObjectId.
      status = 400;
      message = err.path === '_id' ? 'Invalid id' : `Invalid value for ${err.path}`;
    } else if (err.name === 'MulterError') {
      status = 400;
    } else {
      status = 500;
    }
  }

  logger.error(err.message);
  if (status >= 500) logger.error(err.stack);

  const body = {
    success: false,
    message: status >= 500 && config.isProd ? 'Something went wrong. Please try again later.' : message,
  };
  if (errors) body.errors = errors;
  res.status(status).json(body);
};
