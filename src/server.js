import app from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectDB } from './config/db.js';
import { seedIfEmpty } from './services/employee.service.js';
import { verifyMailTransport } from './services/mail.service.js';

const start = async () => {
  await connectDB();
  await seedIfEmpty();

  const server = app.listen(config.port, () => {
    logger.info(`API running on http://localhost:${config.port} [${config.env}]`);
    verifyMailTransport();
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully.`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
};

process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection:', reason));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});

start();
