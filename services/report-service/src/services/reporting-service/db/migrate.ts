import fs from 'fs';
import path from 'path';
import { reportingDb } from './client';

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  await reportingDb.pool.query(sql);
  console.log('Reporting service database migration completed.');
  await reportingDb.pool.end();
}

void migrate().catch(async (error) => {
  console.error(error);
  await reportingDb.pool.end();
  process.exit(1);
});
