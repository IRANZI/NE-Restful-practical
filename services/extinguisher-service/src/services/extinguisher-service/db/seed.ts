import fs from 'fs';
import path from 'path';
import { extinguisherDb } from './client';

async function seed() {
  const seedPath = path.join(__dirname, 'seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  await extinguisherDb.pool.query(sql);
  console.log('Extinguisher service database seed completed.');
  await extinguisherDb.pool.end();
}

void seed().catch(async (error) => {
  console.error(error);
  await extinguisherDb.pool.end();
  process.exit(1);
});
