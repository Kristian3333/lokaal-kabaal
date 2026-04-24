import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getNotificationPermission,
  requestNotificationPermission,
  showScanNotification,
} from '@/lib/browser-notifications';

// vitest runs with node env, so `window` is undefined unless we stub it.
// These tests verify the SSR-safe defaults + behaviour when we simulate
// a browser environment with `Notification` on window.

const originalWindow = (globalThis as { window?: unknown }).window;

afterEach(() => {
  if (originalWindow === undefined) {
    delete (globalThis as { window?: unknown }).window;
  } else {
    (globalThis as { window?: unknown }).window = originalWindow;
  }
});

describe('getNotificationPermission (SSR safety)', () => {
  beforeEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('test_permission_noWindow_returnsUnsupported', () => {
    expect(getNotificationPermission()).toBe('unsupported');
  });
});

describe('getNotificationPermission (browser)', () => {
  it('test_permission_browserGranted_returnsGranted', () => {
    (globalThis as { window?: unknown }).window = {
      Notification: { permission: 'granted' },
    } as unknown as Window;
    expect(getNotificationPermission()).toBe('granted');
  });

  it('test_permission_browserDefault_returnsDefault', () => {
    (globalThis as { window?: unknown }).window = {
      Notification: { permission: 'default' },
    } as unknown as Window;
    expect(getNotificationPermission()).toBe('default');
  });

  it('test_permission_browserWithoutNotification_returnsUnsupported', () => {
    (globalThis as { window?: unknown }).window = {} as unknown as Window;
    expect(getNotificationPermission()).toBe('unsupported');
  });
});

describe('requestNotificationPermission', () => {
  it('test_request_noWindow_returnsUnsupported', async () => {
    delete (globalThis as { window?: unknown }).window;
    await expect(requestNotificationPermission()).resolves.toBe('unsupported');
  });

  it('test_request_resolvesToBrowserResult', async () => {
    (globalThis as { window?: unknown }).window = {
      Notification: { permission: 'default', requestPermission: async () => 'granted' },
    } as unknown as Window;
    await expect(requestNotificationPermission()).resolves.toBe('granted');
  });
});

describe('showScanNotification', () => {
  beforeEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('test_show_noWindow_silentNoop', () => {
    expect(() => showScanNotification({ title: 't', body: 'b' })).not.toThrow();
  });

  it('test_show_permissionNotGranted_silentNoop', () => {
    const constructed: string[] = [];
    (globalThis as { window?: unknown }).window = {
      Notification: class {
        constructor(t: string) { constructed.push(t); }
        static permission = 'default';
      },
    } as unknown as Window;
    showScanNotification({ title: 'nope', body: 'b' });
    expect(constructed).toEqual([]);
  });

  it('test_show_permissionGranted_constructsNotification', () => {
    const constructed: string[] = [];
    (globalThis as { window?: unknown }).window = {
      Notification: class {
        constructor(t: string) { constructed.push(t); }
        static permission = 'granted';
      },
    } as unknown as Window;
    showScanNotification({ title: 'Scan', body: 'Details' });
    expect(constructed).toEqual(['Scan']);
  });
});
