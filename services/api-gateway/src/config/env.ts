import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
// Workspace services run from their own folders, so also read the root .env in local dev.
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

function readBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) {
    return fallback;
  }

  return ['true', '1', 'yes'].includes(value.toLowerCase());
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  gatewayPort: Number(process.env.GATEWAY_PORT ?? process.env.PORT ?? 4008),
  authServicePort: Number(process.env.AUTH_SERVICE_PORT ?? 4011),
  extinguisherServicePort: Number(process.env.EXTINGUISHER_SERVICE_PORT ?? 4012),
  inspectionServicePort: Number(process.env.INSPECTION_SERVICE_PORT ?? 4013),
  reportingServicePort: Number(process.env.REPORTING_SERVICE_PORT ?? 4014),
  notificationServicePort: Number(process.env.NOTIFICATION_SERVICE_PORT ?? 4015),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5174',
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgres://postgres:postgres@localhost:5432/tzw_fire_extinguishers',
  databases: {
    auth:
      process.env.AUTH_DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/tzw_auth_service',
    extinguishers:
      process.env.EXTINGUISHER_DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/tzw_extinguisher_service',
    inspections:
      process.env.INSPECTION_DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/tzw_inspection_service',
    reports:
      process.env.REPORTING_DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/tzw_reporting_service',
    notifications:
      process.env.NOTIFICATION_DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/tzw_notification_service'
  },
  serviceUrls: {
    auth: process.env.AUTH_SERVICE_URL ?? 'http://localhost:4011',
    extinguishers: process.env.EXTINGUISHER_SERVICE_URL ?? 'http://localhost:4012',
    inspections: process.env.INSPECTION_SERVICE_URL ?? 'http://localhost:4013',
    reports: process.env.REPORTING_SERVICE_URL ?? 'http://localhost:4014',
    notifications: process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:4015'
  },
  databaseSsl: readBoolean(process.env.DATABASE_SSL),
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  passwordResetUrl: process.env.PASSWORD_RESET_URL ?? 'http://localhost:5174/reset-password',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: readBoolean(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? 'TZW LTD Safety <no-reply@tzw.local>'
  }
};
