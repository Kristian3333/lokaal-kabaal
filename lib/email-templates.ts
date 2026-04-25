/**
 * Shared HTML email template system for LokaalKabaal.
 *
 * All outgoing emails use this wrapper to ensure consistent branding:
 * white background, max-width 560px, green (#00E87A) accent on dark (#0A0A0A).
 */

/** Escape HTML special characters to prevent XSS in email content */
export function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface CtaButton {
  text: string;
  url: string;
}

/**
 * Build a complete HTML email document with the LokaalKabaal brand wrapper.
 *
 * @param title      - The email's main heading (shown in the body, not just <title>)
 * @param bodyHtml   - Inner HTML for the email body (paragraphs, lists, etc.)
 * @param cta        - Optional call-to-action button rendered below the body
 * @returns Full HTML string suitable for sending via Resend
 */
export function buildEmailHtml(title: string, bodyHtml: string, cta?: CtaButton): string {
  const ctaBlock = cta
    ? `
    <a href="${cta.url}"
       style="display: inline-block; margin-top: 24px; padding: 14px 28px;
              background: #00E87A; color: #0A0A0A; text-decoration: none;
              border-radius: 6px; font-weight: 700; font-size: 15px;">
      ${cta.text}
    </a>`
    : '';

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5;
             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 560px; margin: 32px auto; background: #ffffff;
              border-radius: 8px; overflow: hidden;
              box-shadow: 0 1px 4px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: #0A0A0A; padding: 24px 32px;">
      <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
        Lokaal<span style="color: #00E87A;">Kabaal</span>
      </span>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <h1 style="margin: 0 0 16px; font-size: 22px; color: #0A0A0A; line-height: 1.3;">
        ${title}
      </h1>
      <div style="color: #444444; font-size: 15px; line-height: 1.7;">
        ${bodyHtml}
      </div>
      ${ctaBlock}
    </div>

    <!-- Footer -->
    <div style="padding: 20px 32px; border-top: 1px solid #eeeeee; background: #fafafa;">
      <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.6;">
        LokaalKabaal -- Automatische flyers naar nieuwe bewoners<br />
        Vragen? Mail ons op
        <a href="mailto:support@verbouwpro.nl"
           style="color: #00E87A; text-decoration: none;">support@verbouwpro.nl</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

/**
 * Render a styled stat block (number + label) for use inside email bodies.
 *
 * @param items - Array of { value, label } pairs to display in a row
 * @returns HTML string with a horizontal flex-like stat row
 */
export function buildStatRow(items: Array<{ value: string | number; label: string }>): string {
  const cells = items
    .map(
      (item) => `
      <td style="text-align: center; padding: 12px 16px;">
        <div style="font-size: 28px; font-weight: 800; color: #0A0A0A;">${item.value}</div>
        <div style="font-size: 12px; color: #999999; margin-top: 4px;">${item.label}</div>
      </td>`,
    )
    .join('');

  return `
  <table width="100%" cellpadding="0" cellspacing="0"
         style="border: 1px solid #eeeeee; border-radius: 6px;
                margin: 20px 0; border-collapse: collapse;">
    <tr>${cells}</tr>
  </table>`;
}
