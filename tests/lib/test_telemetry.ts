import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { captureError, captureWarning, captureEvent } from '@/lib/telemetry';

const errSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* silent */ });
const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { /* silent */ });
const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { /* silent */ });

beforeEach(() => {
  errSpy.mockClear();
  warnSpy.mockClear();
  logSpy.mockClear();
});

afterEach(() => {
  errSpy.mockClear();
  warnSpy.mockClear();
  logSpy.mockClear();
});

describe('captureError', () => {
  it('test_captureError_realError_logsWithMessage', () => {
    captureError(new Error('boom'));
    expect(errSpy).toHaveBeenCalledTimes(1);
    const args = errSpy.mock.calls[0];
    expect(args[0]).toBe('[telemetry:error]');
    const payload = JSON.parse(args[1] as string);
    expect(payload.message).toBe('boom');
    expect(payload.name).toBe('Error');
  });

  it('test_captureError_nonErrorInput_normalizesToError', () => {
    captureError('not an Error object');
    const payload = JSON.parse(errSpy.mock.calls[0][1] as string);
    expect(payload.message).toBe('not an Error object');
  });

  it('test_captureError_mergesContext_keepsUserFields', () => {
    captureError(new Error('x'), { retailerId: 'r_1', step: 4 });
    const payload = JSON.parse(errSpy.mock.calls[0][1] as string);
    expect(payload.retailerId).toBe('r_1');
    expect(payload.step).toBe(4);
  });

  it('test_captureError_neverThrows_evenOnWeirdInput', () => {
    expect(() => captureError(undefined)).not.toThrow();
    expect(() => captureError(null)).not.toThrow();
    expect(() => captureError({ totally: 'made up' })).not.toThrow();
  });
});

describe('captureWarning', () => {
  it('test_captureWarning_messageAndContext_loggedWithPrefix', () => {
    captureWarning('disk low', { percent: 85 });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toBe('[telemetry:warn]');
    const payload = JSON.parse(warnSpy.mock.calls[0][1] as string);
    expect(payload.message).toBe('disk low');
    expect(payload.percent).toBe(85);
  });
});

describe('captureEvent', () => {
  it('test_captureEvent_domainEvent_loggedWithPrefix', () => {
    captureEvent('campaign.created', { tier: 'pro' });
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toBe('[telemetry:event]');
    const payload = JSON.parse(logSpy.mock.calls[0][1] as string);
    expect(payload.name).toBe('campaign.created');
    expect(payload.tier).toBe('pro');
  });
});
