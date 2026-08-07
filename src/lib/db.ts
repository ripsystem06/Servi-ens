import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { ensureTables } from './seed';

const sqlite = new Database('data/admin.db');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

ensureTables();

export const db = drizzle(sqlite, { schema });
