import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  if (!config.mongoUri) {
    logger.warn('MONGO_URI not set — database features will not work. Set it in .env.');
    return;
  }

  mongoose.connection.on('connected', () => logger.info('MongoDB connected.'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected.'));

  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  } catch (err) {
    // Don't crash the server — log clearly; mongoose will keep retrying in the background.
    logger.error('MongoDB initial connection failed:', err.message);
  }
};
