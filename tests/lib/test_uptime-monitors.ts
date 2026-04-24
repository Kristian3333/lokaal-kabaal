import { describe, it, expect } from 'vitest';
import {
  MONITORS,
  buildBetterUptimeConfig,
  buildDownAlertSlackPayload,
  type Monitor,
} from '@/lib/uptime-monitors';

describe('MONITORS constant', () => {
  it('test_monitors_nonEmpty', () => {
    expect(MONITORS.length).toBeGreaterThan(0);
  });

  it('test_monitors_everyUrl_isHttps', () => {
    for (const m of MONITORS) {
      expect(m.url.startsWith('https://')).toBe(true);
    }
  });

  it('test_monitors_everyEntry_hasAtLeastOneRegion', () => {
    for (const m of MONITORS) {
      expect(m.regions.length).toBeGreaterThan(0);
    }
  });

  it('test_monitors_includesCoreEndpoints', () => {
    const urls = MONITORS.map(m => m.url);
    expect(urls).toContain('https://lokaalkabaal.agency/api/health');
    expect(urls).toContain('https://lokaalkabaal.agency/api/auth/session');
    expect(urls).toContain('https://lokaalkabaal.agency/api/pc4grenzen?pc4=3511');
  });

  it('test_monitors_intervalsAreWithinAllowedValues', () => {
    for (const m of MONITORS) {
      expect([30, 60, 180]).toContain(m.intervalSeconds);
    }
  });
});

describe('buildBetterUptimeConfig', () => {
  it('test_emptyInput_returnsEmptyArray', () => {
    expect(buildBetterUptimeConfig([])).toEqual([]);
  });

  it('test_keywordMonitor_hasRequiredKeyword', () => {
    const m: Monitor = {
      name: 'landing',
      kind: 'https-keyword',
      url: 'https://x.nl',
      intervalSeconds: 180,
      timeoutSeconds: 10,
      expectedStatus: 200,
      expectedKeyword: 'Hello',
      regions: ['eu-west-1'],
    };
    const [cfg] = buildBetterUptimeConfig([m]);
    expect(cfg.monitor_type).toBe('keyword');
    expect(cfg.required_keyword).toBe('Hello');
  });

  it('test_jsonProbe_embedsAssertionsAsRequestBody', () => {
    const m: Monitor = {
      name: 'health',
      kind: 'json-probe',
      url: 'https://x.nl/api/health',
      intervalSeconds: 60,
      timeoutSeconds: 10,
      expectedStatus: 200,
      jsonAssertions: [{ path: 'ok', expected: true }],
      regions: ['eu-west-1'],
    };
    const [cfg] = buildBetterUptimeConfig([m]);
    expect(cfg.monitor_type).toBe('expected_status_code');
    expect(cfg.request_body).toBe('[{"path":"ok","expected":true}]');
  });

  it('test_httpStatus_omitsKeywordAndBody', () => {
    const m: Monitor = {
      name: 'session',
      kind: 'http-status',
      url: 'https://x.nl/api/auth/session',
      intervalSeconds: 180,
      timeoutSeconds: 10,
      expectedStatus: 401,
      regions: ['eu-west-1'],
    };
    const [cfg] = buildBetterUptimeConfig([m]);
    expect(cfg.monitor_type).toBe('status');
    expect(cfg.required_keyword).toBeUndefined();
    expect(cfg.request_body).toBeUndefined();
    expect(cfg.expected_status_codes).toEqual([401]);
  });

  it('test_passesThroughCoreFields', () => {
    const m: Monitor = {
      name: 'n',
      kind: 'http-status',
      url: 'https://x.nl',
      intervalSeconds: 30,
      timeoutSeconds: 5,
      expectedStatus: 200,
      regions: ['eu-west-1', 'us-east-1'],
    };
    const [cfg] = buildBetterUptimeConfig([m]);
    expect(cfg.name).toBe('n');
    expect(cfg.url).toBe('https://x.nl');
    expect(cfg.check_frequency).toBe(30);
    expect(cfg.request_timeout).toBe(5);
    expect(cfg.regions).toEqual(['eu-west-1', 'us-east-1']);
  });

  it('test_defaultArg_usesMONITORS', () => {
    const cfg = buildBetterUptimeConfig();
    expect(cfg.length).toBe(MONITORS.length);
  });
});

describe('buildDownAlertSlackPayload', () => {
  it('test_slackPayload_mentionsMonitorNameAndRedAttachmentColor', () => {
    const p = buildDownAlertSlackPayload({
      monitorName: 'health-probe',
      observedStatus: 500,
      observedAtIso: '2026-04-24T12:00:00.000Z',
      url: 'https://lokaalkabaal.agency/api/health',
    });
    expect(p.text).toContain('health-probe');
    expect(p.attachments[0].color).toBe('#FF3B3B');
  });

  it('test_slackPayload_includesUrlStatusTimestampFields', () => {
    const p = buildDownAlertSlackPayload({
      monitorName: 'x',
      observedStatus: 502,
      observedAtIso: '2026-04-24T12:00:00.000Z',
      url: 'https://x.nl',
    });
    const fields = p.attachments[0].fields;
    expect(fields.find(f => f.title === 'URL')?.value).toBe('https://x.nl');
    expect(fields.find(f => f.title === 'HTTP status')?.value).toBe('502');
    expect(fields.find(f => f.title === 'Observed at')?.value).toBe(
      '2026-04-24T12:00:00.000Z',
    );
  });
});
