'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/flyers-versturen-nieuwe-bewoners', label: 'Nieuwe bewoners' },
  { href: '/#prijzen', label: 'Prijzen' },
  { href: '/blog', label: 'Blog' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--ink)', borderBottom: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', height: '52px',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ width: '26px', height: '26px', background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 12 12" fill="none" width="12" height="12"><path d="M6 1L10 4V8L6 11L2 8V4L6 1Z" fill="#0A0A0A" /></svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: '13px', color: '#fff', letterSpacing: '-.02em' }}>
          Lokaal<span style={{ color: 'var(--green)' }}>Kabaal</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
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
        <Link href="/login" style={{ padding: '7px 16px', background: 'var(--green)', color: 'var(--ink)', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
          Aan de slag
        </Link>
      </div>
    </nav>
  );
}
