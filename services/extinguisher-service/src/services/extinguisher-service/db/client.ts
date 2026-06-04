import { createServiceDb } from '../../../config/db';
import { env } from '../../../config/env';

export const extinguisherDb = createServiceDb(env.databases.extinguishers);
export const query = extinguisherDb.query;
