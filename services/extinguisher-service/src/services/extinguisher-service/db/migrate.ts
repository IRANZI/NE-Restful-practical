import fs from 'fs';
import path from 'path';
import { extinguisherDb } from './client';

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  await extinguisherDb.pool.query(sql);
  console.log('Extinguisher service database migration completed.');
  await extinguisherDb.pool.end();
}

void migrate().catch(async (error) => {
  console.error(error);
  await extinguisherDb.pool.end();
  process.exit(1);
});
