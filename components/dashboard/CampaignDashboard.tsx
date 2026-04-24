'use client';

/**
 * CampaignDashboard -- main dashboard tab showing campaign stats, campaign list,
 * lifecycle banners, and the pending campaign approval widget.
 */

import { useCallback } from 'react';
import { showToast } from '@/components/Toast';
import CampaignList from '@/components/dashboard/CampaignList';
import OnboardingChecklist, { type OnboardingState } from '@/components/dashboard/OnboardingChecklist';
import { TIERS, type Tier } from '@/lib/tiers';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Campaign {
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

export interface PendingCampaign {
  spec: string;
  datum: string;
  centrum: string;
  aantalFlyers: number;
  formaat: string;
  dubbelzijdig: boolean;
  maxBudget: number;
  proefAdres: string;
}

interface SubStatus {
  subscriptionStatus: string;
  dashboardActiefTot: string | null;
  dagenResterend: number | null;
}

interface CampaignDashboardProps {
  /** List of campaigns to display */
  campaigns: Campaign[];
  /** Whether campaigns are loading */
  campaignsLoading: boolean;
  /** Error message if campaigns failed to load */
  campaignsError: string | null;
  /** Subscription lifecycle status */
  subStatus: SubStatus | null;
  /** User tier */
  userTier: Tier;
  /** Pending campaign awaiting payment approval */
  pendingCampaign: PendingCampaign | null;
  /** Current flyer business name (for checkout) */
  flyerBedrijfsnaam: string;
  /** Current user email */
  userEmail: string;
  /** Computed onboarding progress for the checklist widget */
  onboarding: OnboardingState;
  /** Callback to start a new campaign */
  onStartCampaign: () => void;
  /** Callback to navigate to flyer editor */
  onEditFlyer: () => void;
  /** Callback to navigate to settings (pincode) */
  onGoToSettings: () => void;
  /** Callback to clear the pending campaign */
  onClearPendingCampaign: () => void;
  /** Callback to toggle a campaign status */
  onToggleCampaignStatus: (id: number) => void;
  /** Callback to duplicate an existing campaign (prefills wizard) */
  onDuplicateCampaign: (c: Campaign) => void;
  /** Callback to refetch campaigns */
  onRefetchCampaigns: () => void;
}

/** Formats a euro price with 2 decimal places. */
function formatPrijs(x: number): string {
  return '\u20ac' + x.toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

/** Scrolling activity ticker showing recent campaign activity. */
function Ticker(): React.JSX.Element {
  const items = [
    'Koffiehuis Utrecht -- 380 flyers bezorgd',
    'StucPro Amsterdam -- 12 offertes aangevraagd',
    'Meubelwinkel Haarlem -- campagne verlengd',
    'Fietsenwinkel Leiden -- 520 flyers verstuurd',
    'Kapper Rotterdam -- 8 nieuwe vaste klanten',
    'Bakkerij Eindhoven -- 3e maand actief',
  ];
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', background: 'var(--green-bg)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
      <div className="ticker-inner" style={{ whiteSpace: 'nowrap' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', marginRight: '48px', display: 'inline-block' }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Lifecycle Banner ────────────────────────────────────────────────────────

/** Renders subscription lifecycle warnings (expiry, pause, etc.) */
function LifecycleBanner({ subStatus, userTier }: { subStatus: SubStatus; userTier: Tier }): React.JSX.Element | null {
  const { subscriptionStatus, dagenResterend } = subStatus;
  const tierCfg = TIERS[userTier];

  if (subscriptionStatus === 'geannuleerd' && dagenResterend !== null && dagenResterend <= 0) {
    return (
      <div style={{ background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ width: '8px', height: '8px', background: '#c0392b', borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#c0392b', fontWeight: 700, letterSpacing: '0.06em' }}>DASHBOARD VERLOPEN</span>
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '6px' }}>Je abonnement is be&euml;indigd</div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.6 }}>
          Je hebt geen actief abonnement meer. Vernieuw je abonnement om campagnes te blijven beheren.
        </div>
        <a href="/#prijzen" style={{ display: 'inline-block', padding: '10px 20px', background: tierCfg.color, color: '#0A0A0A', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
          Abonnement verlengen &#8594;
        </a>
      </div>
    );
  }

  if ((subscriptionStatus === 'geannuleerd' || subscriptionStatus === 'gepauzeerd') && dagenResterend !== null && dagenResterend > 0 && dagenResterend <= 14) {
    return (
      <div style={{ background: 'rgba(255,160,0,0.06)', border: '1px solid rgba(255,160,0,0.3)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ width: '8px', height: '8px', background: '#e8a020', borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#e8a020', fontWeight: 700, letterSpacing: '0.06em' }}>
            DASHBOARD VERLOOPT OVER {dagenResterend} DAG{dagenResterend !== 1 ? 'EN' : ''}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '6px' }}>Je campagne is afgelopen -- vernieuw om door te gaan</div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.6 }}>
          Na {dagenResterend} dag{dagenResterend !== 1 ? 'en' : ''} vervalt de toegang tot je dashboard.
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="/#prijzen" style={{ display: 'inline-block', padding: '10px 20px', background: tierCfg.color, color: '#0A0A0A', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
            Maandelijks verlengen ({tierCfg.label} &middot; &euro;{tierCfg.priceMonthly}/mnd) &#8594;
          </a>
        </div>
      </div>
    );
  }

  if (subscriptionStatus === 'gepauzeerd') {
    return (
      <div style={{ background: 'rgba(255,160,0,0.06)', border: '1px solid rgba(255,160,0,0.3)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#e8a020', fontWeight: 700, marginBottom: '3px' }}>ABONNEMENT GEPAUZEERD</div>
          <div style={{ fontSize: '13px', color: 'var(--ink)' }}>Betaling mislukt -- update je betaalgegevens om flyers te blijven versturen.</div>
        </div>
        <a href="/api/stripe/portal" style={{ display: 'inline-block', padding: '9px 18px', background: '#e8a020', color: '#0A0A0A', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '12px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Betaalgegevens bijwerken &#8594;
        </a>
      </div>
    );
  }

  return null;
}

// ─── CampaignDashboard ────────────────────────────────────────────────────────

/**
 * Main dashboard overview showing campaigns, stats, and lifecycle banners.
 */
export default function CampaignDashboard({
  campaigns,
  campaignsLoading,
  campaignsError,
  subStatus,
  userTier,
  pendingCampaign,
  flyerBedrijfsnaam,
  userEmail,
  onboarding,
  onStartCampaign,
  onEditFlyer,
  onGoToSettings,
  onClearPendingCampaign,
  onToggleCampaignStatus,
  onDuplicateCampaign,
  onRefetchCampaigns,
}: CampaignDashboardProps): React.JSX.Element {
  const activeCampaigns = campaigns.filter(c => c.status === 'actief');

  const handleCheckout = useCallback(async () => {
    if (!pendingCampaign) return;
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxFlyers: pendingCampaign.aantalFlyers,
          formaat: pendingCampaign.formaat,
          dubbelzijdig: pendingCampaign.dubbelzijdig,
          spec: pendingCampaign.spec,
          datum: pendingCampaign.datum,
          centrum: pendingCampaign.centrum,
          email: userEmail || 'klant@lokaalkabaal.nl',
          bedrijfsnaam: flyerBedrijfsnaam || 'Klant',
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || 'Stripe checkout mislukt', 'error');
      }
    } catch {
      showToast('Verbindingsfout -- probeer opnieuw', 'error');
    }
  }, [pendingCampaign, userEmail, flyerBedrijfsnaam]);

  return (
    <div className="fade-in">
      {subStatus && <LifecycleBanner subStatus={subStatus} userTier={userTier} />}

      <OnboardingChecklist
        state={onboarding}
        onGoToFlyer={onEditFlyer}
        onGoToSettings={onGoToSettings}
        onStartCampaign={onStartCampaign}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em' }}>MIJN CAMPAGNES</div>
        <button data-tour="tour-nieuwe-campagne" onClick={onStartCampaign} style={{ padding: '8px 16px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
          + Nieuwe campagne
        </button>
      </div>

      {/* Pending campaign approval widget */}
      {pendingCampaign && (
        <div style={{ background: '#fff', border: '2px solid var(--green)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#e8a020', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#e8a020', fontWeight: 700 }}>WACHT OP JOUW GOEDKEURING</span>
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '4px' }}>
              Proef flyer onderweg naar {pendingCampaign.proefAdres.split(',')[0]}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {pendingCampaign.spec} &middot; {pendingCampaign.aantalFlyers.toLocaleString('nl')} flyers/mnd &middot; {pendingCampaign.formaat.toUpperCase()} &middot; start {pendingCampaign.datum ? new Date(pendingCampaign.datum).toLocaleDateString('nl', { month: 'long', year: 'numeric' }) : '-'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button onClick={onEditFlyer} style={{ padding: '9px 18px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '13px' }}>
              Flyer aanpassen
            </button>
            <button onClick={handleCheckout} style={{ padding: '9px 18px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
              Betalen &amp; activeren &#8594;
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Actieve campagnes', val: String(activeCampaigns.length), delta: campaigns.length === 0 ? 'Start je eerste' : 'lopend' },
          { label: 'Max flyers/mnd', val: activeCampaigns.reduce((s, c) => s + c.aantalFlyers, 0).toLocaleString('nl'), delta: 'afgerond naar boven' },
          { label: 'Max budget/mnd', val: activeCampaigns.length ? formatPrijs(activeCampaigns.reduce((s, c) => s + c.maxBudget, 0)) : '-', delta: 'betaal alleen actual' },
          { label: 'Rollover', val: '0', delta: 'flyers volgende mnd' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Campaign list */}
      {campaignsLoading ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '60px 40px', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Campagnes laden...</div>
        </div>
      ) : campaignsError ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '60px 40px', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: '#ef4444', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>{campaignsError}</div>
          <button
            onClick={onRefetchCampaigns}
            style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: '4px', padding: '6px 16px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
          >
            Opnieuw proberen
          </button>
        </div>
      ) : (
        <CampaignList
          campaigns={campaigns}
          onStartCampaign={onStartCampaign}
          onToggleStatus={onToggleCampaignStatus}
          onDuplicate={onDuplicateCampaign}
          formatPrijs={formatPrijs}
        />
      )}

      <Ticker />
    </div>
  );
}
