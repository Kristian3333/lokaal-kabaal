'use client';

import { useState, useEffect } from 'react';
import { TIERS, type Tier } from '@/lib/tiers';

interface SubscriptionStatus {
  found: boolean;
  tier?: Tier;
  subscriptionStatus?: 'actief' | 'gepauzeerd' | 'geannuleerd' | 'proef';
  isJaarcontract?: boolean;
  volgendeBetaling?: string | null;
  stripeBedragCents?: number | null;
  creditBalance?: number;
  dashboardActiefTot?: string | null;
  dagenResterend?: number | null;
}

interface InvoiceRecord {
  id: string;
  datum: string;
  bedragCents: number;
  valuta: string;
  status: string;
  pdfUrl: string | null;
  beschrijving: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  actief:      'Actief',
  gepauzeerd:  'Gepauzeerd',
  geannuleerd: 'Geannuleerd',
  proef:       'Proefperiode',
};

const STATUS_COLORS: Record<string, string> = {
  actief:      '#00E87A',
  gepauzeerd:  '#f59e0b',
  geannuleerd: '#ef4444',
  proef:       '#60a5fa',
};

function formatEuro(cents: number): string {
  return '€' + (cents / 100).toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDatum(iso: string): string {
  return new Date(iso).toLocaleDateString('nl', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * BillingOverview -- shows the current subscription plan, status, next billing
 * date, included flyers, and links to the Stripe billing portal and upgrade flow.
 */
export default function BillingOverview(): React.JSX.Element {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/subscription/status')
      .then(r => r.json())
      .then((data: SubscriptionStatus) => setStatus(data))
      .catch(() => setError('Abonnementsgegevens konden niet worden geladen'));

    fetch('/api/stripe/invoices')
      .then(r => r.json())
      .then((data: { invoices: InvoiceRecord[] }) => setInvoices(data.invoices ?? []))
      .catch(() => {
        // Non-fatal: invoices are supplementary information
      });
  }, []);

  async function openPortal(): Promise<void> {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Portaal kon niet worden geopend');
      }
    } catch {
      setError('Portaal kon niet worden geopend');
    } finally {
      setLoadingPortal(false);
    }
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#ef4444', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
        {error}
      </div>
    );
  }

  if (!status) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
        Laden...
      </div>
    );
  }

  if (!status.found) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '8px' }}>Geen abonnement gevonden</div>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Kies een pakket om te beginnen.</p>
      </div>
    );
  }

  const tier = status.tier ?? 'starter';
  const tierConfig = TIERS[tier];
  const statusLabel = STATUS_LABELS[status.subscriptionStatus ?? 'proef'] ?? status.subscriptionStatus;
  const statusColor = STATUS_COLORS[status.subscriptionStatus ?? 'proef'] ?? '#8A8479';

  // Find a higher tier to suggest for upgrade
  const tierOrder: Tier[] = ['starter', 'pro', 'agency'];
  const currentIndex = tierOrder.indexOf(tier);
  const upgradeTier: Tier | null = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Plan card */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
              LokaalKabaal {tierConfig.label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}44`, fontWeight: 700 }}>
              {statusLabel.toUpperCase()}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px' }}>
            {status.isJaarcontract
              ? `€${tierConfig.priceYearly.toLocaleString('nl', { minimumFractionDigits: 2 })}/mnd`
              : `€${tierConfig.priceMonthly}/mnd`}
            {status.isJaarcontract && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginLeft: '6px' }}>jaarcontract</span>
            )}
          </div>
        </div>

        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {/* Next billing date */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Volgende betaling
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {status.volgendeBetaling ? formatDatum(status.volgendeBetaling) : '--'}
            </div>
            {status.stripeBedragCents != null && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
                {formatEuro(status.stripeBedragCents)}
              </div>
            )}
          </div>

          {/* Included flyers per month */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Flyers/mnd inbegrepen
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {tierConfig.includedFlyers.toLocaleString('nl')}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
              A6 dubbelzijdig
            </div>
          </div>

          {/* Max campaigns */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Max. campagnes
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {tierConfig.maxCampaigns === null ? 'Onbeperkt' : tierConfig.maxCampaigns}
            </div>
          </div>

          {/* Dashboard active until */}
          {status.dashboardActiefTot && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Dashboard actief t/m
              </div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>
                {formatDatum(status.dashboardActiefTot)}
              </div>
              {status.dagenResterend != null && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: status.dagenResterend <= 7 ? '#ef4444' : 'var(--muted)' }}>
                  {status.dagenResterend} dag{status.dagenResterend !== 1 ? 'en' : ''} resterend
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={openPortal}
            disabled={loadingPortal}
            style={{
              padding: '10px 20px',
              background: 'var(--ink)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loadingPortal ? 'not-allowed' : 'pointer',
              opacity: loadingPortal ? 0.6 : 1,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {loadingPortal ? 'Laden...' : 'Facturatie beheren'}
          </button>

          {upgradeTier && (
            <a
              href={`/prijzen?upgrade=${upgradeTier}`}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
                display: 'inline-block',
              }}
            >
              Upgraden naar {TIERS[upgradeTier].label}
            </a>
          )}
        </div>
      </div>

      {/* Invoice history */}
      {invoices.length > 0 && (
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
            Factuurgeschiedenis
          </div>
          <div>
            {invoices.map((inv, i) => (
              <div
                key={inv.id}
                style={{
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: i < invoices.length - 1 ? '1px solid var(--line)' : 'none',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    {formatDatum(inv.datum)}
                  </div>
                  {inv.beschrijving && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                      {inv.beschrijving}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '15px' }}>
                    {formatEuro(inv.bedragCents)}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: inv.status === 'paid' ? '#00E87A22' : '#f59e0b22',
                    color: inv.status === 'paid' ? '#00E87A' : '#f59e0b',
                    border: `1px solid ${inv.status === 'paid' ? '#00E87A44' : '#f59e0b44'}`,
                    fontWeight: 700,
                  }}>
                    {inv.status === 'paid' ? 'BETAALD' : inv.status.toUpperCase()}
                  </span>
                  {inv.pdfUrl && (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--muted)',
                        textDecoration: 'none',
                        border: '1px solid var(--line)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
