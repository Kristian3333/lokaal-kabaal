'use client';

/**
 * /bedankt?session_id=... -- the landing page Stripe redirects to after
 * a successful checkout. Replaces the bare "/app?payment=success" path
 * that had no visible confirmation and made customers think the
 * payment had failed.
 *
 * Responsibilities:
 *  - Read the pending campaign + flyer from sessionStorage and POST to
 *    /api/campaigns so the order actually lands in the DB awaiting
 *    operator review.
 *  - Show an unmistakable success state with an explanation of what
 *    happens next (operator review within 24 h, email confirmation,
 *    print + dispatch on the 25th).
 *  - Provide a clear path back to the dashboard.
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PendingCampaign {
  spec: string;
  datum: string;
  centrum: string;
  aantalFlyers: number;
  formaat: string;
  dubbelzijdig: boolean;
}

type SaveState = 'saving' | 'saved' | 'no-pending' | 'failed';

function BedanktContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [state, setState] = useState<SaveState>('saving');
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    // React strict-mode double-invokes effects in dev; guard so we
    // don't POST to /api/campaigns twice for the same payment.
    if (ran.current) return;
    ran.current = true;

    const stored = sessionStorage.getItem('lk_pending_campaign');
    if (!stored) {
      // Customer hit /bedankt without going through the wizard this
      // session (refreshed the success URL, bookmarked it, etc.).
      // That's fine -- they paid, the Stripe webhook will sort
      // retailer status out; we just can't auto-create the campaign
      // from here.
      setState('no-pending');
      return;
    }

    let pc: PendingCampaign;
    try {
      pc = JSON.parse(stored) as PendingCampaign;
    } catch {
      setState('failed');
      setError('Ongeldige sessie-data. Neem contact op met support.');
      return;
    }

    const storedFlyer = sessionStorage.getItem('lk_pending_flyer');
    const flyerDesign = (() => {
      try { return storedFlyer ? JSON.parse(storedFlyer) : null; } catch { return null; }
    })();
    const userEmail = (() => {
      try { return JSON.parse(localStorage.getItem('lk_user') || '{}').email as string | undefined; } catch { return undefined; }
    })();

    fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        naam: `${pc.spec} campagne`,
        branche: pc.spec,
        centrum: pc.centrum,
        verwachtAantalPerMaand: pc.aantalFlyers,
        duurMaanden: 1,
        startMaand: pc.datum,
        formaat: pc.formaat,
        dubbelzijdig: pc.dubbelzijdig,
        stripeSessionId: sessionId,
        flyerDesign,
      }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || `HTTP ${r.status}`);
        }
        sessionStorage.removeItem('lk_pending_campaign');
        sessionStorage.removeItem('lk_pending_flyer');
        setState('saved');
      })
      .catch((err: Error) => {
        console.error('[bedankt] campaign save failed:', err);
        setError(err.message);
        setState('failed');
      });
  }, [sessionId]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--paper) 0%, #f0eee8 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'var(--font-sans)',
      color: 'var(--ink)',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: '8px',
        padding: '48px 40px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>
        {state === 'saving' && (
          <>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '8px' }}>Bestelling wordt vastgelegd...</h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>Even geduld -- we slaan je campagne op.</p>
          </>
        )}

        {(state === 'saved' || state === 'no-pending') && (
          <>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--green-bg)', color: 'var(--green-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: '32px', fontWeight: 700,
            }}>✓</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' }}>Betaling geslaagd</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 400, marginBottom: '14px', lineHeight: 1.2 }}>
              Bedankt voor je bestelling!
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--ink)', lineHeight: 1.7, marginBottom: '20px' }}>
              {state === 'saved'
                ? 'Je campagne staat klaar voor verwerking.'
                : 'Je betaling is ontvangen.'}
            </p>

            <div style={{ background: 'var(--paper2)', borderRadius: 'var(--radius)', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Wat gebeurt er nu?</div>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.7, color: 'var(--ink)' }}>
                <li style={{ marginBottom: '6px' }}><strong>Binnen 24 uur</strong> controleren wij je flyer en doelgebied handmatig.</li>
                <li style={{ marginBottom: '6px' }}>Na goedkeuring krijg je een <strong>bevestigingsmail</strong>.</li>
                <li>Op de <strong>25e van de maand</strong> drukken we de batch en bezorgen we via PostNL bij nieuwe bewoners.</li>
              </ol>
            </div>

            {sessionId && (
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '20px', wordBreak: 'break-all' }}>
                Sessie: {sessionId}
              </div>
            )}

            <Link
              href="/app"
              style={{
                display: 'inline-block', padding: '12px 28px',
                background: 'var(--ink)', color: '#fff', textDecoration: 'none',
                borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
              }}
            >
              Naar mijn dashboard &rarr;
            </Link>
          </>
        )}

        {state === 'failed' && (
          <>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--red-bg)', color: 'var(--red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: '32px', fontWeight: 700,
            }}>!</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '12px' }}>
              Bestelling ontvangen, maar opslaan mislukt
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '12px' }}>
              Je betaling is geslaagd. Het automatisch opslaan van de campagne
              gaf een fout: <code style={{ background: 'var(--red-bg)', padding: '2px 6px', borderRadius: '3px', color: 'var(--red)', fontSize: '12px' }}>{error}</code>
            </p>
            <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6, marginBottom: '24px' }}>
              Stuur de sessie-ID hieronder naar <a href="mailto:support@verbouwpro.nl" style={{ color: 'var(--green-dim)' }}>support@verbouwpro.nl</a>; wij regelen het binnen 24 uur.
            </p>
            {sessionId && (
              <div style={{ background: 'var(--paper2)', padding: '10px', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: '11px', wordBreak: 'break-all', marginBottom: '20px' }}>
                {sessionId}
              </div>
            )}
            <Link
              href="/app"
              style={{
                display: 'inline-block', padding: '10px 22px',
                background: 'var(--ink)', color: '#fff', textDecoration: 'none',
                borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Naar dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function BedanktPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--paper)' }} />}>
      <BedanktContent />
    </Suspense>
  );
}
