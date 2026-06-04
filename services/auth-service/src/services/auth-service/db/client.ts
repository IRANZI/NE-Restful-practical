import { createServiceDb } from '../../../config/db';
import { env } from '../../../config/env';

export const authDb = createServiceDb(env.databases.auth);
export const query = authDb.query;
