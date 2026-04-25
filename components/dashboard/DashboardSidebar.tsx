'use client';

import { TIERS, TEST_ACCOUNTS, isTestAccount, type Tier } from '@/lib/tiers';

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = 'dashboard' | 'wizard' | 'flyer' | 'billing' | 'profiel' | 'conversies';

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  minTier?: Tier;
}

interface DashboardSidebarProps {
  page: Page;
  user: { email: string; naam: string; tier?: Tier; isJaarcontract?: boolean } | null;
  userTier: Tier;
  navItems: NavItem[];
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onSwitchTestAccount: (acc: { email: string; naam: string; tier: Tier; isJaarcontract?: boolean }) => void;
}

/**
 * Dark sidebar with logo, navigation, user info, tier badge, and test account switcher.
 */
export default function DashboardSidebar({
  page,
  user,
  userTier,
  navItems,
  onNavigate,
  onLogout,
  onSwitchTestAccount,
}: DashboardSidebarProps): React.JSX.Element {
  const tierOrder: Tier[] = ['starter', 'pro', 'agency'];

  return (
    <nav style={{ width: 'var(--sidebar)', flexShrink: 0, background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--sidebar-border)' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--sidebar-text)', fontStyle: 'italic', lineHeight: 1.1 }}>
          Lokaal<br /><span style={{ color: 'var(--green)' }}>Kabaal</span>
        </div>
        <div style={{ fontSize: '9px', color: 'var(--sidebar-text-dim)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>nieuwe bewoners → vaste klanten</div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map(({ id, label, icon, minTier }) => {
          const locked = minTier ? tierOrder.indexOf(userTier) < tierOrder.indexOf(minTier) : false;
          return (
            <button key={id} data-tour={`tour-nav-${id}`} onClick={() => onNavigate(id)}
              aria-current={page === id ? 'page' : undefined}
              aria-disabled={locked || undefined}
              style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: page === id ? 'rgba(255,255,255,0.06)' : 'none', borderLeft: page === id ? '2px solid var(--green)' : '2px solid transparent', border: 'none', borderRight: 'none', color: locked ? 'rgba(255,255,255,0.2)' : page === id ? 'var(--sidebar-text)' : 'var(--sidebar-text-muted)', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: page === id ? 600 : 400, transition: 'all 0.15s' }}>
              <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: locked ? 'rgba(255,255,255,0.15)' : page === id ? 'var(--green)' : 'var(--sidebar-text-dim)' }}>{icon}</span>
              {label}
              {locked && minTier && <span style={{ marginLeft: 'auto', fontSize: '9px', color: TIERS[minTier].color, fontFamily: 'var(--font-mono)', opacity: 0.7 }}>{TIERS[minTier].label} ↑</span>}
            </button>
          );
        })}
      </div>

      {/* User footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', color: '#0A0A0A', flexShrink: 0 }}>
            {(user?.naam || 'G')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '12px', color: 'var(--sidebar-text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.naam || 'Gebruiker'}</div>
            <div style={{ fontSize: '10px', color: 'var(--sidebar-text-dim)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
          </div>
        </div>
        {user?.tier && (() => {
          const tierCfg = TIERS[user.tier];
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tierCfg.color, flexShrink: 0 }} />
              <span style={{ fontSize: '10px', color: tierCfg.color, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{tierCfg.label}</span>
              {user.isJaarcontract && <span style={{ fontSize: '9px', color: 'var(--sidebar-text-dim)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>JAAR</span>}
            </div>
          );
        })()}
        <button onClick={onLogout} style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)', borderRadius: 'var(--radius)', color: 'rgba(255,100,100,0.8)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
          Uitloggen
        </button>

        {/* Test account switcher -- only visible for test accounts */}
        {user?.email && isTestAccount(user.email) && (
          <div style={{ marginTop: '8px', borderTop: '1px solid var(--sidebar-border)', paddingTop: '8px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,200,0,0.5)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Test switcher</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {TEST_ACCOUNTS.map(acc => {
                const isActive = user.email === acc.email;
                const c = TIERS[acc.tier].color;
                return (
                  <button key={acc.email} onClick={() => onSwitchTestAccount(acc)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '5px 8px', cursor: 'pointer', textAlign: 'left', background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent', border: isActive ? `1px solid ${c}44` : '1px solid transparent', borderRadius: '3px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: c, flexShrink: 0 }} />
                    <span style={{ fontSize: '10px', color: isActive ? 'var(--sidebar-text)' : 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>{acc.label}</span>
                    {isActive && <span style={{ marginLeft: 'auto', fontSize: '9px', color: c }}>●</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
