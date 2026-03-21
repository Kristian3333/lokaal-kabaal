'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TEST_ACCOUNTS, getTestAccount } from '../../lib/tiers';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [ww, setWw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function loginAs(accountEmail: string, naam: string, tier: string, isJaarcontract: boolean) {
    localStorage.setItem('lk_user', JSON.stringify({ email: accountEmail, naam, tier, isJaarcontract }));
    router.push('/app');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !ww) { setError('Vul je e-mail en wachtwoord in.'); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 400));
    const naam = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim() || 'Gebruiker';
    // Detecteer testaccount voor automatische tier-instelling
    const testAccount = getTestAccount(email);
    localStorage.setItem('lk_user', JSON.stringify({
      email,
      naam: testAccount?.naam ?? naam,
      tier: testAccount?.tier ?? 'starter',
      isJaarcontract: testAccount?.isJaarcontract ?? false,
    }));
    setLoading(false);
    router.push('/app');
  };

  const tierColors: Record<string, string> = {
    starter: '#94a3b8',
    pro:     '#60a5fa',
    agency:  '#00E87A',
  };

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

      {/* Login card */}
      <div style={{
        background: 'var(--paper)', border: '1px solid var(--line)',
        borderRadius: '4px', padding: '40px', width: '100%', maxWidth: '380px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
      }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, marginBottom: '6px', color: 'var(--ink)' }}>
          Welkom terug
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.6 }}>
          Log in met je e-mailadres. Elk wachtwoord werkt.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              fontSize: '10px', fontWeight: 600, color: 'var(--muted)',
              letterSpacing: '.09em', textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '5px',
            }}>E-mailadres</label>
            <input
              type="email" placeholder="jij@bedrijf.nl" autoFocus
              value={email} onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                border: `1px solid ${error ? 'var(--red)' : 'var(--line)'}`,
                borderRadius: 'var(--radius)', fontSize: '13px',
                outline: 'none', fontFamily: 'var(--font-mono)',
                background: '#fff', color: 'var(--ink)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{
              fontSize: '10px', fontWeight: 600, color: 'var(--muted)',
              letterSpacing: '.09em', textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '5px',
            }}>Wachtwoord</label>
            <input
              type="password" placeholder="••••••••"
              value={ww} onChange={e => setWw(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                border: `1px solid ${error ? 'var(--red)' : 'var(--line)'}`,
                borderRadius: 'var(--radius)', fontSize: '13px',
                outline: 'none', fontFamily: 'var(--font-mono)',
                background: '#fff', color: 'var(--ink)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '11px', color: 'var(--red)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>{error}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <a href="#" style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>
              Wachtwoord vergeten?
            </a>
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

        <div style={{ borderTop: '1px solid var(--line)', marginTop: '24px', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Nog geen account?{' '}
            <Link href="/#prijzen" style={{ color: 'var(--green-dim)', fontWeight: 600, textDecoration: 'none' }}>
              Eerste batch voor €49
            </Link>
          </p>
        </div>
      </div>

      {/* Testaccounts — alleen zichtbaar in dev/test omgeving */}
      <div style={{
        marginTop: '24px', width: '100%', maxWidth: '380px',
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
              onClick={() => loginAs(account.email, account.naam, account.tier, account.isJaarcontract)}
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
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>
                direct inloggen →
              </span>
            </button>
          ))}
        </div>
      </div>

      <p style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
        © 2026 LokaalKabaal · Demo omgeving
      </p>
    </div>
  );
}
