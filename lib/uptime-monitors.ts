/**
 * Typed definitions for the external monitors we want Better Uptime (or
 * UptimeRobot / Vercel) to run against production. Keeping this in code
 * lets the monitor config round-trip through git review instead of living
 * only in a vendor UI, and `buildBetterUptimeConfig` produces the JSON
 * payload that Better Uptime's import-API accepts so we can apply it with
 * a single POST once the vendor account exists.
 */

export type MonitorKind = 'json-probe' | 'http-status' | 'https-keyword';

export type JsonAssertion = {
  path: string;
  expected: unknown;
};

export type Monitor = {
  name: string;
  kind: MonitorKind;
  url: string;
  /** Polling interval in seconds. Match Better Uptime increments (30, 60, 180). */
  intervalSeconds: 30 | 60 | 180;
  /** HTTP request timeout in seconds. */
  timeoutSeconds: number;
  /** Required HTTP status. */
  expectedStatus: 200 | 204 | 401;
  /** JSON-path assertions evaluated after the status check. */
  jsonAssertions?: JsonAssertion[];
  /** Keyword that must appear in the response body for keyword monitors. */
  expectedKeyword?: string;
  /** Regions from which the monitor must probe. */
  regions: Array<'eu-west-1' | 'eu-central-1' | 'us-east-1'>;
};

export const MONITORS: readonly Monitor[] = [
  {
    name: 'health-probe',
    kind: 'json-probe',
    url: 'https://lokaalkabaal.agency/api/health',
    intervalSeconds: 60,
    timeoutSeconds: 10,
    expectedStatus: 200,
    jsonAssertions: [
      { path: 'ok', expected: true },
      { path: 'db', expected: 'up' },
    ],
    regions: ['eu-west-1', 'eu-central-1'],
  },
  {
    name: 'auth-session-liveness',
    kind: 'http-status',
    // An unauthenticated probe should hit the endpoint, get rejected with
    // 401, and tell us the session handler is at least wired up. This
    // exercises middleware + the route without needing credentials.
    url: 'https://lokaalkabaal.agency/api/auth/session',
    intervalSeconds: 180,
    timeoutSeconds: 10,
    expectedStatus: 401,
    regions: ['eu-west-1'],
  },
  {
    name: 'pc4grenzen-endpoint',
    kind: 'http-status',
    url: 'https://lokaalkabaal.agency/api/pc4grenzen?pc4=3511',
    intervalSeconds: 180,
    timeoutSeconds: 15,
    expectedStatus: 200,
    regions: ['eu-west-1'],
  },
  {
    name: 'landing-page-keyword',
    kind: 'https-keyword',
    url: 'https://lokaalkabaal.agency/',
    intervalSeconds: 180,
    timeoutSeconds: 15,
    expectedStatus: 200,
    expectedKeyword: 'LokaalKabaal',
    regions: ['eu-west-1'],
  },
];

/**
 * Build a Better Uptime config document from MONITORS. The shape mirrors
 * Better Uptime's POST /api/v2/monitors payload so the caller can loop
 * over the array and create one monitor per entry.
 */
export function buildBetterUptimeConfig(monitors: readonly Monitor[] = MONITORS): Array<{
  name: string;
  monitor_type: string;
  url: string;
  check_frequency: number;
  request_timeout: number;
  expected_status_codes: number[];
  regions: string[];
  required_keyword?: string;
  request_body?: string;
}> {
  return monitors.map(m => {
    const monitor_type =
      m.kind === 'https-keyword'
        ? 'keyword'
        : m.kind === 'json-probe'
          ? 'expected_status_code'
          : 'status';
    const base = {
      name: m.name,
      monitor_type,
      url: m.url,
      check_frequency: m.intervalSeconds,
      request_timeout: m.timeoutSeconds,
      expected_status_codes: [m.expectedStatus],
      regions: m.regions,
    };
    if (m.expectedKeyword) {
      return { ...base, required_keyword: m.expectedKeyword };
    }
    if (m.jsonAssertions) {
      // Better Uptime treats JSON assertions as an additional request_body
      // match; we serialise the expected shape so the monitor UI renders it.
      return { ...base, request_body: JSON.stringify(m.jsonAssertions) };
    }
    return base;
  });
}

/**
 * Synthesise a Slack webhook payload for when one of the monitors flips to
 * down. Pure function; the caller POSTs the return value to the incoming-
 * webhook URL.
 */
export function buildDownAlertSlackPayload(args: {
  monitorName: string;
  observedStatus: number;
  observedAtIso: string;
  url: string;
}): { text: string; attachments: Array<{ color: string; fields: Array<{ title: string; value: string; short: boolean }> }> } {
  return {
    text: `:rotating_light: LokaalKabaal monitor \`${args.monitorName}\` is DOWN`,
    attachments: [
      {
        color: '#FF3B3B',
        fields: [
          { title: 'URL', value: args.url, short: false },
          { title: 'HTTP status', value: String(args.observedStatus), short: true },
          { title: 'Observed at', value: args.observedAtIso, short: true },
        ],
      },
    ],
  };
}
