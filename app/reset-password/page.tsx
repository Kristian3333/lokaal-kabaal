'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * /reset-password?token=xxx
 *
 * Landing page for the email link sent by /api/auth/password-reset/request.
 * Captures the token from the URL, asks the user for a new password twice
 * (typo guard, not a security control) and posts to /api/auth/password-reset/confirm.
 * On success the API hands back a session cookie so the user lands in /app
 * without re-typing the credentials.
 */
function ResetPasswordContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Geen reset-token gevonden in de link.');
      return;
    }
    if (password.length < 8) {
      setError('Wachtwoord moet minstens 8 tekens zijn.');
      return;
    }
    if (password !== confirm) {
      setError('De wachtwoorden komen niet overeen.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/app'), 1500);
        return;
      }

      const data = await res.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? 'Resetten mislukt. Probeer het opnieuw.');
    } catch {
      setError('Verbindingsfout. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ink)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', padding: '20px',
    }}>
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

      <div style={{
        background: 'var(--paper)', border: '1px solid var(--line)',
        borderRadius: '4px', padding: '40px', width: '100%', maxWidth: '400px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
      }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '6px', color: 'var(--ink)' }}>
          Nieuw wachtwoord
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6 }}>
          Kies een nieuw wachtwoord voor je LokaalKabaal-account.
        </p>

        {success ? (
          <div role="alert" style={{
            background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.3)',
            borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--green-dim)', marginBottom: '4px' }}>✓</div>
            <p style={{ fontSize: '13px', color: 'var(--ink)' }}>
              Wachtwoord opgeslagen. Je wordt doorgestuurd naar je dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => { void handleSubmit(e); }}>
            <div style={{ marginBottom: '14px' }}>
              <label htmlFor="rp-password" style={{
                fontSize: '10px', fontWeight: 600, color: 'var(--muted)',
                letterSpacing: '.09em', textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '5px',
              }}>
                Nieuw wachtwoord
              </label>
              <input
                id="rp-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 tekens"
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)', fontSize: '13px',
                  outline: 'none', fontFamily: 'var(--font-mono)',
                  background: '#fff', color: 'var(--ink)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="rp-confirm" style={{
                fontSize: '10px', fontWeight: 600, color: 'var(--muted)',
                letterSpacing: '.09em', textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '5px',
              }}>
                Bevestig wachtwoord
              </label>
              <input
                id="rp-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Herhaal je wachtwoord"
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)', fontSize: '13px',
                  outline: 'none', fontFamily: 'var(--font-mono)',
                  background: '#fff', color: 'var(--ink)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div role="alert" style={{
                background: 'var(--red-bg)', border: '1px solid rgba(255,59,59,0.3)',
                borderRadius: 'var(--radius)', padding: '10px 12px',
                fontSize: '12px', color: 'var(--red)', marginBottom: '14px',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? 'var(--line2)' : 'var(--ink)',
              color: '#fff', border: 'none', borderRadius: 'var(--radius)',
              fontWeight: 700, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
            }}>
              {loading ? 'Opslaan...' : 'Wachtwoord opslaan'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/login" style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>
            ← Terug naar inloggen
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--ink)' }} />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
