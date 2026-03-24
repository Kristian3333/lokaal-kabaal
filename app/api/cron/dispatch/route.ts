/**
 * POST /api/cron/dispatch
 *
 * Triggered by Vercel cron on the 25th of each month at 08:00 UTC.
 * Runs the monthly flyer batch dispatch for all active campaigns.
 *
 * Protected by CRON_SECRET environment variable. Vercel cron sends
 * this secret in the Authorization header as "Bearer <secret>".
 */

import { NextRequest, NextResponse } from 'next/server';
import { runMonthlyDispatch } from '@/lib/dispatch';

export const maxDuration = 300;

/**
 * Validate the cron authorization secret from the request header.
 * Rejects if CRON_SECRET is not set (fail closed for security).
 */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[cron/dispatch] CRON_SECRET is not configured -- rejecting all requests');
    return false;
  }
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

/**
 * POST handler: trigger monthly dispatch.
 * Returns a JSON summary of campaigns processed and flyers sent.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runMonthlyDispatch();

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    console.error('[cron/dispatch] Dispatch run failed:', err);
    return NextResponse.json(
      { error: 'Dispatch mislukt -- controleer de server logs' },
      { status: 500 },
    );
  }
}

/**
 * GET handler: also accepts GET for Vercel cron compatibility.
 * Vercel cron HTTP triggers use GET by default.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return POST(req);
}
