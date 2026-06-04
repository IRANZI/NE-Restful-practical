import { createServiceDb } from '../../../config/db';
import { env } from '../../../config/env';

export const reportingDb = createServiceDb(env.databases.reports);
export const query = reportingDb.query;
