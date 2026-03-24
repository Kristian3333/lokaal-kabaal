import { NextRequest, NextResponse } from 'next/server';
import { requireDb } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 1024;

/**
 * POST /api/auth/password
 * Change the authenticated user's password.
 *
 * Body: { currentPassword?: string, newPassword: string }
 * currentPassword is required if the user already has a password set.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 });
  }

  const { currentPassword, newPassword } = body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!newPassword || typeof newPassword !== 'string') {
    return NextResponse.json({ error: 'Nieuw wachtwoord is verplicht' }, { status: 400 });
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Wachtwoord moet ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} tekens zijn` },
      { status: 400 },
    );
  }

  try {
    const db = requireDb();
    const rows = await db
      .select({ wachtwoordHash: retailers.wachtwoordHash })
      .from(retailers)
      .where(eq(retailers.id, authResult.retailerId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Account niet gevonden' }, { status: 404 });
    }

    const existing = rows[0].wachtwoordHash;

    // If user already has a password, verify the current one
    if (existing) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Huidig wachtwoord is verplicht' }, { status: 400 });
      }
      const valid = await verifyPassword(currentPassword, existing);
      if (!valid) {
        return NextResponse.json({ error: 'Huidig wachtwoord is onjuist' }, { status: 401 });
      }
    }

    const newHash = await hashPassword(newPassword);
    await db
      .update(retailers)
      .set({ wachtwoordHash: newHash, updatedAt: new Date() })
      .where(eq(retailers.id, authResult.retailerId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/password] Fout:', err);
    return NextResponse.json({ error: 'Wachtwoord wijzigen mislukt' }, { status: 500 });
  }
}
