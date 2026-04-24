'use client';

/**
 * SettingsPanel -- account settings panel showing branding, pincode, and profile info.
 * Handles /api/branding and /api/pincode API calls internally.
 */

import { useState, useEffect } from 'react';
import { showToast } from '@/components/Toast';
import { TIERS, type Tier } from '@/lib/tiers';

interface SettingsPanelProps {
  /** Authenticated user email */
  email: string;
  /** User's subscription tier */
  tier: Tier;
  /** Whether the user is on a yearly contract */
  isJaarcontract?: boolean;
  /** Company name captured at signup */
  bedrijfsnaam?: string;
  /** Branche (sector) captured at signup */
  branche?: string;
  /** Callback to navigate to pricing/upgrade */
  onUpgrade: () => void;
}

/**
 * Account settings panel with branding configuration, pincode management, and profile info.
 */
export default function SettingsPanel({
  email,
  tier,
  isJaarcontract,
  bedrijfsnaam,
  branche,
  onUpgrade,
}: SettingsPanelProps): React.JSX.Element {
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [brandKleur, setBrandKleur] = useState('#00E87A');
  const [brandWelkomst, setBrandWelkomst] = useState('');
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandMsg, setBrandMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [winkelPin, setWinkelPin] = useState<string | null>(null);
  const [winkelPinInput, setWinkelPinInput] = useState('');
  const [winkelPinLoading, setWinkelPinLoading] = useState(false);
  const [winkelPinMsg, setWinkelPinMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password state
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Billing portal
  const [portalLoading, setPortalLoading] = useState(false);

  const cfg = TIERS[tier];

  // Load branding and pincode on mount
  useEffect(() => {
    fetch(`/api/branding?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => {
        setBrandLogoUrl(d.logoUrl ?? '');
        setBrandKleur(d.merkKleur ?? '#00E87A');
        setBrandWelkomst(d.welkomstTekst ?? '');
      })
      .catch(() => {});

    fetch(`/api/pincode?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => {
        setWinkelPin(d.pincode ?? null);
        setWinkelPinInput(d.pincode ?? '');
      })
      .catch(() => {});
  }, [email]);

  /** Save branding settings to the API. */
  const saveBranding = async (): Promise<void> => {
    setBrandLoading(true);
    setBrandMsg(null);
    try {
      const res = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, logoUrl: brandLogoUrl, merkKleur: brandKleur, welkomstTekst: brandWelkomst }),
      });
      const data = await res.json();
      setBrandMsg(res.ok ? { ok: true, text: 'Branding opgeslagen' } : { ok: false, text: data.error || 'Fout' });
      if (res.ok) showToast('Branding opgeslagen', 'success');
    } catch {
      setBrandMsg({ ok: false, text: 'Netwerkfout' });
      showToast('Opslaan mislukt', 'error');
    } finally {
      setBrandLoading(false);
    }
  };

  /** Save pincode to the API. */
  const savePin = async (): Promise<void> => {
    if (winkelPinInput.length < 4) return;
    setWinkelPinLoading(true);
    setWinkelPinMsg(null);
    try {
      const res = await fetch('/api/pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pincode: winkelPinInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setWinkelPin(winkelPinInput);
        setWinkelPinMsg({ ok: true, text: 'Pincode opgeslagen' });
      } else {
        setWinkelPinMsg({ ok: false, text: data.error || 'Fout bij opslaan' });
      }
    } catch {
      setWinkelPinMsg({ ok: false, text: 'Netwerkfout' });
    } finally {
      setWinkelPinLoading(false);
    }
  };

  /** Change password via API */
  const changePassword = async (): Promise<void> => {
    setPwMsg(null);
    if (!pwNew || pwNew.length < 8) {
      setPwMsg({ ok: false, text: 'Wachtwoord moet minimaal 8 tekens zijn' });
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwMsg({ ok: false, text: 'Wachtwoorden komen niet overeen' });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwCurrent || undefined, newPassword: pwNew }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ ok: true, text: 'Wachtwoord gewijzigd' });
        setPwCurrent('');
        setPwNew('');
        setPwConfirm('');
        showToast('Wachtwoord gewijzigd', 'success');
      } else {
        setPwMsg({ ok: false, text: data.error || 'Wijzigen mislukt' });
      }
    } catch {
      setPwMsg({ ok: false, text: 'Netwerkfout' });
    } finally {
      setPwLoading(false);
    }
  };

  /** Open Stripe billing portal */
  const openBillingPortal = async (): Promise<void> => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, '_blank');
      } else {
        showToast(data.error || 'Portaal openen mislukt', 'error');
      }
    } catch {
      showToast('Netwerkfout', 'error');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '4px' }}>Mijn profiel</h1>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Beheer je bedrijfsgegevens en instellingen</p>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{email}</div>
      </div>

      {/* Persoonlijke flyerhulp (Agency jaarcontract) */}
      {tier === 'agency' && isJaarcontract && (
        <div style={{ background: 'var(--ink)', border: '1px solid rgba(0,232,122,0.35)', borderRadius: 'var(--radius)', padding: '18px 22px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Persoonlijke flyerhulp · inbegrepen
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Onze designers maken jouw flyer
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, maxWidth: '480px' }}>
              Stuur je wensen, logo en lopende acties door -- wij leveren binnen 2 werkdagen een druk-klare flyer op maat.
            </div>
          </div>
          <a
            href={`mailto:Design@lokaalkabaal.agency?subject=Designaanvraag%20flyer${email ? `&body=Account%3A%20${encodeURIComponent(email)}` : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)' }}
          >
            Stuur designaanvraag →
          </a>
        </div>
      )}

      {/* Huidig pakket */}
      <div style={{ background: 'var(--white)', border: `1px solid ${cfg.color}40`, borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>Pakket: {cfg.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {cfg.maxCampaigns !== null ? `Max. ${cfg.maxCampaigns} campagne${cfg.maxCampaigns !== 1 ? 's' : ''}` : 'Onbeperkt campagnes'} &middot; &euro;{cfg.priceMonthly}/maand
              {isJaarcontract ? ' \u00B7 Jaarcontract (-25%)' : ' \u00B7 Maandelijks opzegbaar'}
            </div>
          </div>
        </div>
        {tier !== 'agency' && (
          <button
            onClick={onUpgrade}
            style={{ padding: '7px 16px', background: cfg.color, color: '#0A0A0A', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '12px', fontFamily: 'var(--font-mono)' }}
          >
            Upgraden &#8594;
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Bedrijfsgegevens -- pre-populated from signup */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Bedrijfsgegevens</div>
          {[
            { label: 'Bedrijfsnaam', ph: 'Jouw Bedrijf BV', prefill: bedrijfsnaam ?? '' },
            { label: 'Branche', ph: 'Kapper / Barbershop', prefill: branche ?? '' },
            { label: 'KVK-nummer', ph: '12345678', prefill: '' },
            { label: 'Adres', ph: 'Straatnaam 1', prefill: '' },
            { label: 'Postcode', ph: '1234 AB', prefill: '' },
            { label: 'Stad', ph: 'Amsterdam', prefill: '' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>{f.label.toUpperCase()}</label>
              <input defaultValue={f.prefill} placeholder={f.ph} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' as const }} />
            </div>
          ))}
          <button style={{ padding: '10px 20px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Opslaan</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Facturatie */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '4px' }}>Facturatie</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '16px' }}>
              Beheer je betaalmethode, factuurgegevens en bekijk eerdere facturen via het Stripe klantportaal.
            </div>
            <button
              onClick={openBillingPortal}
              disabled={portalLoading}
              style={{ padding: '10px 20px', background: portalLoading ? 'var(--muted)' : 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: portalLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: '13px' }}
            >
              {portalLoading ? 'Openen...' : 'Facturatie beheren'}
            </button>
          </div>

          {/* Wachtwoord */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Wachtwoord</div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>HUIDIG WACHTWOORD</label>
              <input type="password" value={pwCurrent} onChange={e => { setPwCurrent(e.target.value); setPwMsg(null); }} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>NIEUW WACHTWOORD</label>
              <input type="password" value={pwNew} onChange={e => { setPwNew(e.target.value); setPwMsg(null); }} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>BEVESTIG WACHTWOORD</label>
              <input type="password" value={pwConfirm} onChange={e => { setPwConfirm(e.target.value); setPwMsg(null); }} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' as const }} />
            </div>
            {pwMsg && <div style={{ fontSize: '12px', fontWeight: 600, color: pwMsg.ok ? '#00875A' : '#CC0000', marginBottom: '8px' }}>{pwMsg.text}</div>}
            <button onClick={changePassword} disabled={pwLoading} style={{ padding: '10px 20px', background: pwLoading ? 'var(--muted)' : 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: pwLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: '13px' }}>
              {pwLoading ? 'Bezig...' : 'Wachtwoord wijzigen'}
            </button>
          </div>
        </div>
      </div>

      {/* Winkelpincode */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '4px', color: 'var(--ink)' }}>Winkelpincode</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '12px' }}>
              Met deze pincode kunnen jouw medewerkers flyers verzilveren via de QR-code.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              {winkelPin ? 'Huidige pincode' : 'Nog niet ingesteld'}
            </div>
            {winkelPin && (
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '28px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--ink)', background: 'var(--paper2)', padding: '8px 20px', borderRadius: 'var(--radius)', border: '2px solid var(--green)' }}>
                {winkelPin}
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={6}
                value={winkelPinInput}
                onChange={e => { setWinkelPinInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6)); setWinkelPinMsg(null); }}
                onKeyDown={e => { if (e.key === 'Enter') savePin(); }}
                placeholder="0000"
                style={{ fontFamily: "'DM Mono', monospace", fontSize: '16px', fontWeight: 700, letterSpacing: '0.15em', textAlign: 'center', width: '100px', padding: '8px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)' }}
              />
              <button
                onClick={savePin}
                disabled={winkelPinLoading || winkelPinInput.length < 4}
                style={{ padding: '8px 16px', background: winkelPinLoading ? 'var(--muted)' : 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: winkelPinLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: '13px', opacity: winkelPinInput.length < 4 ? 0.4 : 1 }}
              >
                {winkelPin ? 'Wijzigen' : 'Instellen'}
              </button>
            </div>
            {winkelPinMsg && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: winkelPinMsg.ok ? '#00875A' : '#CC0000' }}>
                {winkelPinMsg.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Landingspagina branding -- in development, niet zichtbaar voor klanten */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 24px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink)' }}>Landingspagina branding</div>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b8860b', background: 'rgba(255,200,0,0.12)', border: '1px solid rgba(255,200,0,0.35)', borderRadius: '3px', padding: '2px 8px' }}>
            Binnenkort
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '14px' }}>
          Pas de pagina aan die klanten zien wanneer ze de QR-code scannen. We zijn deze feature aan het herontwerpen; je instellingen worden alvast opgeslagen voor wanneer de landingspagina live gaat.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>LOGO URL</label>
            <input
              value={brandLogoUrl}
              onChange={e => { setBrandLogoUrl(e.target.value); setBrandMsg(null); }}
              placeholder="https://jouwsite.nl/logo.png"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', fontSize: '13px', boxSizing: 'border-box' as const }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>MERKKLEUR</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={brandKleur}
                onChange={e => { setBrandKleur(e.target.value); setBrandMsg(null); }}
                style={{ width: '40px', height: '34px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', padding: '2px' }}
              />
              <input
                value={brandKleur}
                onChange={e => { setBrandKleur(e.target.value); setBrandMsg(null); }}
                placeholder="#00E87A"
                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', fontSize: '13px', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' as const }}
              />
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>WELKOMSTTEKST (optioneel)</label>
            <textarea
              value={brandWelkomst}
              onChange={e => { setBrandWelkomst(e.target.value); setBrandMsg(null); }}
              placeholder="Welkom in de buurt! Kom langs voor 10% korting op je eerste behandeling."
              rows={2}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' as const }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
          <button
            onClick={saveBranding}
            disabled={brandLoading}
            style={{ padding: '10px 20px', background: brandLoading ? 'var(--muted)' : 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: brandLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: '13px' }}
          >
            Opslaan
          </button>
          {brandMsg && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: brandMsg.ok ? '#00875A' : '#CC0000' }}>
              {brandMsg.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
