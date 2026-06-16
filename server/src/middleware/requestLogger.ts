import pinoHttp from 'pino-http';
import { logger } from '../lib/logger';

export const requestLogger = pinoHttp({
  logger,
  // Do not log the health check endpoint to reduce noise
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },
});
