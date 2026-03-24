import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { flyerVerifications, retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import PinForm from './PinForm';

export const metadata: Metadata = { title: 'Verificatie - LokaalKabaal' };

// Disable caching -- elke scan is uniek
export const dynamic = 'force-dynamic';

type Status = 'interesse' | 'already-scanned' | 'expired' | 'invalid' | 'conversie' | 'no-db';

interface RetailerBrand {
  bedrijfsnaam: string;
  branche: string;
  logoUrl: string | null;
  merkKleur: string | null;
  welkomstTekst: string | null;
  heeftPincode: boolean;
}

export default async function VerifyPage({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code.toUpperCase().trim();

  let status: Status = 'invalid';
  let sub = 'Deze code bestaat niet.';
  let brand: RetailerBrand = {
    bedrijfsnaam: '', branche: '', logoUrl: null,
    merkKleur: null, welkomstTekst: null, heeftPincode: false,
  };

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

      // Haal retailer branding op
      const retailerRows = await db
        .select({
          bedrijfsnaam: retailers.bedrijfsnaam,
          branche: retailers.branche,
          logoUrl: retailers.logoUrl,
          merkKleur: retailers.merkKleur,
          welkomstTekst: retailers.welkomstTekst,
          winkelPincode: retailers.winkelPincode,
        })
        .from(retailers)
        .where(eq(retailers.id, v.retailerId))
        .limit(1);

      const r = retailerRows[0];
      if (r) {
        brand = {
          bedrijfsnaam: r.bedrijfsnaam,
          branche: r.branche,
          logoUrl: r.logoUrl,
          merkKleur: r.merkKleur,
          welkomstTekst: r.welkomstTekst,
          heeftPincode: !!r.winkelPincode,
        };
      }

      if (new Date() > new Date(v.geldigTot)) {
        status = 'expired';
        const d = new Date(v.geldigTot).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
        sub = `Deze aanbieding was geldig t/m ${d}.`;
      } else if (v.conversieOp) {
        status = 'conversie';
        const d = new Date(v.conversieOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
        sub = `Al ingewisseld op ${d}.`;
      } else if (v.interesseOp) {
        status = 'already-scanned';
        sub = brand.welkomstTekst
          || (brand.bedrijfsnaam
            ? `Welkom in de buurt! Ga langs bij ${brand.bedrijfsnaam} en toon deze code voor een welkomstaanbieding.`
            : 'Ga langs bij de winkel en toon deze code voor een welkomstaanbieding.');
      } else {
        await db
          .update(flyerVerifications)
          .set({ interesseOp: new Date() })
          .where(eq(flyerVerifications.code, code));
        status = 'interesse';
        sub = brand.welkomstTekst
          || (brand.bedrijfsnaam
            ? `Welkom in de buurt! Ga langs bij ${brand.bedrijfsnaam} en toon deze code voor een welkomstaanbieding!`
            : 'Ga langs bij de winkel en toon deze code voor een welkomstaanbieding!');
      }
    }
  }

  // Kleurconfiguratie -- gebruik merkkleur als beschikbaar
  const accent = brand.merkKleur || '#00E87A';
  const accentDark = brand.merkKleur
    ? brand.merkKleur + 'CC'  // iets donkerder via opacity
    : '#00C265';

  const configs: Record<Status, { bg: string; ring: string; icon: string; titel: string }> = {
    interesse:         { bg: accent,    ring: accentDark, icon: '✓', titel: 'Welkom!' },
    'already-scanned': { bg: accent,    ring: accentDark, icon: '✓', titel: 'Welkom!' },
    conversie:         { bg: '#8b5cf6', ring: '#7c3aed',  icon: '★', titel: 'Ingewisseld' },
    expired:           { bg: '#FF9500', ring: '#CC7700',  icon: '!', titel: 'Verlopen' },
    invalid:           { bg: '#FF3B3B', ring: '#CC2F2F',  icon: '✗', titel: 'Ongeldig' },
    'no-db':           { bg: '#888',    ring: '#666',     icon: '?', titel: 'Onbeschikbaar' },
  };

  const c = configs[status];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F3EF',
      padding: '20px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px 36px 32px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        border: brand.merkKleur ? `2px solid ${brand.merkKleur}20` : 'none',
      }}>
        {/* Retailer logo */}
        {brand.logoUrl && (
          <div style={{ marginBottom: '20px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoUrl}
              alt={brand.bedrijfsnaam}
              style={{ maxHeight: '56px', maxWidth: '200px', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Bedrijfsnaam als er geen logo is */}
        {!brand.logoUrl && brand.bedrijfsnaam && (
          <div style={{
            fontSize: '20px', fontWeight: 800, color: brand.merkKleur || '#0A0A0A',
            marginBottom: '16px', letterSpacing: '-0.02em',
          }}>
            {brand.bedrijfsnaam}
          </div>
        )}

        {/* Status icon */}
        <div style={{
          width: '80px', height: '80px',
          borderRadius: '50%',
          background: c.bg,
          boxShadow: `0 0 0 8px ${c.ring}22`,
          color: 'white',
          fontSize: '40px',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          lineHeight: 1,
        }}>
          {c.icon}
        </div>

        {/* Title */}
        <div style={{
          fontSize: '28px', fontWeight: 800, color: '#0A0A0A',
          marginBottom: '8px', letterSpacing: '-0.02em',
        }}>
          {c.titel}
        </div>

        {/* Subtitle / welkomst */}
        <div style={{ fontSize: '15px', color: '#555', lineHeight: 1.6, marginBottom: '24px' }}>
          {sub}
        </div>

        {/* Code badge */}
        <div style={{
          fontFamily: "'SF Mono', 'Fira Code', 'DM Mono', monospace",
          fontSize: '16px', fontWeight: 700,
          color: '#666',
          background: '#F5F3EF',
          padding: '10px 20px',
          borderRadius: '10px',
          display: 'inline-block',
          letterSpacing: '0.15em',
          marginBottom: '20px',
        }}>
          {code}
        </div>

        {/* Bedrijfsnaam onder code (als er een logo is) */}
        {brand.logoUrl && brand.bedrijfsnaam && (
          <div style={{ fontSize: '13px', color: '#999', marginBottom: '16px' }}>
            {brand.bedrijfsnaam}
          </div>
        )}

        {/* CTA voor interesse */}
        {(status === 'interesse' || status === 'already-scanned') && (
          <div style={{
            background: brand.merkKleur || '#0A0A0A', color: '#fff',
            padding: '14px 24px', borderRadius: '12px',
            fontSize: '15px', fontWeight: 700,
            marginBottom: '16px',
          }}>
            Toon deze pagina bij de kassa
          </div>
        )}

        {/* Medewerker PIN-verzilvering */}
        {(status === 'interesse' || status === 'already-scanned') && brand.heeftPincode && (
          <PinForm code={code} accentColor={brand.merkKleur || undefined} />
        )}

        {/* Brand footer */}
        <div style={{
          fontSize: '10px', color: '#ccc', letterSpacing: '0.10em',
          textTransform: 'uppercase', marginTop: '12px',
        }}>
          Powered by LokaalKabaal
        </div>
      </div>
    </div>
  );
}
