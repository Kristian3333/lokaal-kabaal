'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TEST_ACCOUNTS } from '../../lib/tiers';
import { BRANCHE_OPTIES } from '@/lib/branches';

type TabMode = 'login' | 'register' | 'magic';

const tierColors: Record<string, string> = {
  starter: '#94a3b8',
  pro:     '#60a5fa',
  agency:  '#00E87A',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)', fontSize: '13px',
  outline: 'none', fontFamily: 'var(--font-mono)',
  background: '#fff', color: 'var(--ink)',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 600, color: 'var(--muted)',
  letterSpacing: '.09em', textTransform: 'uppercase',
  fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '5px',
};

/** Inner component that may use useSearchParams -- must be wrapped in Suspense */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<TabMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bedrijfsnaam, setBedrijfsnaam] = useState('');
  const [branche, setBranche] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Show token error messages from magic link redirects
  useEffect(() => {
    const tokenError = searchParams.get('error');
    if (tokenError === 'token_expired') {
      setError('De inloglink is verlopen. Vraag een nieuwe link aan.');
      setTab('magic');
    } else if (tokenError === 'invalid_token') {
      setError('Ongeldige inloglink. Vraag een nieuwe link aan.');
      setTab('magic');
    }
  }, [searchParams]);

  /** Redirect to /app if already authenticated */
  useEffect(() => {
    async function checkSession(): Promise<void> {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json() as { authenticated: boolean };
        if (data.authenticated) {
          router.push('/app');
        }
      } catch {
        // Session check failed -- stay on login page
      }
    }
    void checkSession();
  }, [router]);

  /**
   * POST /api/auth/login and store user data in localStorage for dashboard compat.
   */
  async function handleLogin(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email) { setError('Vul je e-mailadres in.'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json() as {
          id: string;
          email: string;
          tier: string;
          bedrijfsnaam: string;
        };
        localStorage.setItem('lk_user', JSON.stringify({
          email: data.email,
          naam: data.bedrijfsnaam || data.email.split('@')[0],
          tier: data.tier,
          isJaarcontract: false,
        }));
        router.push('/app');
        return;
      }

      if (res.status === 401 || res.status === 404) {
        setError('Onjuist e-mailadres of wachtwoord');
      } else {
        const body = await res.json() as { error?: string };
        setError(body.error || 'Inloggen mislukt, probeer opnieuw');
      }
    } catch {
      setError('Inloggen mislukt, probeer opnieuw');
    } finally {
      setLoading(false);
    }
  }

  /**
   * POST /api/auth/register and redirect to /app on success.
   */
  async function handleRegister(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email || !password || !bedrijfsnaam || !branche) {
      setError('Vul alle velden in.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, bedrijfsnaam, branche }),
      });

      if (res.ok) {
        const data = await res.json() as {
          id: string;
          email: string;
          tier: string;
          bedrijfsnaam: string;
        };
        localStorage.setItem('lk_user', JSON.stringify({
          email: data.email,
          naam: data.bedrijfsnaam,
          tier: data.tier,
          branche,
          isJaarcontract: false,
        }));
        router.push('/app');
        return;
      }

      const body = await res.json() as { error?: string };
      setError(body.error || 'Registratie mislukt, probeer opnieuw');
    } catch {
      setError('Registratie mislukt, probeer opnieuw');
    } finally {
      setLoading(false);
    }
  }

  /**
   * POST /api/auth/magic-link and show confirmation.
   */
  async function handleMagicLink(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email) { setError('Vul je e-mailadres in.'); return; }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setError('Te veel aanvragen. Wacht even en probeer opnieuw.');
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error || 'Versturen mislukt, probeer opnieuw');
        return;
      }
      // Always show success to prevent email enumeration
      setSuccess('Als dit e-mailadres bij ons bekend is, ontvang je een inloglink. Controleer ook je spam.');
    } catch {
      setError('Versturen mislukt, probeer opnieuw');
    } finally {
      setLoading(false);
    }
  }

  /** Quick-login for test accounts (email-only, password-less) */
  function loginAs(accountEmail: string): void {
    setEmail(accountEmail);
    setPassword('');
    setLoading(true);
    setError('');

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: accountEmail }),
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json() as {
          id: string; email: string; tier: string; bedrijfsnaam: string;
        };
        localStorage.setItem('lk_user', JSON.stringify({
          email: data.email,
          naam: data.bedrijfsnaam || data.email.split('@')[0],
          tier: data.tier,
          isJaarcontract: false,
        }));
        router.push('/app');
      } else {
        setError('Testaccount inloggen mislukt');
      }
    }).catch(() => {
      setError('Inloggen mislukt, probeer opnieuw');
    }).finally(() => {
      setLoading(false);
    });
  }

  const tabBtn = (mode: TabMode, label: string) => (
    <button
      type="button"
      onClick={() => { setTab(mode); setError(''); setSuccess(''); }}
      style={{
        flex: 1, padding: '8px', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
        letterSpacing: '.06em', textTransform: 'uppercase',
        background: tab === mode ? 'var(--ink)' : 'transparent',
        color: tab === mode ? '#fff' : 'var(--muted)',
        borderRadius: 'var(--radius)',
        transition: 'background .15s, color .15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ink)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', padding: '20px',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', textDecoration: 'none' }}>
        <div style={{
          width: '30px', height: '30px', background: 'var(--green)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 12 12" fill="none" width="13" height="13">
            <path d="M6 1L10 4V8L6 11L2 8V4L6 1Z" fill="#0A0A0A" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff', letterSpacing: '-.02em' }}>
          Lokaal<span style={{ color: 'var(--green)' }}>Kabaal</span>
        </span>
      </Link>

      {/* Card */}
      <div style={{
        background: 'var(--paper)', border: '1px solid var(--line)',
        borderRadius: '4px', padding: '40px', width: '100%', maxWidth: '400px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '28px',
          background: 'var(--paper2)', padding: '4px', borderRadius: 'var(--radius)',
        }}>
          {tabBtn('login', 'Inloggen')}
          {tabBtn('register', 'Registreren')}
          {tabBtn('magic', 'Link')}
        </div>

        {/* ── LOGIN TAB ── */}
        {tab === 'login' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '6px', color: 'var(--ink)' }}>
              Welkom terug
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6 }}>
              Log in met je e-mailadres en wachtwoord.
            </p>
            <form onSubmit={(e) => { void handleLogin(e); }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>E-mailadres</label>
                <input
                  type="email" placeholder="jij@bedrijf.nl" autoFocus
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={labelStyle}>Wachtwoord</label>
                <input
                  type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
              {error && (
                <p style={{ fontSize: '11px', color: 'var(--red)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>{error}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button
                  type="button"
                  aria-label="Wachtwoord vergeten? Inloglink per e-mail aanvragen"
                  onClick={() => { setTab('magic'); setError(''); }}
                  style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Wachtwoord vergeten?
                </button>
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px',
                background: loading ? 'var(--line2)' : 'var(--ink)',
                color: '#fff', border: 'none', borderRadius: 'var(--radius)',
                fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)', transition: 'background .15s',
              }}>
                {loading ? 'Inloggen...' : 'Inloggen →'}
              </button>
            </form>
          </>
        )}

        {/* ── REGISTER TAB ── */}
        {tab === 'register' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '6px', color: 'var(--ink)' }}>
              Account aanmaken
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6 }}>
              Maak een gratis account aan en start je eerste campagne.
            </p>
            <form onSubmit={(e) => { void handleRegister(e); }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>E-mailadres</label>
                <input
                  type="email" placeholder="jij@bedrijf.nl" autoFocus
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Wachtwoord</label>
                <input
                  type="password" placeholder="Minimaal 8 tekens"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Bedrijfsnaam</label>
                <input
                  type="text" placeholder="Jouw Bedrijf BV"
                  value={bedrijfsnaam} onChange={e => setBedrijfsnaam(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Branche</label>
                <select
                  value={branche} onChange={e => setBranche(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="">Selecteer je branche</option>
                  {BRANCHE_OPTIES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              {error && (
                <p style={{ fontSize: '11px', color: 'var(--red)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>{error}</p>
              )}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px',
                background: loading ? 'var(--line2)' : 'var(--green)',
                color: '#0A0A0A', border: 'none', borderRadius: 'var(--radius)',
                fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)', transition: 'background .15s',
              }}>
                {loading ? 'Account aanmaken...' : 'Account aanmaken →'}
              </button>
            </form>
          </>
        )}

        {/* ── MAGIC LINK TAB ── */}
        {tab === 'magic' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '6px', color: 'var(--ink)' }}>
              Inloglink aanvragen
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6 }}>
              Ontvang een eenmalige inloglink per e-mail, geldig voor 15 minuten.
            </p>
            {success ? (
              <div style={{
                padding: '14px 16px', background: '#f0fdf4',
                border: '1px solid #86efac', borderRadius: 'var(--radius)',
                fontSize: '13px', color: '#166534', lineHeight: 1.6,
              }}>
                {success}
              </div>
            ) : (
              <form onSubmit={(e) => { void handleMagicLink(e); }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>E-mailadres</label>
                  <input
                    type="email" placeholder="jij@bedrijf.nl" autoFocus
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                {error && (
                  <p style={{ fontSize: '11px', color: 'var(--red)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>{error}</p>
                )}
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '12px',
                  background: loading ? 'var(--line2)' : 'var(--ink)',
                  color: '#fff', border: 'none', borderRadius: 'var(--radius)',
                  fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)', transition: 'background .15s',
                }}>
                  {loading ? 'Versturen...' : 'Inloglink versturen →'}
                </button>
              </form>
            )}
          </>
        )}

        {tab !== 'register' && (
          <div style={{ borderTop: '1px solid var(--line)', marginTop: '24px', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Nog geen account?{' '}
              <button
                type="button"
                onClick={() => { setTab('register'); setError(''); }}
                style={{ color: 'var(--green-dim)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: 0 }}
              >
                Account aanmaken
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Testaccounts */}
      <div style={{
        marginTop: '24px', width: '100%', maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Testaccounts
          </span>
        </div>
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {TEST_ACCOUNTS.map(account => (
            <button
              key={account.email}
              onClick={() => loginAs(account.email)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '8px 12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: tierColors[account.tier],
                }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
                  {account.label}
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)' }}>
                direct inloggen &rarr;
              </span>
            </button>
          ))}
        </div>
      </div>

      <p style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
        &copy; 2026 LokaalKabaal &middot; Demo omgeving
      </p>
    </div>
  );
}

/**
 * Login page -- wraps LoginContent in Suspense because useSearchParams()
 * requires a Suspense boundary in Next.js 14 App Router.
 */
export default function Login() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
