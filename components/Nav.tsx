'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/flyers-versturen-nieuwe-bewoners', label: 'Hoe het werkt' },
  { href: '/#prijzen', label: 'Prijzen' },
  { href: '/blog', label: 'Blog' },
  { href: '/over-ons', label: 'Over ons' },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '52px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: '26px', height: '26px', background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 12 12" fill="none" width="12" height="12" aria-hidden="true"><path d="M6 1L10 4V8L6 11L2 8V4L6 1Z" fill="#0A0A0A" /></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '13px', color: '#fff', letterSpacing: '-.02em' }}>
            Lokaal<span style={{ color: 'var(--green)' }}>Kabaal</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {LINKS.map(l => {
            const active = l.href !== '/#prijzen' && pathname === l.href;
            return (
              <Link key={l.href} href={l.href} style={{
                fontSize: '12px',
                color: active ? '#fff' : 'rgba(255,255,255,.5)',
                textDecoration: 'none',
                fontWeight: active ? 600 : 400,
              }}>
                {l.label}
              </Link>
            );
          })}
          <Link href="/login" style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            Inloggen
          </Link>
          <Link href="/login" style={{ padding: '7px 16px', background: 'var(--green)', color: 'var(--ink)', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 700, textDecoration: 'none', minHeight: '36px', display: 'flex', alignItems: 'center' }}>
            Aan de slag
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(v => !v)}
          style={{
            display: 'none', background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px', color: '#fff', fontSize: '18px',
          }}
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{
          background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {LINKS.map(l => {
            const active = l.href !== '/#prijzen' && pathname === l.href;
            return (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
                fontSize: '14px',
                color: active ? '#fff' : 'rgba(255,255,255,.6)',
                textDecoration: 'none',
                fontWeight: active ? 600 : 400,
              }}>
                {l.label}
              </Link>
            );
          })}
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: '14px', color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>
            Inloggen
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{
            padding: '12px 20px', background: 'var(--green)', color: 'var(--ink)',
            borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 700,
            textDecoration: 'none', textAlign: 'center', display: 'block',
          }}>
            Aan de slag
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .nav-desktop a { font-size: 11px !important; }
          nav > div:first-child { padding: 0 24px !important; }
        }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          nav > div:first-child { padding: 0 20px !important; }
        }
      `}</style>
    </nav>
  );
}
