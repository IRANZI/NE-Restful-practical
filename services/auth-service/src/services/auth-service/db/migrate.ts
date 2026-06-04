import fs from 'fs';
import path from 'path';
import { authDb } from './client';

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  await authDb.pool.query(sql);
  console.log('Auth service database migration completed.');
  await authDb.pool.end();
}

void migrate().catch(async (error) => {
  console.error(error);
  await authDb.pool.end();
  process.exit(1);
});
