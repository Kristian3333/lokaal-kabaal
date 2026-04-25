'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { TIERS, canStartCampaign, type Tier } from '@/lib/tiers';
import { showToast } from '@/components/Toast';
import CampaignDashboard, { type Campaign } from '@/components/dashboard/CampaignDashboard';
import type { WizState, PendingCampaign } from '@/components/dashboard/CampaignWizard';
import type { SavedFlyer } from '@/components/dashboard/FlyerDesigner';
import { type FlyerState } from '@/components/dashboard/FlyerPreview';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import CommandPalette, { type Command } from '@/components/dashboard/CommandPalette';
import ProductTour from '@/components/dashboard/ProductTour';
import { buildMailto, CONTACT_SUPPORT_EMAIL } from '@/lib/contact-config';

// ─── Dynamic panels ──────────────────────────────────────────────────────────
//
// The wizard, flyer editor, billing and settings panels are only mounted once
// the user navigates to them. Lazy-loading keeps the /app first-load bundle
// (currently ~127 kB) smaller and defers Three.js/Leaflet/jsPDF dependencies.

const PanelLoading = (): React.JSX.Element => (
  <div style={{ padding: '40px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
    Laden...
  </div>
);

const CampaignWizard = dynamic(() => import('@/components/dashboard/CampaignWizard'), {
  ssr: false,
  loading: PanelLoading,
});
const FlyerDesigner = dynamic(() => import('@/components/dashboard/FlyerDesigner'), {
  ssr: false,
  loading: PanelLoading,
});
const SettingsPanel = dynamic(() => import('@/components/dashboard/SettingsPanel'), {
  ssr: false,
  loading: PanelLoading,
});
const ConversiesPanel = dynamic(() => import('@/components/dashboard/ConversiesPanel'), {
  ssr: false,
  loading: PanelLoading,
});
const BillingOverview = dynamic(() => import('@/components/dashboard/BillingOverview'), {
  ssr: false,
  loading: PanelLoading,
});

// ─── Constants ────────────────────────────────────────────────────────────────

type Page = 'dashboard' | 'wizard' | 'flyer' | 'billing' | 'profiel' | 'conversies';

const INIT_FLYER: FlyerState = {
  kleur: '#0A0A0A', accent: '#00E87A', afmeting: 'a5', dubbelzijdig: false,
  bedrijfsnaam: '', slogan: '', telefoon: '', email: '', website: '',
  usp: '', tekst: '', logoData: null,
  websiteUrl: '', websiteScan: null, design: 'editorial',
  heroImageUrl: null, heroOffsetX: 50, heroOffsetY: 50, heroScale: 100,
  headline: '', cta: '', pdfUrl: null,
  adres: '', openingstijden: '', backTekst: '', qrPlaats: 'achter' as const,
};

const INIT_WIZ: WizState = {
  step: 1, akkoord: { av: false, privacy: false }, kluswaarde: 2500,
  spec: '', specQ: '', datum: '', centrum: '', straal: 10,
  aantalFlyers: 500, formaat: 'a6', dubbelzijdig: true, duurMaanden: 3,
  filterBouwjaarMin: 1900, filterBouwjaarMax: new Date().getFullYear(),
  filterWozMin: 0, filterWozMax: 2000000, filterEnergielabel: [],
  proefFlyer: false, proefAdres: '', email: '', pc4Lijst: [], pc4Add: '', flyerIndex: 0,
  pakket: 'pro', jaarcontract: false,
};

const NAV_ITEMS: { id: Page; label: string; icon: string; minTier?: Tier }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'wizard', label: 'Nieuwe campagne', icon: '+' },
  { id: 'flyer', label: 'Mijn flyer', icon: '◧' },
  { id: 'conversies', label: 'Conversies', icon: '◑' },
  { id: 'billing', label: 'Abonnement', icon: '◎' },
  { id: 'profiel', label: 'Mijn profiel', icon: '◉' },
];

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Overzicht', wizard: 'Nieuwe campagne', flyer: 'Flyer editor',
  conversies: 'Conversies & ROI', billing: 'Abonnement & facturatie', profiel: 'Mijn profiel',
};

