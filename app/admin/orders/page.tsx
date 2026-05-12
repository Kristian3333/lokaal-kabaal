'use client';

/**
 * /admin/orders -- operator review queue.
 *
 * Lists campaigns awaiting manual approval (the default tab) plus
 * recently approved/rejected ones for audit. Clicking a row drills
 * into /admin/orders/[id] for the full record + approve/reject form.
 *
 * Auth: server-side via requireAdmin() on /api/admin/orders. This
 * client page just fetches; the fetch fails closed with 401/403 for
 * anyone not on the ADMIN_EMAILS allowlist.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminOrder {
  id: string;
  naam: string;
  branche: string;
  status: string;
  awaitingReview: boolean;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  centrum: string;
  straalKm: string;
  formaat: string;
  dubbelzijdig: boolean;
  verwachtAantalPerMaand: number;
  duurMaanden: number;
  startMaand: string;
  eindMaand: string;
  createdAt: string;
  retailerEmail: string | null;
  retailerNaam: string | null;
  retailerTier: string | null;
}

type Tab = 'pending' | 'approved' | 'all';

export default function AdminOrdersPage(): React.JSX.Element {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('pending');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/orders?status=${tab}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        if (res.status === 403) {
          setError('Geen admin-toegang. Vraag een operator je e-mailadres toe te voegen aan ADMIN_EMAILS.');
          return null;
        }
        if (!res.ok) {
          setError(`Fout: ${res.status}`);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        setOrders(data.orders as AdminOrder[]);
      })
      .catch(() => { if (!cancelled) setError('Netwerkfout'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, router]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>
      <header style={{ padding: '16px 32px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>LokaalKabaal &middot; Operator</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, margin: 0 }}>Bestellingen</h1>
        </div>
        <Link href="/app" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textDecoration: 'none' }}>
          &larr; Naar dashboard
        </Link>
      </header>

      <main style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--paper2)', padding: '4px', borderRadius: 'var(--radius)', maxWidth: '420px' }}>
          {(['pending', 'approved', 'all'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '7px 10px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                background: tab === t ? 'var(--ink)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--muted)',
                borderRadius: 'var(--radius)',
              }}
            >
              {t === 'pending' && 'Te beoordelen'}
              {t === 'approved' && 'Goedgekeurd'}
              {t === 'all' && 'Alles'}
            </button>
          ))}
        </div>

        {loading && <div style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Laden...</div>}
        {error && <div style={{ fontSize: '13px', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '13px', background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
            {tab === 'pending'
              ? 'Geen bestellingen in afwachting. Goed gewerkt.'
              : 'Geen bestellingen gevonden voor dit filter.'}
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px', padding: '10px 14px', background: 'var(--paper2)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, borderBottom: '1px solid var(--line)' }}>
              <div>Bedrijf / contact</div>
              <div>Branche &middot; werkgebied</div>
              <div>Formaat</div>
              <div>Aantal/mnd</div>
              <div>Looptijd</div>
              <div>Aangemaakt</div>
              <div style={{ textAlign: 'right' }}>Status</div>
            </div>
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px', padding: '12px 14px', borderBottom: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink)', textDecoration: 'none' }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{o.retailerNaam || '—'}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{o.retailerEmail || '—'}</div>
                </div>
                <div>
                  <div>{o.branche}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{o.centrum} &middot; {o.straalKm} km</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{o.formaat}{o.dubbelzijdig ? ' 2-zijdig' : ''}</div>
                <div style={{ fontFamily: 'var(--font-mono)' }}>{o.verwachtAantalPerMaand}</div>
                <div style={{ fontFamily: 'var(--font-mono)' }}>{o.duurMaanden} mnd</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>{new Date(o.createdAt).toLocaleDateString('nl-NL')}</div>
                <div style={{ textAlign: 'right' }}>
                  {o.awaitingReview ? (
                    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#b45309', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Review</span>
                  ) : o.status === 'geannuleerd' ? (
                    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: '12px', background: 'var(--red-bg)', color: 'var(--red)', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Afgewezen</span>
                  ) : (
                    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: '12px', background: 'var(--green-bg)', color: 'var(--green-dim)', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Goed</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
