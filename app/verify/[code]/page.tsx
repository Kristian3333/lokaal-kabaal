import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { flyerVerifications } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const metadata: Metadata = { title: 'Verificatie — LokaalKabaal' };

// Disable caching — elke scan is uniek
export const dynamic = 'force-dynamic';

type Status = 'valid' | 'used' | 'expired' | 'invalid' | 'no-db';

interface Config {
  bg: string;
  ring: string;
  icon: string;
  titel: string;
  sub: string;
}

export default async function VerifyPage({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code.toUpperCase().trim();

  let status: Status = 'invalid';
  let sub = 'Deze code bestaat niet.';
  let adresText = '';

  if (!db) {
    status = 'no-db';
    sub = 'Verificatiesysteem niet beschikbaar.';
  } else {
    const rows = await db
      .select()
      .from(flyerVerifications)
      .where(eq(flyerVerifications.code, code))
      .limit(1);

    if (!rows.length) {
      status = 'invalid';
      sub = 'Deze code bestaat niet.';
    } else {
      const v = rows[0];
      adresText = `${v.adres}, ${v.postcode} ${v.stad}`;

      if (v.gebruikt) {
        status = 'used';
        const d = v.gebruiktOp
          ? new Date(v.gebruiktOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '—';
        sub = `Ingewisseld op ${d}`;
      } else if (new Date() > new Date(v.geldigTot)) {
        status = 'expired';
        const d = new Date(v.geldigTot).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
        sub = `Geldig was t/m ${d}`;
      } else {
        // ✅ Geldig — markeer als gebruikt (eenmalig)
        await db
          .update(flyerVerifications)
          .set({ gebruikt: true, gebruiktOp: new Date() })
          .where(eq(flyerVerifications.code, code));
        status = 'valid';
        sub = `Nieuwe bewoner van ${adresText}`;
      }
    }
  }

  const configs: Record<Status, Config> = {
    valid:   { bg: '#00E87A', ring: '#00C265', icon: '✓', titel: 'Geldig',      sub },
    used:    { bg: '#FF3B3B', ring: '#CC2F2F', icon: '✗', titel: 'Al gebruikt', sub },
    expired: { bg: '#FF9500', ring: '#CC7700', icon: '!', titel: 'Verlopen',    sub },
    invalid: { bg: '#FF3B3B', ring: '#CC2F2F', icon: '✗', titel: 'Ongeldig',   sub },
    'no-db': { bg: '#888',    ring: '#666',    icon: '?', titel: 'Onbeschikbaar', sub },
  };

  const c = configs[status];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F3EF',
      padding: '20px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '44px 36px',
        maxWidth: '380px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
      }}>
        {/* Status icon */}
        <div style={{
          width: '88px', height: '88px',
          borderRadius: '50%',
          background: c.bg,
          boxShadow: `0 0 0 8px ${c.ring}22`,
          color: 'white',
          fontSize: '44px',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          lineHeight: 1,
        }}>
          {c.icon}
        </div>

        {/* Title */}
        <div style={{ fontSize: '30px', fontWeight: 800, color: '#0A0A0A', marginBottom: '10px', letterSpacing: '-0.02em' }}>
          {c.titel}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, marginBottom: '28px' }}>
          {c.sub}
        </div>

        {/* Code badge */}
        <div style={{
          fontFamily: "'SF Mono', 'Fira Code', 'DM Mono', monospace",
          fontSize: '14px',
          color: '#888',
          background: '#F5F3EF',
          padding: '10px 18px',
          borderRadius: '10px',
          display: 'inline-block',
          letterSpacing: '0.12em',
          marginBottom: '36px',
        }}>
          {code}
        </div>

        {/* Brand */}
        <div style={{ fontSize: '11px', color: '#ccc', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
          LokaalKabaal verificatie
        </div>
      </div>
    </div>
  );
}
