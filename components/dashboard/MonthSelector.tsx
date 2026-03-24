/**
 * MonthSelector -- month/date selection grid for the campaign wizard.
 * Displays available start months in a 3-column grid.
 */

interface AvailableMonth {
  label: string;
  value: string;
  short: string;
}

interface MonthSelectorProps {
  /** List of available months to choose from */
  availableMonths: AvailableMonth[];
  /** Currently selected date value (ISO date string) */
  selected: string;
  /** Callback when a month is selected */
  onSelect: (value: string) => void;
}

export default function MonthSelector({
  availableMonths,
  selected,
  onSelect,
}: MonthSelectorProps): React.JSX.Element {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Wanneer wil je starten?</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
        Flyers worden elke maand op de <strong>25e</strong> verstuurd naar nieuwe bewoners van die maand. Kies je startmaand -- tot 12 maanden vooruit.
      </p>
      <div className="datum-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {availableMonths.map(m => (
          <button key={m.value} onClick={() => onSelect(m.value)}
            style={{
              padding: '14px 10px', border: `1px solid ${selected === m.value ? 'var(--green)' : 'var(--line)'}`,
              borderRadius: 'var(--radius)', background: selected === m.value ? 'var(--green-bg)' : 'var(--paper)',
              cursor: 'pointer', fontWeight: selected === m.value ? 700 : 400, fontSize: '13px',
              color: selected === m.value ? 'var(--green-dim)' : 'var(--ink)',
            }}>
            {m.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '16px', padding: '12px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        ℹ Startdatum is altijd de 1e van de gekozen maand. Bezorging vindt elke maand automatisch plaats op de 25e via Kadaster-data.
      </div>
    </div>
  );
}
