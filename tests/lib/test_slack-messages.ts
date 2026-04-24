import { describe, it, expect } from 'vitest';
import { buildSlackMessage, buildTeamsMessage } from '@/lib/slack-messages';
import type { WebhookEvent } from '@/lib/webhook-outbox';

const SCAN_EVENT: WebhookEvent = {
  type: 'scan.registered',
  retailerId: 'r1',
  campagneId: 'c1',
  code: 'ABCD1234',
  postcode: '3512',
  stad: 'Utrecht',
  at: '2026-04-28T14:30:00.000Z',
};

const CONVERSION_EVENT: WebhookEvent = {
  type: 'conversion.registered',
  retailerId: 'r1',
  campagneId: 'c1',
  code: 'ABCD1234',
  postcode: '3512',
  stad: 'Utrecht',
  at: '2026-04-28T14:30:00.000Z',
};

const DISPATCH_EVENT: WebhookEvent = {
  type: 'campaign.dispatched',
  retailerId: 'r1',
  campagneId: 'c1',
  flyersSent: 412,
  maand: '2026-04',
  at: '2026-04-25T09:00:00.000Z',
};

const REPORT_EVENT: WebhookEvent = {
  type: 'monthly_report.ready',
  retailerId: 'r1',
  campagneId: 'c1',
  maand: '2026-04',
  reportUrl: 'https://lokaalkabaal.agency/reports/abc123.pdf',
  at: '2026-05-05T07:00:00.000Z',
};

describe('buildSlackMessage', () => {
  it('test_slack_scan_hasTextAndBlocks', () => {
    const m = buildSlackMessage(SCAN_EVENT);
    expect(m.text).toContain('3512');
    expect(m.text).toContain('Utrecht');
    expect(Array.isArray(m.blocks)).toBe(true);
  });

  it('test_slack_conversion_distinctCopy', () => {
    const scan = buildSlackMessage(SCAN_EVENT);
    const conv = buildSlackMessage(CONVERSION_EVENT);
    expect(scan.text).not.toBe(conv.text);
  });

  it('test_slack_dispatch_mentionsFlyerCountAndMonth', () => {
    const m = buildSlackMessage(DISPATCH_EVENT);
    expect(m.text).toContain('412');
    expect(m.text).toContain('2026-04');
  });

  it('test_slack_monthlyReport_includesLink', () => {
    const m = buildSlackMessage(REPORT_EVENT);
    expect(JSON.stringify(m)).toContain('reports/abc123.pdf');
  });
});

describe('buildTeamsMessage', () => {
  it('test_teams_scan_hasMessageCardStructure', () => {
    const m = buildTeamsMessage(SCAN_EVENT);
    expect(m['@type']).toBe('MessageCard');
    expect(m['@context']).toBe('https://schema.org/extensions');
    expect(m.title).toContain('Utrecht');
  });

  it('test_teams_brandColorConsistent', () => {
    const scan = buildTeamsMessage(SCAN_EVENT);
    const conv = buildTeamsMessage(CONVERSION_EVENT);
    expect(scan.themeColor).toBe(conv.themeColor);
  });

  it('test_teams_monthlyReport_includesUrlInText', () => {
    const m = buildTeamsMessage(REPORT_EVENT);
    expect(m.text).toContain('abc123.pdf');
  });

  it('test_teams_dispatchSummary_mentionsMonth', () => {
    const m = buildTeamsMessage(DISPATCH_EVENT);
    expect(m.summary).toContain('2026-04');
  });
});
