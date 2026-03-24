'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'error' | 'success' | 'warning';
}

let toastListeners: ((msg: ToastMessage) => void)[] = [];

/** Show a toast notification from anywhere in the app */
export function showToast(text: string, type: ToastMessage['type'] = 'error'): void {
  const msg: ToastMessage = { id: String(Date.now()), text, type };
  toastListeners.forEach(fn => fn(msg));
}

const COLORS: Record<ToastMessage['type'], { bg: string; border: string; text: string }> = {
  error:   { bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.3)', text: '#dc2626' },
  success: { bg: 'rgba(0,232,122,0.08)', border: 'rgba(0,232,122,0.3)', text: 'var(--green-dim)' },
  warning: { bg: 'rgba(255,200,0,0.08)', border: 'rgba(255,200,0,0.3)', text: '#b8860b' },
};

/** Toast container -- render once in layout */
export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: ToastMessage) => {
    setToasts(prev => [...prev, msg]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== msg.id));
    }, 4000);
  }, []);

  useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter(fn => fn !== addToast);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px',
    }}>
      {toasts.map(t => {
        const c = COLORS[t.type];
        return (
          <div key={t.id} style={{
            background: c.bg, border: `1px solid ${c.border}`, borderRadius: '8px',
            padding: '12px 16px', fontSize: '13px', color: c.text,
            fontFamily: 'var(--font-mono)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            animation: 'fadeIn 0.2s ease-out',
          }}>
            {t.text}
          </div>
        );
      })}
    </div>
  );
}
