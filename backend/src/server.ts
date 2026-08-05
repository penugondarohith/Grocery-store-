import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import prisma from './config/database';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 GroceryMart API running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`📖 Swagger docs: http://localhost:${env.PORT}/api/${env.API_VERSION}/docs`);
  logger.info(`❤️  Health check: http://localhost:${env.PORT}/health`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Could not close connections in time, forcing exit');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});
