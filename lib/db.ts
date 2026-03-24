import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Gracefully handle missing DATABASE_URL (dev without DB)
const dbUrl = process.env.DATABASE_URL;

export const db = dbUrl
  ? drizzle(neon(dbUrl), { schema })
  : null;

export function requireDb() {
  if (!db) throw new Error('DATABASE_URL niet geconfigureerd -- sla verificatiecodes op in Neon/Postgres');
  return db;
}
