import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';
import { config } from '../config/env';

// ─── Build pool config ────────────────────────────────────────────────────────
const poolConfig: PoolConfig = config.db.connectionString
  ? {
      connectionString: config.db.connectionString,
      ssl: config.db.ssl as PoolConfig['ssl'],
    }
  : {
      host:     config.db.host,
      port:     config.db.port,
      database: config.db.name,
      user:     config.db.user,
      password: config.db.password,
      ssl:      config.db.ssl as PoolConfig['ssl'],
    };

// Sensible pool limits for a dev/small-prod setup
const pool = new Pool({
  ...poolConfig,
  max: 10,                // max simultaneous connections
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Surface connection errors immediately rather than on first query
pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

// ─── Typed query helper ───────────────────────────────────────────────────────
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(sql, params);
    if (config.server.isDev) {
      console.log(`[db] query (${Date.now() - start}ms) — ${sql.slice(0, 80).replace(/\s+/g, ' ')}`);
    }
    return result;
  } catch (err) {
    console.error('[db] Query error:', (err as Error).message, '\nSQL:', sql);
    throw err;
  }
}

// ─── Transactional helper ─────────────────────────────────────────────────────
export async function withTransaction<T>(
  fn: (q: typeof query) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  const boundQuery = <R extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ) => client.query<R>(sql, params);

  try {
    await client.query('BEGIN');
    const result = await fn(boundQuery as typeof query);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Health-check ─────────────────────────────────────────────────────────────
export async function checkDbConnection(): Promise<void> {
  const result = await query<{ now: Date }>('SELECT NOW() AS now');
  console.log(`[db] Connected — server time: ${result.rows[0]?.now}`);
}

export default pool;
