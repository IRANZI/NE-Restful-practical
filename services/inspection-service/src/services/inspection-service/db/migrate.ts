import fs from 'fs';
import path from 'path';
import { inspectionDb } from './client';

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  await inspectionDb.pool.query(sql);
  console.log('Inspection service database migration completed.');
  await inspectionDb.pool.end();
}

void migrate().catch(async (error) => {
  console.error(error);
  await inspectionDb.pool.end();
  process.exit(1);
});
