import { NextRequest, NextResponse } from 'next/server';
import { validateProefFlyerInput } from '@/lib/proef-flyer';
import { authLimiter } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import { captureError } from '@/lib/telemetry';

/**
 * POST /api/proef-flyer
 *
 * Lead-magnet form: visitor submits email + bedrijfsnaam + adres + branche
 * and we send an immediate confirmation email. A cron job (not yet wired)
 * will pick up the queued requests each day and actually dispatch one
 * proef-flyer per accepted entry through Print.one, capped at
 * PROEF_FLYER_DAILY_CAP.
 *
 * For now we only persist to a thin retailer-readable log (console) so
 * the signups aren't lost while the DB table / cron is being designed.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const limit = authLimiter(req);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 });

  const result = validateProefFlyerInput(body);
  if (!result.ok) {
    return NextResponse.json({ error: 'Ongeldige invoer', fieldErrors: result.errors }, { status: 400 });
  }
  const input = result.normalized!;

  // Log so we see the request land even before the DB table + cron exist.
  console.log('[proef-flyer] new signup', {
    email: input.email, bedrijfsnaam: input.bedrijfsnaam, branche: input.branche,
  });

  // Fire-and-forget confirmation email. Failure must not break the form.
  sendEmail({
    to: input.email,
    subject: 'Je proef-flyer komt eraan -- LokaalKabaal',
    html: `
      <p>Hallo ${input.bedrijfsnaam},</p>
      <p>Bedankt voor je aanvraag! We zetten je proef-flyer klaar voor de eerstvolgende batch.
      Afhankelijk van drukte ontvang je hem binnen 5-10 werkdagen op <strong>${input.adres}</strong>.</p>
      <p>In de tussentijd: <a href="https://lokaalkabaal.agency/tools/roi-calculator">bereken alvast je ROI</a>
      of <a href="https://lokaalkabaal.agency/login">maak vast een account aan</a> zodat je straks met één klik je
      eerste campagne kan activeren zodra de proef valt.</p>
      <p>-- Team LokaalKabaal</p>
    `,
  }).catch(err => captureError(err, { source: 'proef-flyer/confirmation', email: input.email }));

  return NextResponse.json({
    ok: true,
    message: `Bedankt ${input.bedrijfsnaam}! Een bevestiging staat in je inbox op ${input.email}. We sturen je proef-flyer binnen 5-10 werkdagen.`,
  });
}
