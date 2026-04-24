import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/health
 *
 * Liveness + readiness probe for external uptime monitors (Better Uptime,
 * UptimeRobot, Vercel health checks). Returns:
 *   - 200 { ok: true, db: 'up' | 'down' } when the server process is alive
 *   - DB is probed with a trivial SELECT; a slow DB doesn't make the
 *     process unhealthy, so we return 200 either way and let the monitor
 *     alert on `db: 'down'` via JSON assertion.
 *
 * Cache-Control: no-store so intermediaries don't cache a stale reply.
 */
export async function GET(): Promise<NextResponse> {
  let dbStatus: 'up' | 'down' | 'unconfigured' = 'unconfigured';
  if (db) {
    try {
      // Drizzle execute with the tiniest possible query
      await db.execute({ sql: 'select 1', args: [] } as unknown as never);
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }
  }
  return NextResponse.json(
    { ok: true, db: dbStatus, ts: new Date().toISOString() },
    { headers: { 'cache-control': 'no-store' } },
  );
}
