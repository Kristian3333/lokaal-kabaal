import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// drizzle-kit doesn't auto-load .env files like Next.js does. Load
// .env.local (the file Next uses for local dev) first, then fall back
// to .env so we work in CI/server contexts that use that name.
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is niet gezet. Zet hem in .env.local voor lokaal werk, of geef hem inline mee:\n' +
      '  DATABASE_URL="postgres://..." npx drizzle-kit migrate',
  );
}

export default {
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config;
