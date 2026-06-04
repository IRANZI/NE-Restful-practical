import path from 'path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { env } from '../config/env';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware';
import { proxyTo } from './proxy';

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/openapi.yaml'));
const swaggerHelmet = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
});

app.use(
  cors({
    // Allow both common local browser origins so localhost/127.0.0.1 do not fail CORS.
    origin:
      env.frontendOrigin === '*'
        ? '*'
        : [env.frontendOrigin, 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true
  })
);
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/api-docs', swaggerHelmet, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(helmet());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api-gateway',
    services: {
      auth: env.serviceUrls.auth,
      extinguishers: env.serviceUrls.extinguishers,
      inspections: env.serviceUrls.inspections,
      reports: env.serviceUrls.reports,
      notifications: env.serviceUrls.notifications
    },
    timestamp: new Date().toISOString()
  });
});

app.use('/api', express.raw({ type: '*/*', limit: '1mb' }));
app.use('/api/auth', proxyTo(env.serviceUrls.auth));
app.use('/api/users', proxyTo(env.serviceUrls.auth));
app.use('/api/extinguishers', proxyTo(env.serviceUrls.extinguishers));
app.use('/api/inspections', proxyTo(env.serviceUrls.inspections));
app.use('/api/maintenance', proxyTo(env.serviceUrls.inspections));
app.use('/api/reports', proxyTo(env.serviceUrls.reports));
app.use('/api/notifications', proxyTo(env.serviceUrls.notifications));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
