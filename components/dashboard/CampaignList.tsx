/**
 * CampaignList -- displays existing campaigns as cards, or an empty state
 * prompting the user to create their first campaign.
 */

interface Campaign {
  id: number;
  spec: string;
  datum: string;
  centrum: string;
  aantalFlyers: number;
  formaat: string;
  dubbelzijdig: boolean;
  maxBudget: number;
  status: 'actief' | 'gepauzeerd' | 'geannuleerd';
  stripeSessionId?: string;
  createdAt: string;
  proefAdres?: string;
}

interface CampaignListProps {
  /** Array of campaigns to display */
  campaigns: Campaign[];
  /** Callback to start a new campaign */
  onStartCampaign: () => void;
  /** Callback to toggle a campaign between actief/gepauzeerd */
  onToggleStatus: (id: number) => void;
  /** Format a price number to a display string */
  formatPrijs: (x: number) => string;
}

export default function CampaignList({
  campaigns,
  onStartCampaign,
  onToggleStatus,
  formatPrijs,
}: CampaignListProps): React.JSX.Element {
  if (campaigns.length === 0) {
    return (
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '60px 40px', textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', marginBottom: '16px', color: 'var(--line)' }}>◈</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', marginBottom: '10px' }}>Nog geen campagnes</div>
        <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.65, maxWidth: '380px', margin: '0 auto 24px' }}>
          Maak je eerste campagne en bereik nieuwe bewoners in jouw werkgebied — automatisch elke maand.
        </p>
        <button onClick={onStartCampaign} style={{ padding: '12px 28px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
          + Eerste campagne starten
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
      {campaigns.map(c => {
        const now = new Date();
        const next25 = new Date(now.getFullYear(), now.getMonth(), 25);
        if (next25 <= now) next25.setMonth(next25.getMonth() + 1);
        const daysUntil = Math.ceil((next25.getTime() - now.getTime()) / 86400000);
        return (
        <div key={c.id} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {/* Type banner */}
          <div style={{ background: 'var(--green-bg)', borderBottom: '1px solid rgba(0,232,122,0.2)', padding: '6px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Nieuwe bewoners · Altum-data</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(0,0,0,0.3)' }}>·</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green-dim)' }}>elke 25e automatisch verstuurd</span>
            </div>
            {c.status === 'actief' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green-dim)' }}>
                volgende verzending over <strong>{daysUntil} dag{daysUntil !== 1 ? 'en' : ''}</strong>
              </span>
            )}
          </div>
          {/* Campaign body */}
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.status === 'actief' ? 'var(--green)' : '#888', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{c.spec}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  {c.centrum} · max {c.aantalFlyers.toLocaleString('nl')} flyers/mnd · {c.formaat.toUpperCase()}{c.dubbelzijdig ? ' dubbelzijdig' : ''} · start {c.datum ? new Date(c.datum).toLocaleDateString('nl', { month: 'long', year: 'numeric' }) : '—'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>{formatPrijs(c.maxBudget)}<span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>/mnd max</span></div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>betaal alleen actual gebruik</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '3px 8px', borderRadius: '3px', background: c.status === 'actief' ? 'var(--green-bg)' : 'var(--paper2)', color: c.status === 'actief' ? 'var(--green-dim)' : 'var(--muted)', border: `1px solid ${c.status === 'actief' ? 'rgba(0,232,122,0.3)' : 'var(--line)'}`, fontWeight: 700 }}>
                {c.status.toUpperCase()}
              </span>
              <button onClick={() => onToggleStatus(c.id)}
                style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer' }}>
                {c.status === 'actief' ? 'Pauzeren' : 'Hervatten'}
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
