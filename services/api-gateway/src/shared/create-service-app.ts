import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from '../config/env';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware';

export function createServiceApp(serviceName: string) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendOrigin === '*' ? '*' : env.frontendOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: serviceName,
      timestamp: new Date().toISOString()
    });
  });

  return app;
}

export function attachServiceErrorHandlers(app: express.Express) {
  app.use(notFoundHandler);
  app.use(errorHandler);
}
