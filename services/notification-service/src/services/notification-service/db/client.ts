import { createServiceDb } from '../../../config/db';
import { env } from '../../../config/env';

export const notificationDb = createServiceDb(env.databases.notifications);
export const query = notificationDb.query;
