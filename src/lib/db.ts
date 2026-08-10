import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Postgres.js client — single connection for Drizzle
const client = postgres(connectionString, {
  max: 10, // connection pool size
  idle_timeout: 30, // seconds
  connect_timeout: 10, // seconds
});

export const db = drizzle(client, { schema });

// Graceful shutdown
process.on('SIGTERM', async () => {
  await client.end();
});
