import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { flyerVerifications, retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import PinForm from './PinForm';

export const metadata: Metadata = { title: 'Verificatie — LokaalKabaal' };

// Disable caching — elke scan is uniek
export const dynamic = 'force-dynamic';

type Status = 'interesse' | 'already-scanned' | 'expired' | 'invalid' | 'conversie' | 'no-db';

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
  let bedrijfsnaam = '';
  let heeftPincode = false;

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

      // Haal bedrijfsnaam + pincode-status op
      const retailerRows = await db
        .select({ bedrijfsnaam: retailers.bedrijfsnaam, winkelPincode: retailers.winkelPincode })
        .from(retailers)
        .where(eq(retailers.id, v.retailerId))
        .limit(1);
      bedrijfsnaam = retailerRows[0]?.bedrijfsnaam ?? '';
      heeftPincode = !!retailerRows[0]?.winkelPincode;

      if (new Date() > new Date(v.geldigTot)) {
        status = 'expired';
        const d = new Date(v.geldigTot).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
        sub = `Deze aanbieding was geldig t/m ${d}.`;
      } else if (v.conversieOp) {
        // Al bij de winkel ingewisseld
        status = 'conversie';
        const d = new Date(v.conversieOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
        sub = `Al ingewisseld op ${d}.`;
      } else if (v.interesseOp) {
        // Al eerder gescand door consument
        status = 'already-scanned';
        sub = bedrijfsnaam
          ? `Ga langs bij ${bedrijfsnaam} en toon deze code voor een welkomstaanbieding.`
          : 'Ga langs bij de winkel en toon deze code voor een welkomstaanbieding.';
      } else {
        // Eerste scan door consument → registreer interesse
        await db
          .update(flyerVerifications)
          .set({ interesseOp: new Date() })
          .where(eq(flyerVerifications.code, code));
        status = 'interesse';
        sub = bedrijfsnaam
          ? `Ga langs bij ${bedrijfsnaam} en toon deze code voor een welkomstaanbieding!`
          : 'Ga langs bij de winkel en toon deze code voor een welkomstaanbieding!';
      }
    }
  }

  const configs: Record<Status, Config> = {
    interesse:       { bg: '#00E87A', ring: '#00C265', icon: '✓', titel: 'Welkom!',         sub },
    'already-scanned': { bg: '#60a5fa', ring: '#3b82f6', icon: 'i', titel: 'Al gescand',    sub },
    conversie:       { bg: '#8b5cf6', ring: '#7c3aed', icon: '★', titel: 'Ingewisseld',     sub },
    expired:         { bg: '#FF9500', ring: '#CC7700', icon: '!', titel: 'Verlopen',         sub },
    invalid:         { bg: '#FF3B3B', ring: '#CC2F2F', icon: '✗', titel: 'Ongeldig',        sub },
    'no-db':         { bg: '#888',    ring: '#666',    icon: '?', titel: 'Onbeschikbaar',   sub },
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
          marginBottom: '20px',
        }}>
          {code}
        </div>

        {/* Bedrijfsnaam */}
        {bedrijfsnaam && (
          <div style={{ fontSize: '13px', color: '#999', marginBottom: '16px' }}>
            {bedrijfsnaam}
          </div>
        )}

        {/* CTA voor interesse */}
        {(status === 'interesse' || status === 'already-scanned') && (
          <div style={{
            background: '#0A0A0A', color: '#fff',
            padding: '14px 24px', borderRadius: '10px',
            fontSize: '14px', fontWeight: 700,
            marginBottom: '16px',
          }}>
            Toon deze pagina bij de kassa
          </div>
        )}

        {/* Medewerker PIN-verzilvering */}
        {(status === 'interesse' || status === 'already-scanned') && heeftPincode && (
          <PinForm code={code} />
        )}

        {/* Brand */}
        <div style={{ fontSize: '11px', color: '#ccc', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
          LokaalKabaal verificatie
        </div>
      </div>
    </div>
  );
}
