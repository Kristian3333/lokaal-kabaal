'use client';

/**
 * CommandPalette -- cmd/ctrl+K quick-action palette for the dashboard.
 *
 * Keeps power users out of nested menus. Consumers register a list of
 * commands (label, hint, optional keywords, handler) and the palette
 * takes care of focus, keyboard navigation, filtering, and closing.
 *
 * Rendered once at the dashboard root; there is no prop-drilling down
 * to every panel.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

export interface Command {
  id: string;
  label: string;
  hint?: string;
  keywords?: string[];
  onRun: () => void;
}

interface CommandPaletteProps {
  commands: Command[];
}

function matches(cmd: Command, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [cmd.label, cmd.hint ?? '', ...(cmd.keywords ?? [])].join(' ').toLowerCase();
  return haystack.includes(q);
}

export default function CommandPalette({ commands }: CommandPaletteProps): React.JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global cmd/ctrl+K binding
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(v => !v);
        return;
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const filtered = useMemo(
    () => commands.filter(c => matches(c, query)),
    [commands, query],
  );

  useEffect(() => {
    if (activeIdx >= filtered.length) setActiveIdx(0);
  }, [filtered, activeIdx]);

  if (!open) return null;

  function run(cmd: Command): void {
    setOpen(false);
    cmd.onRun();
  }

  return (
    <div
      role="dialog"
      aria-label="Command palette"
      aria-modal="true"
      onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(10,10,10,0.5)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div style={{
        width: 'min(560px, 92vw)',
        background: 'var(--paper)',
        border: '1px solid var(--line)', borderRadius: '8px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
              if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
              if (e.key === 'Enter' && filtered[activeIdx]) { e.preventDefault(); run(filtered[activeIdx]); }
            }}
            placeholder="Zoek of typ een commando..."
            aria-label="Zoek commando"
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15px', fontFamily: 'var(--font-sans)', color: 'var(--ink)',
            }}
          />
        </div>
        <ul role="listbox" style={{ listStyle: 'none', margin: 0, padding: '6px 0', maxHeight: '360px', overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <li style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Geen commando gevonden
            </li>
          )}
          {filtered.map((cmd, i) => (
            <li
              key={cmd.id}
              role="option"
              aria-selected={i === activeIdx}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => run(cmd)}
              style={{
                padding: '10px 16px', cursor: 'pointer',
                background: i === activeIdx ? 'var(--green-bg)' : 'transparent',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', color: 'var(--ink)' }}>{cmd.label}</div>
                {cmd.hint && <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{cmd.hint}</div>}
              </div>
              {i === activeIdx && (
                <span aria-hidden="true" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>↵</span>
              )}
            </li>
          ))}
        </ul>
        <div style={{ borderTop: '1px solid var(--line)', padding: '8px 14px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <span>↑↓ navigeren</span>
          <span>↵ uitvoeren</span>
          <span>esc sluiten</span>
          <span style={{ marginLeft: 'auto' }}>⌘K / ctrl+K om te openen</span>
        </div>
      </div>
    </div>
  );
}
