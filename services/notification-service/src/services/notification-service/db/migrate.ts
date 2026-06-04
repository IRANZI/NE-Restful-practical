import fs from 'fs';
import path from 'path';
import { notificationDb } from './client';

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  await notificationDb.pool.query(sql);
  console.log('Notification service database migration completed.');
  await notificationDb.pool.end();
}

void migrate().catch(async (error) => {
  console.error(error);
  await notificationDb.pool.end();
  process.exit(1);
});
