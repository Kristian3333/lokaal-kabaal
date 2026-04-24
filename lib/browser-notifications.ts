/**
 * Browser notification helpers for the dashboard.
 *
 * Wraps the Notification API so callers can:
 *  - Check current permission state
 *  - Request permission with a single prompt
 *  - Show a scan-event notification with a consistent payload
 *
 * Caller is responsible for the opt-in UI (toggle in SettingsPanel).
 * These helpers are SSR-safe: they return safe defaults when
 * `window.Notification` is undefined.
 */

export type NotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

/** Read the current notification permission state. */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('Notification' in window)) return 'unsupported';
  const n = (window as unknown as { Notification: { permission: 'granted' | 'denied' | 'default' } }).Notification;
  return n.permission;
}

/** Prompt the user for notification permission. Returns the resulting state. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  const n = (window as unknown as { Notification: { requestPermission: () => Promise<'granted' | 'denied' | 'default'> } }).Notification;
  return n.requestPermission();
}

export interface ScanEventOptions {
  /** Short title, e.g. "Nieuwe scan in 3512" */
  title: string;
  /** Longer body, e.g. "Code A1B2C3D4 · 5 min geleden" */
  body: string;
  /** Stable tag so repeat scans for the same code collapse into one notif */
  tag?: string;
  /** Optional click-through URL */
  url?: string;
}

/**
 * Show a browser notification for a scan event. Silently no-ops if
 * permission isn't granted or Notification API isn't available.
 */
export function showScanNotification(opts: ScanEventOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  const n = (window as unknown as { Notification: { permission: string; new(title: string, opts?: object): { onclick: () => void } } }).Notification;
  if (n.permission !== 'granted') return;
  try {
    const notif = new n(opts.title, {
      body: opts.body,
      tag: opts.tag,
      icon: '/favicon.ico',
      // Keep notifications short-lived so they don't stack up overnight
      requireInteraction: false,
    });
    if (opts.url) {
      notif.onclick = () => {
        if (typeof window !== 'undefined') window.open(opts.url, '_blank');
      };
    }
  } catch {
    // Silently swallow; this is opportunistic UX, not critical.
  }
}
