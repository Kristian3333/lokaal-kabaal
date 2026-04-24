import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Webhooks · Developer docs',
  description: 'Payload-formaten en HMAC-signatuur-verificatie voor LokaalKabaal webhook-abonnementen.',
  alternates: { canonical: 'https://lokaalkabaal.agency/docs/webhooks' },
  robots: { index: true, follow: true },
};

export default function WebhooksDocPage(): React.JSX.Element {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Developer docs
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 400, marginBottom: '8px' }}>
          Webhooks
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '36px', lineHeight: 1.65 }}>
          LokaalKabaal stuurt events naar elk retailer-endpoint dat je registreert (Zapier catch-hook, Slack incoming webhook, self-hosted HTTP). Elk event wordt HMAC-SHA256 gesigned met je gedeelde secret zodat je kunt verifiëren dat een payload écht van ons komt.
        </p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '10px' }}>Event-types</h2>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '28px' }}>
          {[
            { type: 'scan.registered', desc: 'Een nieuwe bewoner heeft de QR-code op een flyer gescand (interesseOp gezet in de DB).' },
            { type: 'conversion.registered', desc: 'Een winkelmedewerker heeft een code verzilverd via de pincode of de webshop heeft /api/codes/redeem aangeroepen.' },
            { type: 'campaign.dispatched', desc: 'Maandelijkse batch is via PostNL de deur uit; bevat flyersSent + maand.' },
            { type: 'monthly_report.ready', desc: 'Het maandrapport is gegenereerd en beschikbaar op reportUrl (signed link, 30 dagen geldig).' },
          ].map((e, i) => (
            <div key={e.type} style={{ padding: '14px 18px', borderBottom: i === 3 ? 'none' : '1px solid var(--line)' }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--green-dim)', fontWeight: 700 }}>{e.type}</code>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.6 }}>{e.desc}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '10px' }}>Voorbeeld payload</h2>
        <pre style={{
          background: 'var(--ink)', color: '#e0e0e0',
          padding: '18px 20px', borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-mono)', fontSize: '12px', overflow: 'auto',
          marginBottom: '28px', lineHeight: 1.65,
        }}>
{`POST https://jouw-endpoint.nl/hook
Content-Type: application/json
X-LokaalKabaal-Signature: <hex-hmac-sha256>
X-LokaalKabaal-Event: scan.registered

{
  "type": "scan.registered",
  "retailerId": "c3f2a7d1-...",
  "campagneId": "8fe34bb2-...",
  "code": "ABCD1234",
  "postcode": "3512",
  "stad": "Utrecht",
  "at": "2026-04-28T14:07:22.000Z"
}`}
        </pre>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '10px' }}>Signatuur verifiëren</h2>
        <pre style={{
          background: 'var(--ink)', color: '#e0e0e0',
          padding: '18px 20px', borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-mono)', fontSize: '12px', overflow: 'auto',
          marginBottom: '16px', lineHeight: 1.65,
        }}>
{`// Node.js
import crypto from 'crypto';

function verify(body, provided, secret) {
  const expected = crypto.createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(provided, 'hex'),
  );
}`}
        </pre>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '28px' }}>
          Onze signing-helper uit <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>lib/webhook-outbox</code> gebruikt precies dit patroon (<code>signWebhookBody</code>, <code>verifyWebhookSignature</code>), dus dezelfde logica werkt aan beide kanten.
        </p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '10px' }}>Retry-schema</h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '12px' }}>
          Als je endpoint geen 2xx teruggeeft, retryen we volgens exponential backoff: 30s -&gt; 2min -&gt; 8min -&gt; 30min -&gt; 2h, daarna geven we op en sturen een dagelijkse samenvatting naar je account-email. Handige 5xx-response codes om op te letten:
        </p>
        <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '28px', paddingLeft: '20px' }}>
          <li><code>200/204</code> -- geaccepteerd, geen retry</li>
          <li><code>4xx</code> -- client error, we retryen nog één keer en markeren je endpoint als unhealthy</li>
          <li><code>5xx / timeout</code> -- volledige retry-schedule</li>
        </ul>

        <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
          Vragen? Mail <a href="mailto:support@lokaalkabaal.agency" style={{ color: 'var(--green-dim)', textDecoration: 'underline' }}>support@lokaalkabaal.agency</a> of bekijk de{' '}
          <Link href="/avg-dpia" style={{ color: 'var(--green-dim)', textDecoration: 'underline' }}>AVG/DPIA pagina</Link> voor databehandeling.
        </div>
      </div>
    </div>
  );
}
