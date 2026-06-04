import fs from 'fs';
import path from 'path';
import { authDb } from './client';
// auth service database with initial data
async function seed() {
  const seedPath = path.join(__dirname, 'seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  await authDb.pool.query(sql);
  console.log('Auth service database seed completed.');
  await authDb.pool.end();
}

void seed().catch(async (error) => {
  console.error(error);
  await authDb.pool.end();
  process.exit(1);
});
