'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TIERS, canStartCampaign, type Tier } from '@/lib/tiers';
import { showToast } from '@/components/Toast';
import CampaignDashboard, { type Campaign } from '@/components/dashboard/CampaignDashboard';
import CampaignWizard, { type WizState, type PendingCampaign } from '@/components/dashboard/CampaignWizard';
import FlyerDesigner, { type SavedFlyer } from '@/components/dashboard/FlyerDesigner';
import SettingsPanel from '@/components/dashboard/SettingsPanel';
import { type FlyerState } from '@/components/dashboard/FlyerPreview';
import ConversiesPanel from '@/components/dashboard/ConversiesPanel';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import BillingOverview from '@/components/dashboard/BillingOverview';

// ─── Constants ────────────────────────────────────────────────────────────────

type Page = 'dashboard' | 'wizard' | 'flyer' | 'credits' | 'profiel' | 'conversies';

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
  aantalFlyers: 500, formaat: 'a6', dubbelzijdig: false, duurMaanden: 3,
  filterBouwjaarMin: 1900, filterBouwjaarMax: new Date().getFullYear(),
  filterWozMin: 0, filterWozMax: 2000000, filterEnergielabel: [],
  proefFlyer: false, proefAdres: '', email: '', pc4Lijst: [], pc4Add: '', flyerIndex: 0,
};

const NAV_ITEMS: { id: Page; label: string; icon: string; minTier?: Tier }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'wizard', label: 'Nieuwe campagne', icon: '+' },
  { id: 'flyer', label: 'Mijn flyer', icon: '◧' },
  { id: 'conversies', label: 'Conversies', icon: '◑' },
  { id: 'credits', label: 'Credits', icon: '◎' },
  { id: 'profiel', label: 'Mijn profiel', icon: '◉' },
];

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Overzicht', wizard: 'Nieuwe campagne', flyer: 'Flyer editor',
  conversies: 'Conversies & ROI', credits: 'Credits & abonnementen', profiel: 'Mijn profiel',
};

// ─── Main App ─────────────────────────────────────────────────────────────────

/** Root dashboard page -- orchestrates all panels via shared state. */
export default function LokaalKabaal(): React.JSX.Element {
  const router = useRouter();
  const [page, setPage] = useState<Page>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; naam: string; tier?: Tier; isJaarcontract?: boolean } | null>(null);
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
    } catch { /* ignore */ }
    return [{ ...INIT_FLYER, naam: 'Flyer 1', id: 1 }];
  });
  const [activeFlyerIdx, setActiveFlyerIdx] = useState(0);
  const [previewSide, setPreviewSide] = useState<'voor' | 'achter'>('voor');
  const [aiLoading, setAiLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMsg, setScanMsg] = useState('');

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
      let identified: { email: string; naam: string; tier?: Tier; isJaarcontract?: boolean } | null = null;
      try {
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (session.authenticated && session.email) {
            identified = { email: session.email, naam: '', tier: session.tier ?? undefined };
          }
        }
      } catch { /* fall through */ }
      if (!identified) {
        try {
          const raw = localStorage.getItem('lk_user');
          if (raw) identified = JSON.parse(raw);
        } catch { /* ignore */ }
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
        } catch { /* ignore */ }
        fetchCampaigns(identified.email);
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
        } catch { /* ignore */ }
      }
      setPage('dashboard');
      window.history.replaceState({}, '', '/app');
    } else if (params.get('payment') === 'cancelled') {
      setPage('dashboard');
      window.history.replaceState({}, '', '/app');
    }
  }, [fetchCampaigns]); // eslint-disable-line react-hooks/exhaustive-deps

  const uitloggen = async (): Promise<void> => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    localStorage.removeItem('lk_user');
    router.push('/login');
  };

  const startNieuweCampagne = () => {
    const activeCampaigns = campaigns.filter(c => c.status === 'actief').length;
    if (!canStartCampaign(userTier, activeCampaigns)) {
      const cfg = TIERS[userTier];
      showToast(`Je ${cfg.label}-abonnement staat max. ${cfg.maxCampaigns} gelijktijdige campagne${cfg.maxCampaigns !== 1 ? 's' : ''} toe. Upgrade naar Pro of Agency voor meer campagnes.`, 'warning');
      return;
    }
    setWiz(INIT_WIZ);
    setPage('wizard');
  };

  const updateFlyer = useCallback((patch: Partial<FlyerState>) => {
    setFlyers(fs => fs.map((f, i) => i === activeFlyerIdx ? { ...f, ...patch } : f));
  }, [activeFlyerIdx]);

  const runFlyerPipeline = useCallback(async (url: string) => {
    setScanLoading(true); setAiLoading(true); setScanMsg('Website ophalen en flyer genereren...');
    try {
      const res = await fetch('/api/flyer/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, branche: wiz.spec || 'Lokale retailer', bedrijfsnaam: flyer.bedrijfsnaam || '', telefoon: flyer.telefoon || '', email: flyer.email || '', website: flyer.website || url, slogan: flyer.slogan || '' }),
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
      if (data.tekst) updateFlyer({ tekst: data.tekst });
      if (data.usp) updateFlyer({ usp: data.usp });
    } catch (e) { /* log suppressed per standards */ void e; }
    finally { setAiLoading(false); }
  }, [wiz.spec, flyer.bedrijfsnaam, flyer.slogan, flyer.websiteUrl, runFlyerPipeline, updateFlyer]);

  // ── Shell render ──────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--paper)' }}>
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
              onStartCampaign={startNieuweCampagne}
              onEditFlyer={() => setPage('flyer')}
              onClearPendingCampaign={() => setPendingCampaign(null)}
              onToggleCampaignStatus={id => setCampaigns(prev => prev.map(x => x.id === id ? { ...x, status: x.status === 'actief' ? 'gepauzeerd' : 'actief' } : x))}
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
              isJaarcontract={!!user?.isJaarcontract}
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
            />
          )}
          {page === 'conversies' && (
            <ConversiesPanel
              campaigns={campaigns}
              userEmail={user?.email || ''}
              onStartCampagne={() => setPage('wizard')}
            />
          )}
          {page === 'credits' && (
            <BillingOverview />
          )}
          {page === 'profiel' && (
            <SettingsPanel
              email={user?.email || ''}
              tier={userTier}
              isJaarcontract={!!user?.isJaarcontract}
              onUpgrade={() => window.open('/#prijzen', '_blank')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
