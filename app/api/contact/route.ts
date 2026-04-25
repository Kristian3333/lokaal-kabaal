import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { validateContactInput } from '@/lib/contact-validation';
import { rateLimit } from '@/lib/rate-limit';
import { captureError } from '@/lib/telemetry';
import { CONTACT_FORM_FORWARD_TO, CONTACT_FORM_FROM_ADDRESS } from '@/lib/contact-config';
import { escHtml } from '@/lib/email-templates';

/**
 * POST /api/contact
 *
 * Public contact form: visitor fills naam/email/bericht and we forward
 * the message to the central support inbox (currently
 * support@verbouwpro.nl, see lib/contact-config.ts) plus an auto-reply
 * to the visitor so they don't think the form did nothing.
 *
 * Honeypot field `website` is hidden via CSS; bots that fill every input
 * get a silent 200 so they don't learn what triggered the rejection.
 *
 * Rate-limit: 3 submissions per IP per 10 minutes. Anything more is
 * almost certainly bot traffic.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const limit = rateLimit(req, { windowMs: 10 * 60_000, maxRequests: 3 });
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Te veel verzoeken. Probeer het over een paar minuten opnieuw.' },
      { status: 429, headers: { 'Retry-After': '600' } },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 });
  }

  const result = validateContactInput(body);
  if (!result.ok) {
    // Spam (honeypot) gets a silent 200 so the bot can't tell it was
    // caught; everything else returns a typed field-error map for the UI.
    if (result.errors._spam) {
      console.warn('[contact] honeypot triggered, dropping submission');
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: 'Ongeldige invoer', fieldErrors: result.errors },
      { status: 400 },
    );
  }

  const input = result.normalized!;

  if (!process.env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY niet geconfigureerd');
    return NextResponse.json(
      { error: 'E-mail tijdelijk niet beschikbaar' },
      { status: 503 },
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const safeNaam = escHtml(input.naam);
  const safeEmail = escHtml(input.email);
  const safeBericht = escHtml(input.bericht).replace(/\n/g, '<br/>');

  const forwardHtml = `
    <p><strong>Van:</strong> ${safeNaam} &lt;${safeEmail}&gt;</p>
    <p><strong>Bericht:</strong></p>
    <div style="border-left:3px solid #00E87A;padding-left:12px;color:#333;">${safeBericht}</div>
    <hr style="margin:20px 0;border:0;border-top:1px solid #ddd;"/>
    <p style="color:#888;font-size:12px;">
      Verzonden via het contactformulier op lokaalkabaal.agency.
      Antwoord direct op deze mail om de afzender te bereiken (Reply-To staat al goed).
    </p>
  `;

  const autoReplyHtml = `
    <p>Hoi ${safeNaam},</p>
    <p>Bedankt voor je bericht! We hebben het ontvangen en reageren binnen één werkdag
    op het adres <strong>${safeEmail}</strong>.</p>
    <p>In de tussentijd: <a href="https://lokaalkabaal.agency/tools/roi-calculator">bereken alvast je ROI</a>
    of <a href="https://lokaalkabaal.agency/login">maak een account aan</a>.</p>
    <p>-- Team LokaalKabaal</p>
  `;

  try {
    // Forward to central support inbox.
    await resend.emails.send({
      from: CONTACT_FORM_FROM_ADDRESS,
      to: CONTACT_FORM_FORWARD_TO,
      replyTo: input.email,
      subject: `[lokaalkabaal.agency] Bericht van ${input.naam}`,
      html: forwardHtml,
    });

    // Auto-reply to the visitor. Failure here must not block the user
    // response -- the support team already has the original message.
    resend.emails.send({
      from: CONTACT_FORM_FROM_ADDRESS,
      to: input.email,
      subject: 'Bericht ontvangen -- LokaalKabaal',
      html: autoReplyHtml,
    }).catch(err => captureError(err, { source: 'contact/auto-reply', email: input.email }));

    return NextResponse.json({ ok: true });
  } catch (err) {
    captureError(err, { source: 'contact/forward', email: input.email });
    return NextResponse.json(
      { error: 'Versturen mislukt, probeer het later opnieuw.' },
      { status: 502 },
    );
  }
}
