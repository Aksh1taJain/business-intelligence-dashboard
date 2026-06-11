import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function require_env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional_env(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  server: {
    port: parseInt(optional_env('PORT', '4000'), 10),
    nodeEnv: optional_env('NODE_ENV', 'development'),
    isDev: optional_env('NODE_ENV', 'development') === 'development',
  },

  db: {
    // Prefer DATABASE_URL if set; otherwise build from parts
    connectionString: process.env['DATABASE_URL'],
    host:     optional_env('DB_HOST', 'localhost'),
    port:     parseInt(optional_env('DB_PORT', '5432'), 10),
    name:     optional_env('DB_NAME', 'datapulse'),
    user:     optional_env('DB_USER', 'postgres'),
    password: optional_env('DB_PASSWORD', ''),
    ssl: optional_env('NODE_ENV', 'development') === 'production'
      ? { rejectUnauthorized: false }
      : false,
  },

  jwt: {
    secret:    require_env('JWT_SECRET'),
    expiresIn: optional_env('JWT_EXPIRES_IN', '7d'),
  },

  cors: {
    origins: optional_env('CORS_ORIGINS', 'http://localhost:5173')
      .split(',')
      .map(o => o.trim()),
  },

  bcrypt: {
    rounds: parseInt(optional_env('BCRYPT_ROUNDS', '12'), 10),
  },
} as const;
