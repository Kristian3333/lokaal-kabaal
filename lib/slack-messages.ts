/**
 * Slack + Teams message builders for webhook subscribers.
 *
 * Retailers that register a Slack incoming-webhook or Teams connector
 * in their webhook-outbox config get these pre-formatted payloads
 * instead of the raw JSON, so their channel reads naturally.
 *
 * Pure functions -- the actual POST lives in the webhook-outbox cron.
 */

import type { WebhookEvent } from '@/lib/webhook-outbox';

/** Slack-compatible block-kit payload. Also works for Mattermost. */
export interface SlackPayload {
  text: string;                 // fallback for notifications
  blocks?: unknown[];
}

export function buildSlackMessage(event: WebhookEvent): SlackPayload {
  const at = new Date(event.at).toLocaleString('nl-NL', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  switch (event.type) {
    case 'scan.registered': {
      const text = `Nieuwe scan in ${event.postcode} · ${event.stad} om ${at}`;
      return {
        text,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `:flags-nl: *Nieuwe scan*\nCode \`${event.code}\` gescand in *${event.postcode} ${event.stad}* om ${at}.` },
          },
          { type: 'context', elements: [{ type: 'mrkdwn', text: `campagne \`${event.campagneId}\`` }] },
        ],
      };
    }
    case 'conversion.registered': {
      const text = `Conversie geregistreerd in ${event.postcode} · ${event.stad} om ${at}`;
      return {
        text,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `:white_check_mark: *Conversie*\nCode \`${event.code}\` ingewisseld in *${event.postcode} ${event.stad}* om ${at}.` },
          },
        ],
      };
    }
    case 'campaign.dispatched': {
      const text = `Campagne batch verstuurd: ${event.flyersSent} flyers voor ${event.maand}`;
      return {
        text,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `:mailbox_with_mail: *Batch verstuurd*\n${event.flyersSent} flyers de deur uit voor *${event.maand}*. Bezorging PostNL, klanten ontvangen tussen de 28e en 30e.` },
          },
        ],
      };
    }
    case 'monthly_report.ready': {
      const text = `Maandrapport klaar voor ${event.maand}`;
      return {
        text,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `:bar_chart: *Maandrapport voor ${event.maand}*\n<${event.reportUrl}|Bekijk het rapport>` },
          },
        ],
      };
    }
  }
}

/** Microsoft Teams adaptive-card payload (connector format). */
export interface TeamsPayload {
  '@type': 'MessageCard';
  '@context': 'https://schema.org/extensions';
  summary: string;
  themeColor: string;
  title: string;
  text: string;
}

export function buildTeamsMessage(event: WebhookEvent): TeamsPayload {
  const at = new Date(event.at).toLocaleString('nl-NL', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  const common = {
    '@type': 'MessageCard' as const,
    '@context': 'https://schema.org/extensions' as const,
    themeColor: '00E87A',
  };

  switch (event.type) {
    case 'scan.registered':
      return {
        ...common,
        summary: `Scan in ${event.postcode}`,
        title: `Nieuwe scan in ${event.postcode} · ${event.stad}`,
        text: `Code ${event.code} gescand om ${at}`,
      };
    case 'conversion.registered':
      return {
        ...common,
        summary: `Conversie in ${event.postcode}`,
        title: `Conversie in ${event.postcode} · ${event.stad}`,
        text: `Code ${event.code} ingewisseld om ${at}`,
      };
    case 'campaign.dispatched':
      return {
        ...common,
        summary: `Batch verstuurd voor ${event.maand}`,
        title: `Campagne batch verstuurd`,
        text: `${event.flyersSent} flyers de deur uit voor ${event.maand}`,
      };
    case 'monthly_report.ready':
      return {
        ...common,
        summary: `Maandrapport ${event.maand}`,
        title: `Maandrapport voor ${event.maand}`,
        text: `Bekijk het rapport: ${event.reportUrl}`,
      };
  }
}
