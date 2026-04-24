import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'ISO 27001 roadmap & controles',
  description: 'Waar LokaalKabaal staat ten opzichte van ISO 27001. Welke controles al live zijn, welke we dit jaar afronden, en wat nog openstaat.',
  alternates: { canonical: 'https://lokaalkabaal.agency/iso-27001-roadmap' },
  robots: { index: true, follow: true },
};

type Status = 'live' | 'in-progress' | 'planned';

interface Control {
  code: string;
  title: string;
  desc: string;
  status: Status;
}

const CONTROLS: Control[] = [
  { code: 'A.5.1',  title: 'Information security policies',   desc: 'Formele informatiebeveiliging policy gepubliceerd en jaarlijks geëvalueerd.', status: 'in-progress' },
  { code: 'A.5.7',  title: 'Threat intelligence',              desc: 'Volgen van CVEs + Vercel/Neon security bulletins. Afhankelijkheden maandelijks geüpdatet via `npm audit`.', status: 'live' },
  { code: 'A.5.10', title: 'Acceptable use of information',    desc: 'Medewerkersrichtlijn voor omgang met retailer-data, verplicht gelezen bij onboarding.', status: 'live' },
  { code: 'A.5.15', title: 'Access control',                   desc: 'Principle of least privilege voor alle secrets (SESSION_SECRET, CRON_SECRET, REDEEM_API_KEY, STRIPE_WEBHOOK_SECRET, PRINTONE_WEBHOOK_SECRET). Aparte keys per integratiepartner.', status: 'live' },
  { code: 'A.5.17', title: 'Authentication information',       desc: 'Scrypt-hashed wachtwoorden, HMAC-SHA256 gesigneerde session cookies, magic-link tokens met 15-min expiry en one-time use.', status: 'live' },
  { code: 'A.5.33', title: 'Protection of records',            desc: 'Retailer-accounts: 12 mnd na opzegging verwijderd. Bezorgadressen: max. 30 dagen. Factuurdata: 7 jaar fiscale bewaarplicht.', status: 'live' },
  { code: 'A.5.34', title: 'Privacy and PII',                  desc: 'Volledige DPIA-documentatie publiek op /avg-dpia. AVG-balans-test per categorie verwerking opgenomen.', status: 'live' },
  { code: 'A.8.7',  title: 'Protection against malware',       desc: 'Geen user-uploaded executables; alleen afbeeldingen via Vercel Blob met MIME-validatie.', status: 'live' },
  { code: 'A.8.12', title: 'Data leakage prevention',          desc: 'SSRF-guard op scrape + flyer/generate, formula-injection escape op CSV exports, rate-limits op auth + redeem endpoints.', status: 'live' },
  { code: 'A.8.13', title: 'Backup',                           desc: 'Neon point-in-time recovery (7 dagen). Nightly logical dumps naar object storage in plan.', status: 'in-progress' },
  { code: 'A.8.15', title: 'Logging',                          desc: 'Structured console.error + captureError via lib/telemetry. Sentry/Highlight swap-in punt klaar; externe aggregator in plan.', status: 'in-progress' },
  { code: 'A.8.16', title: 'Monitoring activities',            desc: '/api/health endpoint + geplande Better Uptime checks met on-call routing.', status: 'in-progress' },
  { code: 'A.8.23', title: 'Web filtering / CSP',              desc: 'Content-Security-Policy, HSTS, X-Frame-Options, X-Content-Type-Options gezet in middleware.', status: 'live' },
  { code: 'A.8.24', title: 'Use of cryptography',              desc: 'TLS 1.3 via Vercel edge, HTTPS-only cookies, scrypt voor passwords, HMAC-SHA256 voor session tokens.', status: 'live' },
  { code: 'A.8.28', title: 'Secure coding',                    desc: 'TypeScript strict mode, ESLint CI gate, vitest testcoverage verplicht op kritieke lib/ modules, code review voor elke merge.', status: 'live' },
  { code: 'A.8.32', title: 'Change management',                desc: 'Alle wijzigingen via GitHub PR met CI (tsc, vitest, next build). Drizzle-kit migraties gepland, nog niet in CI.', status: 'in-progress' },
  { code: 'A.8.34', title: 'Protection during audit testing',  desc: 'Externe pentest voor Q4 2026.', status: 'planned' },
];

function StatusBadge({ status }: { status: Status }): React.JSX.Element {
  const cfg = {
    live:          { label: 'Live',         bg: 'rgba(0,232,122,0.12)', color: 'var(--green-dim)',  border: 'rgba(0,232,122,0.3)' },
    'in-progress': { label: 'In progress',  bg: 'rgba(255,200,0,0.12)', color: '#b8860b',           border: 'rgba(255,200,0,0.35)' },
    planned:      { label: 'Gepland',       bg: 'rgba(100,100,100,0.1)', color: 'var(--muted)',     border: 'var(--line)' },
  }[status];
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: '3px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

export default function Iso27001Page(): React.JSX.Element {
  const live = CONTROLS.filter(c => c.status === 'live').length;
  const inProg = CONTROLS.filter(c => c.status === 'in-progress').length;
  const planned = CONTROLS.filter(c => c.status === 'planned').length;

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Compliance · B2B procurement
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 400, marginBottom: '8px' }}>
          ISO 27001 roadmap
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '36px', lineHeight: 1.6 }}>
          We zijn nog niet ISO 27001-gecertificeerd, maar documenteren hier welke controles al live zijn, welke we dit jaar afronden, en wat gepland staat. Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '32px' }}>
          {[
            { label: 'Live', value: live, color: 'var(--green-dim)' },
            { label: 'In progress', value: inProg, color: '#b8860b' },
            { label: 'Gepland', value: planned, color: 'var(--muted)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '30px', color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {CONTROLS.map((c, i) => (
            <div key={c.code} style={{
              padding: '16px 20px',
              borderBottom: i === CONTROLS.length - 1 ? 'none' : '1px solid var(--line)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{c.code}</span>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{c.title}</span>
                <StatusBadge status={c.status} />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '28px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
          Vragen over security? Mail <a href="mailto:security@lokaalkabaal.agency" style={{ color: 'var(--green-dim)', textDecoration: 'underline' }}>security@lokaalkabaal.agency</a> of bekijk ons{' '}
          <Link href="/avg-dpia" style={{ color: 'var(--green-dim)', textDecoration: 'underline' }}>AVG/DPIA document</Link>.
        </div>
      </div>
    </div>
  );
}
