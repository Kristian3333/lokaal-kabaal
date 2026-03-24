/**
 * PriceCalculator -- pricing display section showing per-flyer costs
 * based on format/dubbelzijdig selections, plus subscription overview.
 */

import { prijsPerStuk, toeslagLabel, type FlyerFormaat } from '@/lib/printone-pricing';

interface PriceCalculatorProps {
  /** Currently selected flyer format */
  formaat: FlyerFormaat;
  /** Whether dubbelzijdig printing is enabled */
  dubbelzijdig: boolean;
  /** Estimated new addresses per month */
  estAdressenMaand: number;
  /** Callback when format changes */
  onFormaatChange: (formaat: FlyerFormaat) => void;
  /** Callback when dubbelzijdig changes */
  onDubbelzijdigChange: (checked: boolean) => void;
  /** Subscription info to display */
  abonnement: { tier: string; base: number; total: number };
  /** Number of PC4 areas in the coverage */
  actualPc4Count: number;
  /** Format a price number to display string */
  formatPrijs: (x: number) => string;
  /** Centrum postcode (for the mailto link) */
  centrum: string;
  /** Straal in km (for the mailto link) */
  straal: number;
  /** Selected branche/spec (for the mailto link) */
  spec: string;
}

export default function PriceCalculator({
  formaat,
  dubbelzijdig,
  estAdressenMaand,
  onFormaatChange,
  onDubbelzijdigChange,
  abonnement,
  actualPc4Count,
  formatPrijs,
  centrum,
  straal,
  spec,
}: PriceCalculatorProps): React.JSX.Element {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Formaat & aantallen</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
        Minimum 300 flyers per batch voor een rendabele printrun. A6 is ons standaardformaat — grotere formaten hebben een toeslag.
      </p>

      {/* Min-300 waarschuwing */}
      {estAdressenMaand < 300 && (
        <div style={{ background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.3)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#b8860b', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Werkgebied onder minimumdrempel
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6, marginBottom: '8px' }}>
            Dit gebied heeft gemiddeld ~{estAdressenMaand} overdrachten/maand. Voeg aangrenzende postcodes toe om de minimumdrempel van 300 te halen.
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            Of kies bewust voor minder — dan geldt een toeslag van 3× het standaard tarief. Dit wordt bevestigd bij het afrekenen.
          </div>
        </div>
      )}

      {/* Formaat */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>FORMAAT (Print.one tarieven)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {([
            { id: 'a6' as FlyerFormaat, label: 'A6', afm: '105×148 mm', std: true },
            { id: 'a5' as FlyerFormaat, label: 'A5', afm: '148×210 mm', std: false },
          ] as const).map(f => {
            const toeslag = toeslagLabel(f.id, dubbelzijdig);
            const isSelected = formaat === f.id;
            return (
              <div key={f.id} onClick={() => onFormaatChange(f.id)}
                style={{
                  padding: '16px', border: `2px solid ${isSelected ? 'var(--green)' : 'var(--line)'}`,
                  borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'center',
                  background: isSelected ? 'var(--green-bg)' : 'var(--paper)',
                  transition: 'all 0.15s', position: 'relative',
                }}>
                {f.std && <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: 'var(--ink)', fontSize: '9px', fontWeight: 700, padding: '1px 8px', borderRadius: '2px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>STANDAARD</div>}
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '4px' }}>{f.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{f.afm}</div>
                <div style={{ fontSize: '11px', color: isSelected ? 'var(--green-dim)' : 'var(--muted)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '6px' }}>{toeslag}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dubbelzijdig */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px', border: `1px solid ${dubbelzijdig ? 'var(--green)' : 'var(--line)'}`, borderRadius: 'var(--radius)', background: dubbelzijdig ? 'var(--green-bg)' : 'var(--paper)' }}>
          <input type="checkbox" checked={dubbelzijdig} onChange={e => onDubbelzijdigChange(e.target.checked)} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Dubbelzijdig</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>+€0,10 per flyer — achterkant voor extra info, kortingscode of kaart</div>
          </div>
        </label>
      </div>

      {/* Verwacht aantal flyers per maand */}
      <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.3)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.08em', marginBottom: '6px' }}>VERWACHT AANTAL FLYERS PER MAAND</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--green)', lineHeight: 1 }}>
            {estAdressenMaand.toLocaleString('nl')}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>nieuwe woningeigenaren/maand in uw werkgebied</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          Dit aantal wordt elke 25e verstuurd. Printkosten: <strong>€{(prijsPerStuk(formaat, dubbelzijdig) * estAdressenMaand).toFixed(2).replace('.', ',')}</strong> ({estAdressenMaand} × €{prijsPerStuk(formaat, dubbelzijdig).toFixed(2).replace('.', ',')}/stuk)
        </div>
      </div>

      {/* Offerte bij groot werkgebied */}
      {estAdressenMaand >= 5000 && (
        <div style={{ background: 'var(--ink)', border: '1px solid rgba(0,232,122,0.3)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', marginBottom: '8px', letterSpacing: '0.08em' }}>
            GROOT WERKGEBIED — MAATWERKTARIEF
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '12px', lineHeight: 1.6 }}>
            Uw werkgebied bevat ~{estAdressenMaand.toLocaleString('nl')} nieuwe bewoners per maand. Voor grotere gebieden maken we een maatwerkaanbod.
          </div>
          <a
            href={`mailto:hallo@lokaalkabaal.nl?subject=Prijsverzoek groot werkgebied&body=Hallo,%0A%0AIk wil graag een offerte voor mijn werkgebied:%0A- Centrum: ${centrum}%0A- Straal: ${straal} km%0A- Branche: ${spec}%0A- Geschatte nieuwe bewoners/mnd: ${estAdressenMaand}%0A%0AKunt u mij een aanbod sturen?`}
            style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)' }}
          >
            Stuur prijsverzoek →
          </a>
        </div>
      )}

      {/* Abonnementsoverzicht */}
      <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
          ABONNEMENT — {actualPc4Count} PC4-POSTCODE{actualPc4Count !== 1 ? 'S' : ''} IN UW WERKGEBIED
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span>{abonnement.tier} abonnement ({actualPc4Count} PC4-gebieden in werkgebied)</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPrijs(abonnement.base)}/mnd</span>
          </div>
          <div style={{ height: '1px', background: 'var(--line)', margin: '2px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700 }}>Totaal per maand</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green)' }}>{formatPrijs(abonnement.total)}</span>
          </div>
        </div>
        <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)', borderRadius: 'var(--radius)', padding: '10px 12px', fontSize: '12px', color: 'var(--ink)', lineHeight: 1.6 }}>
          Alle nieuwe bewoners in uw {actualPc4Count} postcode{actualPc4Count !== 1 ? 's' : ''} zijn inbegrepen — geen limiet op het aantal flyers. Jaarcontract: 25% korting.
        </div>
      </div>
    </div>
  );
}
