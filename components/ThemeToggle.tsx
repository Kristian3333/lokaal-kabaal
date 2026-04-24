'use client';

import { useEffect, useState } from 'react';

/**
 * Light/dark theme toggle. Persists choice in localStorage and honours
 * the `prefers-color-scheme` OS setting on first visit. Renders a
 * compact pill-sized button; intended to sit in the sidebar / profile
 * panel, not as a global floating widget.
 */

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'lk_theme';

export default function ThemeToggle({
  compact = false,
}: { compact?: boolean } = {}): React.JSX.Element | null {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null);
    const osDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme = stored ?? (osDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  function set(next: Theme): void {
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  if (!theme) return null; // SSR placeholder

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => set(isDark ? 'light' : 'dark')}
      aria-label={`Schakel naar ${isDark ? 'licht' : 'donker'} thema`}
      aria-pressed={isDark}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: compact ? '6px 10px' : '8px 14px',
        background: 'transparent',
        border: '1px solid var(--line)', borderRadius: '999px',
        color: 'var(--muted)', cursor: 'pointer',
        fontSize: compact ? '11px' : '12px', fontFamily: 'var(--font-mono)',
      }}
    >
      <span aria-hidden="true">{isDark ? '☾' : '☀'}</span>
      {!compact && <span>{isDark ? 'Donker' : 'Licht'}</span>}
    </button>
  );
}
