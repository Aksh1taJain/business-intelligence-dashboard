/**
 * Minimal migration runner.
 * Reads sql/schema.sql and applies it to the connected database.
 *
 * Usage:
 *   npm run db:migrate
 */

import fs from 'fs';
import path from 'path';
import { checkDbConnection, query } from './pool';

async function migrate(): Promise<void> {
  console.log('[migrate] Starting database migration…');

  await checkDbConnection();

  const schemaPath = path.resolve(__dirname, '../../sql/schema.sql');

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at: ${schemaPath}`);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log('[migrate] Executing schema.sql…');

  await query(sql);

  console.log('[migrate] ✓ Migration complete.');
  process.exit(0);
}

migrate().catch((err: Error) => {
  console.error('[migrate] ✗ Migration failed:', err.message);
  process.exit(1);
});
