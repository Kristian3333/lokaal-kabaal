import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAuth } from '@/lib/auth';

// POST /api/notify-large-order
// Stuurt een automatisch e-mail naar support@lokaalkabaal.nl bij orders >5000 flyers.
// Vereist RESEND_API_KEY in Vercel environment variables.

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { aantalFlyers, spec, centrum, straal, email, bedrijfsnaam } = await req.json();

    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      // Geen API key -- log in Vercel functielog als fallback
      console.error('[notify-large-order] RESEND_API_KEY niet geconfigureerd. Grote order:', {
        aantalFlyers, spec, centrum, straal, email, bedrijfsnaam,
      });
      return NextResponse.json({ sent: false, reason: 'RESEND_API_KEY niet geconfigureerd' });
    }

    const resend = new Resend(resendKey);

    const { error } = await resend.emails.send({
      from: 'noreply@lokaalkabaal.nl',
      to: 'support@lokaalkabaal.nl',
      subject: `Maatwerkaanvraag: ${aantalFlyers.toLocaleString('nl')} flyers - ${spec || 'onbekende branche'}`,
      html: `
        <h2>Nieuwe maatwerkaanvraag &gt;5.000 flyers</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0;color:#888">Bedrijfsnaam</td><td style="padding:4px 0"><strong>${bedrijfsnaam || '-'}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888">E-mail</td><td style="padding:4px 0"><a href="mailto:${email}">${email || '-'}</a></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888">Branche</td><td style="padding:4px 0">${spec || '-'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888">Centrum</td><td style="padding:4px 0">${centrum || '-'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888">Straal</td><td style="padding:4px 0">${straal} km</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888">Geschatte flyers/mnd</td><td style="padding:4px 0"><strong>${aantalFlyers.toLocaleString('nl')}</strong></td></tr>
        </table>
        <p style="margin-top:20px;font-family:sans-serif;font-size:13px;color:#555">
          Neem contact op met de klant voor een maatwerkaanbod.
        </p>
      `,
    });

    if (error) {
      console.error('[notify-large-order] Resend fout:', error);
      return NextResponse.json({ sent: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error('[notify-large-order] Fout:', err);
    return NextResponse.json({ sent: false, error: 'Interne fout' }, { status: 500 });
  }
}
