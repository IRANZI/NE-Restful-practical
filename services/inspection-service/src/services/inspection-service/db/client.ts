import { createServiceDb } from '../../../config/db';
import { env } from '../../../config/env';

export const inspectionDb = createServiceDb(env.databases.inspections);
export const query = inspectionDb.query;
