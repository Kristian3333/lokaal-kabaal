/**
 * BrancheSelector -- industry/branche selection grid for the campaign wizard.
 * Displays a searchable grid of 40+ business types.
 */

interface BrancheSelectorProps {
  /** Array of branche/industry names to display */
  specs: string[];
  /** Currently selected branche */
  selected: string;
  /** Current search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Callback when a branche is selected */
  onSelect: (spec: string) => void;
}

export default function BrancheSelector({
  specs,
  selected,
  searchQuery,
  onSearchChange,
  onSelect,
}: BrancheSelectorProps): React.JSX.Element {
  const filtered = specs.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div data-tour="tour-wizard-branche">
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Wat voor bedrijf heb je?</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>Kies je branche voor de juiste copy en targeting.</p>
      <input
        type="text"
        placeholder="Zoek branche..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', marginBottom: '12px', background: 'var(--paper2)', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
        {filtered.map(s => (
          <button key={s} onClick={() => onSelect(s)}
            style={{
              padding: '10px 12px', textAlign: 'left',
              border: `1px solid ${selected === s ? 'var(--green)' : 'var(--line)'}`,
              borderRadius: 'var(--radius)', background: selected === s ? 'var(--green-bg)' : 'var(--paper)',
              cursor: 'pointer', fontSize: '13px', fontWeight: selected === s ? 600 : 400,
              color: selected === s ? 'var(--green-dim)' : 'var(--ink)', transition: 'all 0.15s'
            }}>{s}</button>
        ))}
      </div>
    </div>
  );
}
