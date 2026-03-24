'use client';

import { useState, useEffect } from 'react';
import { type Campaign } from '@/components/dashboard/CampaignDashboard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvResult {
  code: string;
  adres: string;
  postcode: string;
  stad: string;
  verzondenOp: string;
  interesseOp: string | null;
  conversieOp: string | null;
  geldigTot: string;
}

interface ConvData {
  stats: {
    totaal: number;
    interesse: number;
    conversies: number;
    verlopen: number;
    openstaand: number;
    conversieRatio: number;
    interesseConversieRatio: number;
  };
  results: ConvResult[];
}

interface ConversiesPanelProps {
  campaigns: Campaign[];
  userEmail: string;
  onStartCampagne: () => void;
}

/**
 * Conversies & ROI panel -- shows per-campaign funnel stats, code redemption form,
 * codes export, and branding settings for the QR landing page.
 */
export default function ConversiesPanel({ campaigns, userEmail, onStartCampagne }: ConversiesPanelProps): React.JSX.Element {
  const [convData, setConvData] = useState<ConvData | null>(null);
  const [convLoading, setConvLoading] = useState(false);
  const [convError, setConvError] = useState('');
  const [selectedCampagne, setSelectedCampagne] = useState<string>('');
  const [verzilverCode, setVerzilverCode] = useState('');
  const [verzilverLoading, setVerzilverLoading] = useState(false);
  const [verzilverResult, setVerzilverResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [winkelPin, setWinkelPin] = useState<string | null>(null);
  const [winkelPinInput, setWinkelPinInput] = useState('');
  const [winkelPinLoading, setWinkelPinLoading] = useState(false);
  const [winkelPinMsg, setWinkelPinMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [brandKleur, setBrandKleur] = useState('#00E87A');
  const [brandWelkomst, setBrandWelkomst] = useState('');
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandMsg, setBrandMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const activeCampagnes = campaigns.filter(c => c.status !== 'geannuleerd');

  // Fetch pincode and branding on mount when email is available
  useEffect(() => {
    if (!userEmail) return;
    fetch(`/api/pincode?email=${encodeURIComponent(userEmail)}`)
      .then(r => r.json())
      .then(d => { setWinkelPin(d.pincode ?? null); setWinkelPinInput(d.pincode ?? ''); })
      .catch(() => {});
    fetch(`/api/branding?email=${encodeURIComponent(userEmail)}`)
      .then(r => r.json())
      .then(d => { setBrandLogoUrl(d.logoUrl ?? ''); setBrandKleur(d.merkKleur ?? '#00E87A'); setBrandWelkomst(d.welkomstTekst ?? ''); })
      .catch(() => {});
  }, [userEmail]);

  const loadConversies = (id: string) => {
    if (!id) return;
    setConvLoading(true);
    setConvError('');
    fetch(`/api/conversies?campagneId=${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setConvData(d); })
      .catch(e => setConvError(e.message || 'Fout bij laden'))
      .finally(() => setConvLoading(false));
  };

  useEffect(() => {
    const id = selectedCampagne || activeCampagnes[0]?.id?.toString();
    if (id) loadConversies(id);
  }, [selectedCampagne]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerzilver = async () => {
    const code = verzilverCode.toUpperCase().trim();
    if (code.length < 6) { setVerzilverResult({ ok: false, message: 'Voer een geldige code in (minimaal 6 tekens)' }); return; }
    setVerzilverLoading(true);
    setVerzilverResult(null);
    try {
      const res = await fetch(`/api/verify/${code}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      if (res.ok && data.status === 'conversie') {
        setVerzilverResult({ ok: true, message: `Conversie geregistreerd -- ${data.adres}` });
        setVerzilverCode('');
        const id = selectedCampagne || activeCampagnes[0]?.id?.toString();
        if (id) loadConversies(id);
      } else {
        setVerzilverResult({ ok: false, message: data.message || 'Onbekende fout' });
      }
    } catch { setVerzilverResult({ ok: false, message: 'Netwerkfout -- probeer opnieuw' }); }
    finally { setVerzilverLoading(false); }
  };

  const savePin = async () => {
    if (!userEmail || winkelPinInput.length < 4) return;
    setWinkelPinLoading(true);
    setWinkelPinMsg(null);
    try {
      const res = await fetch('/api/pincode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: userEmail, pincode: winkelPinInput }) });
      const data = await res.json();
      if (res.ok) { setWinkelPin(winkelPinInput); setWinkelPinMsg({ ok: true, text: 'Pincode opgeslagen' }); }
      else { setWinkelPinMsg({ ok: false, text: data.error || 'Fout bij opslaan' }); }
    } catch { setWinkelPinMsg({ ok: false, text: 'Netwerkfout' }); }
    finally { setWinkelPinLoading(false); }
  };

  const saveBranding = async () => {
    if (!userEmail) return;
    setBrandLoading(true);
    setBrandMsg(null);
    try {
      const res = await fetch('/api/branding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: userEmail, logoUrl: brandLogoUrl, merkKleur: brandKleur, welkomstTekst: brandWelkomst }) });
      const data = await res.json();
      setBrandMsg(res.ok ? { ok: true, text: 'Branding opgeslagen' } : { ok: false, text: data.error || 'Fout' });
    } catch { setBrandMsg({ ok: false, text: 'Netwerkfout' }); }
    finally { setBrandLoading(false); }
  };

  if (!activeCampagnes.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>◑</div>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--ink)' }}>Geen campagnes gevonden</div>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>Start eerst een campagne om conversiedata te zien.</div>
        <button onClick={onStartCampagne} style={{ background: 'var(--green)', color: 'white', border: 'none', borderRadius: 'var(--radius)', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Nieuwe campagne starten
        </button>
      </div>
    );
  }

  const currentId = selectedCampagne || activeCampagnes[0]?.id?.toString() || '';
  const stats = convData?.stats;

  return (
    <div>
      {/* Code redemption */}
      <div style={{ background: 'var(--white)', border: '2px solid var(--green)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '4px' }}>Code verzilveren</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>Klant op bezoek? Voer de 8-letterige code van de flyer in om de conversie te registreren.</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text" value={verzilverCode}
            onChange={e => { setVerzilverCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)); setVerzilverResult(null); }}
            onKeyDown={e => { if (e.key === 'Enter' && verzilverCode.length >= 6) handleVerzilver(); }}
            placeholder="ABCD1234" maxLength={8}
            style={{ fontFamily: "'SF Mono', monospace", fontSize: '20px', letterSpacing: '0.15em', fontWeight: 700, padding: '10px 16px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', width: '200px', textAlign: 'center', textTransform: 'uppercase' }}
          />
          <button onClick={handleVerzilver} disabled={verzilverLoading || verzilverCode.length < 6}
            style={{ padding: '12px 24px', background: verzilverLoading ? 'var(--muted)' : 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: verzilverLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: '14px', opacity: verzilverCode.length < 6 ? 0.4 : 1 }}>
            {verzilverLoading ? 'Bezig...' : 'Verzilveren'}
          </button>
        </div>
        {verzilverResult && (
          <div style={{ marginTop: '10px', padding: '8px 14px', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 600, background: verzilverResult.ok ? '#E8FFF4' : '#FFF2F2', color: verzilverResult.ok ? '#00875A' : '#CC0000', border: `1px solid ${verzilverResult.ok ? '#B8F0D5' : '#FFD0D0'}` }}>
            {verzilverResult.ok ? 'v ' : ''}{verzilverResult.message}
          </div>
        )}
      </div>

      {/* Campaign selector */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Campagne</label>
        <select value={currentId} onChange={e => setSelectedCampagne(e.target.value)}
          style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: '14px', background: 'var(--paper)', color: 'var(--ink)', cursor: 'pointer' }}>
          {activeCampagnes.map(c => (
            <option key={c.id} value={c.id.toString()}>
              {c.centrum} -- {new Date(c.datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Funnel stats */}
      {stats && !convLoading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Verstuurd', val: stats.totaal, color: 'var(--ink)' },
              { label: 'Interesse', val: stats.interesse, color: '#3b82f6' },
              { label: 'Conversies', val: stats.conversies, color: 'var(--green)' },
              { label: 'Verlopen', val: stats.verlopen, color: '#CC7700' },
              { label: 'Open', val: stats.openstaand, color: 'var(--muted)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: s.color, marginBottom: '2px' }}>{s.val}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Conversieratio</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-serif)' }}>{stats.conversieRatio}%</span>
            </div>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Interesse → conversie</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6', fontFamily: 'var(--font-serif)' }}>{stats.interesseConversieRatio}%</span>
            </div>
          </div>
        </>
      )}

      {convLoading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '14px' }}>Laden...</div>}
      {convError && <div style={{ background: '#FFF2F2', border: '1px solid #FFD0D0', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '13px', color: '#CC0000', marginBottom: '16px' }}>{convError}</div>}

      {/* Results table */}
      {convData && !convLoading && convData.results.length > 0 && (
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                {['Code', 'Adres', 'Status', 'Interesse', 'Conversie', 'Geldig tot'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {convData.results.map((r, i) => {
                const expired = new Date() > new Date(r.geldigTot);
                const statusLabel = r.conversieOp ? 'Conversie' : r.interesseOp ? 'Interesse' : expired ? 'Verlopen' : 'Verstuurd';
                const statusBg = r.conversieOp ? '#E8FFF4' : r.interesseOp ? '#EFF6FF' : expired ? '#FFF3E0' : '#F0F0F0';
                const statusColor = r.conversieOp ? '#00875A' : r.interesseOp ? '#2563eb' : expired ? '#CC7700' : '#666';
                return (
                  <tr key={r.code} style={{ borderBottom: i < convData.results.length - 1 ? '1px solid var(--line)' : 'none', background: i % 2 === 0 ? 'white' : 'var(--paper)' }}>
                    <td style={{ padding: '10px 14px', fontFamily: "'SF Mono', monospace", fontSize: '12px', letterSpacing: '0.05em' }}>{r.code}</td>
                    <td style={{ padding: '10px 14px' }}>{r.adres}, {r.postcode}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: statusBg, color: statusColor }}>{statusLabel}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>
                      {r.interesseOp ? new Date(r.interesseOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : '-'}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: r.conversieOp ? '#00875A' : 'var(--muted)' }}>
                      {r.conversieOp ? new Date(r.conversieOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : '-'}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: expired ? '#CC7700' : 'var(--muted)' }}>
                      {new Date(r.geldigTot).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {convData && !convLoading && convData.results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>Nog geen flyers verstuurd voor deze campagne.</div>
      )}

      {/* Winkelpincode */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '4px' }}>Winkelpincode</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '12px' }}>
          Met deze pincode kunnen jouw medewerkers flyers verzilveren door de QR-code te scannen.
        </div>
        {winkelPin && (
          <div style={{ fontFamily: "'SF Mono', monospace", fontSize: '28px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--ink)', background: 'var(--paper2)', padding: '8px 20px', borderRadius: 'var(--radius)', border: '2px solid var(--green)', display: 'inline-block', marginBottom: '12px' }}>
            {winkelPin}
          </div>
        )}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input type="tel" inputMode="numeric" maxLength={6} value={winkelPinInput}
            onChange={e => { setWinkelPinInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6)); setWinkelPinMsg(null); }}
            onKeyDown={e => { if (e.key === 'Enter') savePin(); }}
            placeholder="0000"
            style={{ fontFamily: "'SF Mono', monospace", fontSize: '16px', fontWeight: 700, letterSpacing: '0.15em', textAlign: 'center', width: '100px', padding: '8px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)' }}
          />
          <button onClick={savePin} disabled={winkelPinLoading || winkelPinInput.length < 4}
            style={{ padding: '8px 16px', background: winkelPinLoading ? 'var(--muted)' : 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: winkelPinLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: '13px', opacity: winkelPinInput.length < 4 ? 0.4 : 1 }}>
            {winkelPin ? 'Wijzigen' : 'Instellen'}
          </button>
        </div>
        {winkelPinMsg && <div style={{ fontSize: '12px', fontWeight: 600, color: winkelPinMsg.ok ? '#00875A' : '#CC0000', marginTop: '8px' }}>{winkelPinMsg.text}</div>}
      </div>

      {/* Codes exporteren */}
      {campaigns.filter(c => c.status !== 'geannuleerd').length > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '4px' }}>Codes exporteren</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '14px' }}>Download de kortingscodes als CSV om ze te importeren in je webshop.</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {campaigns.filter(c => c.status !== 'geannuleerd').map(c => (
              <button key={c.id} onClick={() => window.open(`/api/codes/export?campagneId=${c.id}&format=csv`, '_blank')}
                style={{ padding: '8px 16px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 600 }}>
                {c.centrum} -- CSV
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Landingspagina branding */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '4px' }}>Landingspagina branding</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '14px' }}>Pas de pagina aan die klanten zien wanneer ze de QR-code scannen.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>LOGO URL</label>
            <input value={brandLogoUrl} onChange={e => { setBrandLogoUrl(e.target.value); setBrandMsg(null); }} placeholder="https://jouwsite.nl/logo.png"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>MERKKLEUR</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={brandKleur} onChange={e => { setBrandKleur(e.target.value); setBrandMsg(null); }}
                style={{ width: '40px', height: '34px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', padding: '2px' }} />
              <input value={brandKleur} onChange={e => { setBrandKleur(e.target.value); setBrandMsg(null); }} placeholder="#FF6B00"
                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', fontSize: '13px', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>WELKOMSTTEKST (optioneel)</label>
            <textarea value={brandWelkomst} onChange={e => { setBrandWelkomst(e.target.value); setBrandMsg(null); }}
              placeholder="Welkom in de buurt! Kom langs voor 10% korting op je eerste behandeling." rows={2}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
          <button onClick={saveBranding} disabled={brandLoading}
            style={{ padding: '10px 20px', background: brandLoading ? 'var(--muted)' : 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: brandLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: '13px' }}>
            Opslaan
          </button>
          {brandMsg && <span style={{ fontSize: '12px', fontWeight: 600, color: brandMsg.ok ? '#00875A' : '#CC0000' }}>{brandMsg.text}</span>}
        </div>
      </div>

      {/* Info box */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px 20px', fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--ink)' }}>Hoe werkt het?</strong><br />
        1. De consument ontvangt een flyer met QR-code en scant deze → interesse geregistreerd.<br />
        2. Bij bezoek aan jouw bedrijf voer je de 8-letterige code hierboven in → conversie geregistreerd.<br />
        Codes zijn eenmalig inwisselbaar en 30 dagen geldig na verzending.
      </div>
    </div>
  );
}
