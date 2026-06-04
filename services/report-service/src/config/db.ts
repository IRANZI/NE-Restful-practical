import { Pool, PoolClient, QueryResultRow } from 'pg';
import { env } from './env';

export function createPool(connectionString: string) {
  const servicePool = new Pool({
    connectionString,
    ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined
  });

  servicePool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error', error);
  });

  return servicePool;
}

export const pool = createPool(env.databaseUrl);

export function createQuery(poolInstance: Pool) {
  return function serviceQuery<T extends QueryResultRow>(
    sql: string,
    params: unknown[] = []
  ) {
    return poolInstance.query<T>(sql, params);
  };
}

export function createServiceDb(connectionString: string) {
  const servicePool = createPool(connectionString);

  return {
    pool: servicePool,
    query: createQuery(servicePool)
  };
}

export async function query<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = []
) {
  return pool.query<T>(sql, params);
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