// ─── Main App ─────────────────────────────────────────────────────────────────

/** Root dashboard page -- orchestrates all panels via shared state. */
export default function LokaalKabaal(): React.JSX.Element {
  const router = useRouter();
  const [page, setPage] = useState<Page>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; naam: string; tier?: Tier; isJaarcontract?: boolean; branche?: string } | null>(null);
  const [subStatus, setSubStatus] = useState<{ subscriptionStatus: string; dashboardActiefTot: string | null; dagenResterend: number | null } | null>(null);
  const [pendingCampaign, setPendingCampaign] = useState<PendingCampaign | null>(null);
  const [wiz, setWiz] = useState<WizState>(INIT_WIZ);
  const [flyers, setFlyers] = useState<SavedFlyer[]>(() => {
    if (typeof window === 'undefined') return [{ ...INIT_FLYER, naam: 'Flyer 1', id: 1 }];
    try {
      const saved = localStorage.getItem('lk_flyers');
      if (saved) {
        const parsed: SavedFlyer[] = JSON.parse(saved);
        return parsed.map(f => ({ ...f, afmeting: f.afmeting === 'a4' ? 'sq' : f.afmeting }));
      }
    } catch (err) { console.error('[dashboard] Failed to parse localStorage flyers:', err); }
    return [{ ...INIT_FLYER, naam: 'Flyer 1', id: 1 }];
  });
  const [activeFlyerIdx, setActiveFlyerIdx] = useState(0);
  const [previewSide, setPreviewSide] = useState<'voor' | 'achter'>('voor');
  const [aiLoading, setAiLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  // Onboarding progress signals -- sourced from /api/pincode + /api/conversies
  const [winkelPincode, setWinkelPincode] = useState<string | null>(null);
  const [firstScanSeen, setFirstScanSeen] = useState(false);

  const userTier: Tier = user?.tier ?? 'starter';
  const flyer = flyers[Math.min(activeFlyerIdx, flyers.length - 1)];

  // Persist flyers to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('lk_flyers', JSON.stringify(flyers));
  }, [flyers]);

  const fetchCampaigns = useCallback(async (email: string) => {
    setCampaignsLoading(true);
    setCampaignsError(null);
    try {
      const res = await fetch(`/api/campaigns?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error(`Campagnes ophalen mislukt (${res.status})`);
      const rows = await res.json();
      const mapped: Campaign[] = (rows as Array<Record<string, unknown>>).map(r => ({
        id: r.id as number,
        spec: (r.branche as string) || '',
        datum: (r.startMaand as string) || '',
        centrum: (r.centrum as string) || '',
        aantalFlyers: (r.verwachtAantalPerMaand as number) || 0,
        formaat: (r.formaat as string) || 'a6',
        dubbelzijdig: (r.dubbelzijdig as boolean) || false,
        maxBudget: 0,
        status: (r.status as Campaign['status']) || 'actief',
        createdAt: (r.createdAt as string) || new Date().toISOString(),
      }));
      setCampaigns(mapped);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Campagnes laden mislukt';
      setCampaignsError(msg);
      showToast(msg, 'error');
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  // Initialize user from session/localStorage and fetch campaigns + subscription status
  useEffect(() => {
    async function initUser() {
      let identified: { email: string; naam: string; tier?: Tier; isJaarcontract?: boolean; branche?: string } | null = null;
      try {
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (session.authenticated && session.email) {
            identified = {
              email: session.email,
              naam: session.bedrijfsnaam ?? '',
              tier: session.tier ?? undefined,
              branche: session.branche ?? undefined,
            };
          }
        }
      } catch (err) { console.error('[dashboard] Session check failed:', err); }
      if (!identified) {
        try {
          const raw = localStorage.getItem('lk_user');
          if (raw) identified = JSON.parse(raw);
        } catch (err) { console.error('[dashboard] Failed to parse localStorage user:', err); }
      }
      if (!identified) { setCampaignsLoading(false); return; }
      setUser(identified);
      if (identified.email) {
        try {
          const subRes = await fetch(`/api/subscription/status?email=${encodeURIComponent(identified.email)}`);
          const data = await subRes.json();
          if (data.found) {
            setSubStatus({ subscriptionStatus: data.subscriptionStatus, dashboardActiefTot: data.dashboardActiefTot, dagenResterend: data.dagenResterend });
            if (data.tier && data.tier !== identified.tier) {
              const updated = { ...identified, tier: data.tier, isJaarcontract: data.isJaarcontract };
              localStorage.setItem('lk_user', JSON.stringify(updated));
              setUser(updated);
              identified = updated;
            }
          }
        } catch (err) { console.error('[dashboard] Subscription status fetch failed:', err); }
        fetchCampaigns(identified.email);

        // Onboarding signals: pincode + first-scan-seen
        fetch(`/api/pincode?email=${encodeURIComponent(identified.email)}`)
          .then(r => r.json())
          .then(d => { if (d.pincode) setWinkelPincode(d.pincode); })
          .catch(() => { /* non-fatal */ });
        fetch(`/api/conversies?email=${encodeURIComponent(identified.email)}&limit=1`)
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d && Array.isArray(d.conversies) && d.conversies.length > 0) setFirstScanSeen(true); })
          .catch(() => { /* non-fatal */ });
      }
    }
    initUser();
  }, [fetchCampaigns]);

  // Handle Stripe payment return redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const stored = sessionStorage.getItem('lk_pending_campaign');
      if (stored) {
        try {
          const pc = JSON.parse(stored) as PendingCampaign;
          const storedFlyer = sessionStorage.getItem('lk_pending_flyer');
          const flyerDesign = storedFlyer ? JSON.parse(storedFlyer) : null;
          const userEmail = user?.email || (() => { try { return JSON.parse(localStorage.getItem('lk_user') || '{}').email; } catch { return null; } })();
          if (userEmail) {
            const emailForRefetch = userEmail;
            fetch('/api/campaigns', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, naam: `${pc.spec} campagne`, branche: pc.spec, centrum: pc.centrum, verwachtAantalPerMaand: pc.aantalFlyers, duurMaanden: 1, startMaand: pc.datum, formaat: pc.formaat, dubbelzijdig: pc.dubbelzijdig, stripeSessionId: params.get('session_id'), flyerDesign }),
            }).then(r => { if (!r.ok) throw new Error('Campaign save failed'); return r.json(); })
              .then(() => fetchCampaigns(emailForRefetch))
              .catch(() => showToast('Campagne opslaan mislukt. Neem contact op met support.', 'error'));
          }
          sessionStorage.removeItem('lk_pending_campaign');
          sessionStorage.removeItem('lk_pending_flyer');
          setPendingCampaign(null);
        } catch (err) { console.error('[dashboard] Payment return processing failed:', err); }
      }
      setPage('dashboard');
      window.history.replaceState({}, '', '/app');
    } else if (params.get('payment') === 'cancelled') {
      setPage('dashboard');
      window.history.replaceState({}, '', '/app');
    }
  }, [fetchCampaigns]); // eslint-disable-line react-hooks/exhaustive-deps

  const uitloggen = async (): Promise<void> => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (err) { console.error('[dashboard] Logout request failed:', err); }
    localStorage.removeItem('lk_user');
    router.push('/');
  };

  const startNieuweCampagne = () => {
    const activeCampaigns = campaigns.filter(c => c.status === 'actief').length;
    if (!canStartCampaign(userTier, activeCampaigns)) {
      const cfg = TIERS[userTier];
      showToast(`Je ${cfg.label}-abonnement staat max. ${cfg.maxCampaigns} gelijktijdige campagne${cfg.maxCampaigns !== 1 ? 's' : ''} toe. Upgrade naar Pro of Agency voor meer campagnes.`, 'warning');
      return;
    }
    // Pre-fill sector with the branche the user chose at signup (if any) and
    // default the package picker to the user's current tier.
    setWiz({
      ...INIT_WIZ,
      spec: user?.branche ?? '',
      pakket: userTier,
      jaarcontract: !!user?.isJaarcontract,
    });
    setPage('wizard');
  };

  /** Pre-fill the wizard with an existing campaign's settings for one-click
   *  duplication (different werkgebied, same everything else). Respects the
   *  tier's campaign cap -- blocked campaigns get a toast. */
  const duplicateCampaign = (c: Campaign) => {
    const activeCampaigns = campaigns.filter(x => x.status === 'actief').length;
    if (!canStartCampaign(userTier, activeCampaigns)) {
      const cfg = TIERS[userTier];
      showToast(`Je ${cfg.label}-abonnement staat max. ${cfg.maxCampaigns} gelijktijdige campagne${cfg.maxCampaigns !== 1 ? 's' : ''} toe. Upgrade naar Pro of Agency voor meer campagnes.`, 'warning');
      return;
    }
    setWiz({
      ...INIT_WIZ,
      spec: c.spec,
      datum: '',           // force user to pick a new startdatum
      centrum: '',         // force user to pick a new werkgebied
      aantalFlyers: c.aantalFlyers,
      formaat: (c.formaat as typeof INIT_WIZ.formaat) || 'a6',
      dubbelzijdig: true,
      pakket: userTier,
      jaarcontract: !!user?.isJaarcontract,
    });
    showToast(`Campagne "${c.spec}" gedupliceerd -- kies een nieuw werkgebied`, 'success');
    setPage('wizard');
  };

  const updateFlyer = useCallback((patch: Partial<FlyerState>) => {
    setFlyers(fs => fs.map((f, i) => i === activeFlyerIdx ? { ...f, ...patch } : f));
  }, [activeFlyerIdx]);

  const runFlyerPipeline = useCallback(async (url: string) => {
    const cleaned = url.trim();
    if (!cleaned) { setScanMsg('Vul eerst een website-URL in.'); setTimeout(() => setScanMsg(''), 4000); return; }
    // Accept "www.foo.nl" or "foo.nl" -- the server normalizes again but we also
    // keep a consistent URL for the state fields below.
    const normalizedUrl = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned.replace(/^\/+/, '')}`;

    setScanLoading(true); setAiLoading(true); setScanMsg('Website ophalen en flyer genereren...');
    try {
      const res = await fetch('/api/flyer/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, branche: wiz.spec || 'Lokale retailer', bedrijfsnaam: flyer.bedrijfsnaam || '', telefoon: flyer.telefoon || '', email: flyer.email || '', website: flyer.website || normalizedUrl, slogan: flyer.slogan || '' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setScanMsg(data.error || `Fout (${res.status})`); return; }
      const patch: Partial<FlyerState> = { websiteScan: { primaryColor: data.kleuren?.primair, accentColor: data.kleuren?.accent }, heroImageUrl: data.besteFotoUrl || null, pdfUrl: data.pdfUrl || null, logoData: data.logoUrl || null };
      if (data.kleuren?.primair) patch.kleur = data.kleuren.primair;
      if (data.kleuren?.accent) patch.accent = data.kleuren.accent;
      if (data.tekst?.bodytekst) patch.tekst = data.tekst.bodytekst;
      if (data.tekst?.usps?.length) patch.usp = data.tekst.usps.join('\n');
      if (data.tekst?.headline) patch.headline = data.tekst.headline;
      if (data.tekst?.cta) patch.cta = data.tekst.cta;
      if (!flyer.website) patch.website = normalizedUrl;
      updateFlyer(patch);
      setScanMsg(data.pdfUrl ? 'Flyer gegenereerd -- PDF klaar!' : 'Kleuren en tekst overgenomen!');
    } catch { setScanMsg('Generatie mislukt -- controleer de URL en probeer opnieuw.'); }
    finally { setScanLoading(false); setAiLoading(false); setTimeout(() => setScanMsg(''), 6000); }
  }, [wiz.spec, flyer.bedrijfsnaam, flyer.slogan, flyer.telefoon, flyer.email, flyer.website, updateFlyer]);

  const generateAI = useCallback(async () => {
    if (flyer.websiteUrl) { await runFlyerPipeline(flyer.websiteUrl); return; }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spec: wiz.spec, bedrijfsnaam: flyer.bedrijfsnaam, slogan: flyer.slogan }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const patch: Partial<FlyerState> = {};
      if (data.tekst) patch.tekst = data.tekst;
      if (data.usp) patch.usp = data.usp;
      if (data.headline) patch.headline = data.headline;
      if (data.cta) patch.cta = data.cta;
      updateFlyer(patch);
    } catch (e) { /* log suppressed per standards */ void e; }
    finally { setAiLoading(false); }
  }, [wiz.spec, flyer.bedrijfsnaam, flyer.slogan, flyer.websiteUrl, runFlyerPipeline, updateFlyer]);

  // ── Command palette (cmd/ctrl+K) ──────────────────────────────────────────
  const commands: Command[] = [
    { id: 'go-dashboard', label: 'Ga naar Dashboard',      hint: 'Overzicht + campagnes',        keywords: ['home', 'overview'],     onRun: () => setPage('dashboard') },
    { id: 'go-wizard',    label: 'Nieuwe campagne starten',hint: '8-stappen wizard',             keywords: ['add', 'new', 'campagne'],onRun: startNieuweCampagne },
    { id: 'go-flyer',     label: 'Flyer editor openen',    hint: 'Ontwerp of upload',            keywords: ['flyer', 'design'],       onRun: () => setPage('flyer') },
    { id: 'go-conv',      label: 'Conversies bekijken',    hint: 'QR-scans + pincode-conversie', keywords: ['analytics', 'roi'],     onRun: () => setPage('conversies') },
    { id: 'go-bill',      label: 'Abonnement & facturatie',hint: 'Stripe portaal + facturen',    keywords: ['billing', 'invoice'],    onRun: () => setPage('billing') },
    { id: 'go-profile',   label: 'Mijn profiel',           hint: 'Bedrijfsgegevens + pincode',   keywords: ['settings', 'account'],   onRun: () => setPage('profiel') },
    { id: 'upgrade',      label: 'Abonnement upgraden',    hint: 'Bekijk tiers',                 keywords: ['upgrade', 'prijs'],     onRun: () => window.open('/#prijzen', '_blank') },
    { id: 'support',      label: 'Support mailen',         hint: CONTACT_SUPPORT_EMAIL,           keywords: ['help', 'contact'],       onRun: () => { window.location.href = buildMailto('general'); } },
    { id: 'logout',       label: 'Uitloggen',              hint: 'Terug naar de landing',        keywords: ['sign out', 'exit'],      onRun: uitloggen },
  ];

  // ── Shell render ──────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--paper)' }}>
      <CommandPalette commands={commands} />
      <ProductTour
        isNewUser={!campaignsLoading && campaigns.length === 0}
        onGoTo={target => {
          if (target === 'wizard') startNieuweCampagne();
          else setPage(target as Page);
        }}
      />
      {/* Sidebar */}
      <DashboardSidebar
        page={page}
        user={user}
        userTier={userTier}
        navItems={NAV_ITEMS}
        onNavigate={p => setPage(p as Page)}
        onLogout={uitloggen}
        onSwitchTestAccount={acc => {
          localStorage.setItem('lk_user', JSON.stringify(acc));
          setUser(acc);
        }}
      />

      {/* Main content */}
      <main style={{ flex: 1, overflowY: page === 'wizard' ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 'var(--topbar)', flexShrink: 0, background: 'var(--white)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontStyle: 'italic', color: 'var(--muted)' }}>{PAGE_TITLES[page]}</div>
          <div style={{ width: '28px', height: '28px', background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', color: 'var(--ink)' }}>
            {(user?.naam || 'G')[0].toUpperCase()}
          </div>
        </div>

        <div style={{ flex: 1, padding: page === 'wizard' ? '0' : '24px', maxWidth: page === 'wizard' ? '100%' : '1200px', width: '100%', margin: '0 auto', alignSelf: 'stretch', boxSizing: 'border-box' }}>
          {page === 'dashboard' && (
            <CampaignDashboard
              campaigns={campaigns}
              campaignsLoading={campaignsLoading}
              campaignsError={campaignsError}
              subStatus={subStatus}
              userTier={userTier}
              pendingCampaign={pendingCampaign}
              flyerBedrijfsnaam={flyer.bedrijfsnaam}
              userEmail={user?.email || ''}
              onboarding={{
                flyerReady: !!flyer.bedrijfsnaam && !!flyer.logoData,
                pincodeSet: !!winkelPincode,
                campaignCreated: campaigns.length > 0,
                firstScan: firstScanSeen,
              }}
              onStartCampaign={startNieuweCampagne}
              onEditFlyer={() => setPage('flyer')}
              onGoToSettings={() => setPage('profiel')}
              onClearPendingCampaign={() => setPendingCampaign(null)}
              onToggleCampaignStatus={id => setCampaigns(prev => prev.map(x => x.id === id ? { ...x, status: x.status === 'actief' ? 'gepauzeerd' : 'actief' } : x))}
              onDuplicateCampaign={duplicateCampaign}
              onRefetchCampaigns={() => { if (user?.email) fetchCampaigns(user.email); }}
            />
          )}
          {page === 'wizard' && (
            <CampaignWizard
              wiz={wiz}
              userTier={userTier}
              flyer={flyer}
              flyers={flyers}
              onUpdateWiz={patch => setWiz(w => ({ ...w, ...patch }))}
              onSetActiveFlyerIdx={setActiveFlyerIdx}
              onSetPage={p => setPage(p as Page)}
              onSetPendingCampaign={setPendingCampaign}
              userEmail={user?.email || ''}
            />
          )}
          {page === 'flyer' && (
            <FlyerDesigner
              flyer={flyer}
              flyers={flyers}
              activeFlyerIdx={activeFlyerIdx}
              previewSide={previewSide}
              scanLoading={scanLoading}
              scanMsg={scanMsg}
              aiLoading={aiLoading}
              pendingCampaign={pendingCampaign}
              onUpdateFlyer={updateFlyer}
              onSetFlyers={setFlyers}
              onSetActiveFlyerIdx={setActiveFlyerIdx}
              onSetPreviewSide={setPreviewSide}
              onScanWebsite={() => { if (flyer.websiteUrl) runFlyerPipeline(flyer.websiteUrl); }}
              onGenerateAI={generateAI}
              onSetPage={p => setPage(p as Page)}
              onSetPendingCampaign={setPendingCampaign}
              flyerBedrijfsnaam={flyer.bedrijfsnaam}
              initFlyer={INIT_FLYER}
              userTier={userTier}
              isJaarcontract={!!user?.isJaarcontract}
              userEmail={user?.email}
            />
          )}
          {page === 'conversies' && (
            <ConversiesPanel
              campaigns={campaigns}
              userEmail={user?.email || ''}
              onStartCampagne={() => setPage('wizard')}
            />
          )}
          {page === 'billing' && (
            <BillingOverview />
          )}
          {page === 'profiel' && (
            <SettingsPanel
              email={user?.email || ''}
              tier={userTier}
              isJaarcontract={!!user?.isJaarcontract}
              bedrijfsnaam={user?.naam}
              branche={user?.branche}
              onUpgrade={() => window.open('/#prijzen', '_blank')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
