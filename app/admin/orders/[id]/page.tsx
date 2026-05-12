'use client';

/**
 * /admin/orders/[id] -- single-order operator review screen.
 *
 * Shows everything the operator needs to verify before authorising the
 * Altum AI address pull and Print.one print order: customer identity,
 * campaign parameters, target area, flyer-specific settings. Approve
 * clears awaitingReview so the next dispatch cron picks it up. Reject
 * marks the campaign cancelled with a stored reason.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface CampaignRecord {
  id: string;
  retailerId: string;
  naam: string;
  branche: string;
  status: string;
  awaitingReview: boolean;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  centrum: string;
  straalKm: string;
  pc4Lijst: string | null;
  formaat: string;
  dubbelzijdig: boolean;
  flyerTemplateId: string | null;
  verwachtAantalPerMaand: number;
  duurMaanden: number;
  startMaand: string;
  eindMaand: string;
  filterBouwjaarMin: number | null;
  filterBouwjaarMax: number | null;
  filterWozMin: number | null;
  filterWozMax: number | null;
  filterEnergielabel: string | null;
  stripeSubscriptionItemId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RetailerRecord {
  id: string;
  email: string;
  bedrijfsnaam: string | null;
  branche: string | null;
  tier: string;
  subscriptionStatus: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  isJaarcontract: boolean;
}

interface OrderResponse {
  campaign: CampaignRecord;
  retailer: RetailerRecord | null;
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontFamily: 'var(--font-mono)',
  color: 'var(--muted)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '4px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
};

function Field({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value ?? '—'}</div>
    </div>
  );
}

export default function AdminOrderDetailPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionResult, setActionResult] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/orders/${id}`)
      .then(async (res) => {
        if (res.status === 401) { router.push('/login'); return null; }
        if (res.status === 403) { setError('Geen admin-toegang.'); return null; }
        if (res.status === 404) { setError('Bestelling niet gevonden.'); return null; }
        if (!res.ok) { setError(`Fout: ${res.status}`); return null; }
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        setOrder(data as OrderResponse);
      })
      .catch(() => { if (!cancelled) setError('Netwerkfout'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, router]);

  async function handleApprove(): Promise<void> {
    if (!order) return;
    setActing(true);
    setActionResult(null);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes || undefined }),
      });
      if (res.ok) {
        setActionResult('Goedgekeurd. De dispatch-cron pakt deze campagne op de eerstvolgende run op.');
        const next = await fetch(`/api/admin/orders/${id}`);
        if (next.ok) setOrder(await next.json());
      } else {
        const body = await res.json().catch(() => ({}));
        setActionResult(`Mislukt: ${(body as { error?: string }).error ?? res.status}`);
      }
    } catch {
      setActionResult('Mislukt: netwerkfout.');
    } finally {
      setActing(false);
    }
  }

  async function handleReject(): Promise<void> {
    if (!order) return;
    if (!rejectReason.trim()) {
      setActionResult('Geef eerst een reden voor afwijzing op.');
      return;
    }
    setActing(true);
    setActionResult(null);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (res.ok) {
        setActionResult('Afgewezen en gemarkeerd als geannuleerd.');
        const next = await fetch(`/api/admin/orders/${id}`);
        if (next.ok) setOrder(await next.json());
        setShowReject(false);
      } else {
        const body = await res.json().catch(() => ({}));
        setActionResult(`Mislukt: ${(body as { error?: string }).error ?? res.status}`);
      }
    } catch {
      setActionResult('Mislukt: netwerkfout.');
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '40px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Laden...</div>;
  }
  if (error || !order) {
    return (
      <div style={{ padding: '40px', fontFamily: 'var(--font-sans)' }}>
        <p style={{ color: 'var(--red)', fontSize: '14px', marginBottom: '12px' }}>{error || 'Geen bestelling gevonden'}</p>
        <Link href="/admin/orders" style={{ fontSize: '12px', color: 'var(--ink)' }}>&larr; Terug naar overzicht</Link>
      </div>
    );
  }

  const { campaign: c, retailer: r } = order;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>
      <header style={{ padding: '16px 32px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <div>
          <Link href="/admin/orders" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textDecoration: 'none' }}>&larr; Overzicht</Link>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, margin: '4px 0 0' }}>{c.naam}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          {c.awaitingReview ? (
            <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', color: '#b45309', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Wacht op review</span>
          ) : c.status === 'geannuleerd' ? (
            <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: '14px', background: 'var(--red-bg)', color: 'var(--red)', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Afgewezen</span>
          ) : (
            <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: '14px', background: 'var(--green-bg)', color: 'var(--green-dim)', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Goedgekeurd</span>
          )}
        </div>
      </header>

      <main style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>Klant</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Bedrijfsnaam" value={r?.bedrijfsnaam} />
              <Field label="E-mail" value={r?.email} />
              <Field label="Branche" value={r?.branche} />
              <Field label="Tier" value={<span style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{r?.tier ?? '—'}{r?.isJaarcontract ? ' (jaar)' : ''}</span>} />
              <Field label="Subscription" value={r?.subscriptionStatus} />
              <Field label="Stripe customer" value={r?.stripeCustomerId ? <code style={{ fontSize: '11px' }}>{r.stripeCustomerId}</code> : '—'} />
            </div>
          </section>

          <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>Campagne</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Branche" value={c.branche} />
              <Field label="Status" value={c.status} />
              <Field label="Aantal/maand" value={c.verwachtAantalPerMaand} />
              <Field label="Looptijd" value={`${c.duurMaanden} maanden`} />
              <Field label="Startmaand" value={c.startMaand} />
              <Field label="Eindmaand" value={c.eindMaand} />
              <Field label="Formaat" value={<span style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{c.formaat}</span>} />
              <Field label="Dubbelzijdig" value={c.dubbelzijdig ? 'Ja' : 'Nee'} />
              <Field label="Aangemaakt" value={new Date(c.createdAt).toLocaleString('nl-NL')} />
              <Field label="Campagne ID" value={<code style={{ fontSize: '10px', wordBreak: 'break-all' }}>{c.id}</code>} />
            </div>
          </section>

          <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>Werkgebied</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Centrum" value={c.centrum} />
              <Field label="Straal" value={`${c.straalKm} km`} />
            </div>
            {c.pc4Lijst && (
              <div style={{ marginTop: '14px' }}>
                <div style={labelStyle}>Postcodes ({c.pc4Lijst.split(',').filter(Boolean).length})</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'var(--paper2)', padding: '10px', borderRadius: 'var(--radius)', wordBreak: 'break-word' }}>{c.pc4Lijst}</div>
              </div>
            )}
          </section>

          {(c.filterBouwjaarMin || c.filterBouwjaarMax || c.filterWozMin || c.filterWozMax || c.filterEnergielabel) && (
            <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>Targeting-filters</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="Bouwjaar" value={`${c.filterBouwjaarMin ?? '—'} t/m ${c.filterBouwjaarMax ?? '—'}`} />
                <Field label="WOZ" value={`€${c.filterWozMin ?? 0} t/m €${c.filterWozMax ?? '—'}`} />
                <Field label="Energielabel" value={c.filterEnergielabel} />
              </div>
            </section>
          )}

          {(c.reviewedAt || c.rejectionReason) && (
            <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>Review-historie</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="Beoordeeld op" value={c.reviewedAt ? new Date(c.reviewedAt).toLocaleString('nl-NL') : '—'} />
                <Field label="Beoordeeld door" value={c.reviewedBy} />
              </div>
              {c.reviewNotes && (
                <div style={{ marginTop: '12px' }}>
                  <div style={labelStyle}>Notities</div>
                  <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{c.reviewNotes}</div>
                </div>
              )}
              {c.rejectionReason && (
                <div style={{ marginTop: '12px' }}>
                  <div style={labelStyle}>Reden afwijzing</div>
                  <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--red)' }}>{c.rejectionReason}</div>
                </div>
              )}
            </section>
          )}
        </div>

        <aside style={{ position: 'sticky', top: '24px', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {c.awaitingReview ? (
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>Acties</h2>

              {!showReject ? (
                <>
                  <label style={{ ...labelStyle, marginBottom: '6px', display: 'block' }} htmlFor="approve-notes">Notities (optioneel)</label>
                  <textarea
                    id="approve-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="bv. handmatig adressen verzonden, of bijzonderheden"
                    style={{ width: '100%', padding: '8px', fontSize: '12px', fontFamily: 'var(--font-sans)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxSizing: 'border-box', marginBottom: '12px', resize: 'vertical' }}
                  />
                  <button
                    onClick={handleApprove}
                    disabled={acting}
                    style={{ width: '100%', padding: '10px', background: acting ? 'var(--line2)' : 'var(--green-dim)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', cursor: acting ? 'not-allowed' : 'pointer', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}
                  >
                    {acting ? 'Bezig...' : 'Goedkeuren & vrijgeven'}
                  </button>
                  <button
                    onClick={() => setShowReject(true)}
                    disabled={acting}
                    style={{ width: '100%', padding: '8px', background: 'transparent', color: 'var(--red)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                  >
                    Afwijzen
                  </button>
                </>
              ) : (
                <>
                  <label style={{ ...labelStyle, marginBottom: '6px', display: 'block' }} htmlFor="reject-reason">Reden afwijzing</label>
                  <textarea
                    id="reject-reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    placeholder="Bv. ontwerp voldoet niet aan Print.one specs, dubbele aanvraag, etc."
                    style={{ width: '100%', padding: '8px', fontSize: '12px', fontFamily: 'var(--font-sans)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxSizing: 'border-box', marginBottom: '12px', resize: 'vertical' }}
                  />
                  <button
                    onClick={handleReject}
                    disabled={acting}
                    style={{ width: '100%', padding: '10px', background: acting ? 'var(--line2)' : 'var(--red)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', cursor: acting ? 'not-allowed' : 'pointer', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}
                  >
                    {acting ? 'Bezig...' : 'Bevestig afwijzing'}
                  </button>
                  <button
                    onClick={() => setShowReject(false)}
                    style={{ width: '100%', padding: '8px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                  >
                    Terug
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px', fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {c.status === 'geannuleerd'
                ? 'Bestelling is afgewezen.'
                : 'Bestelling is goedgekeurd. De dispatch-cron pakt hem op de eerstvolgende run op.'}
            </div>
          )}

          {actionResult && (
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '12px', fontSize: '12px', lineHeight: 1.5 }}>
              {actionResult}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
