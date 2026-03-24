import { Resend } from 'resend';
import { buildEmailHtml, buildStatRow, escHtml } from '@/lib/email-templates';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = 'LokaalKabaal <noreply@lokaalkabaal.agency>';

/** Monthly performance report data passed to sendMonthlyReport */
export interface MonthlyReport {
  flyersSent: number;
  scans: number;
  conversions: number;
  conversionRate: number;  // percentage, e.g. 4.2
  topPostcodes: string[];  // up to 5 PC4 codes
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/** Send an email via Resend. No-ops gracefully if RESEND_API_KEY is not set. */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  if (!resend) {
    console.error('RESEND_API_KEY not configured -- email not sent:', subject);
    return false;
  }
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}

/** Send payment confirmation email */
export async function sendPaymentConfirmation(
  email: string,
  bedrijfsnaam: string,
  tier: string,
): Promise<boolean> {
  const html = buildEmailHtml(
    `Welkom bij LokaalKabaal, ${escHtml(bedrijfsnaam)}!`,
    `
    <p>Je <strong>${escHtml(tier)}</strong> abonnement is bevestigd. Je kunt nu inloggen
    en je eerste campagne instellen.</p>
    <p>Heb je hulp nodig bij het opzetten? Bekijk onze handleiding in het dashboard.</p>
    `,
    { text: 'Ga naar je dashboard', url: 'https://lokaalkabaal.agency/app' },
  );

  return sendEmail({
    to: email,
    subject: `Welkom bij LokaalKabaal -- ${tier} abonnement bevestigd`,
    html,
  });
}

/** Send campaign activation email */
export async function sendCampaignActivation(
  email: string,
  bedrijfsnaam: string,
  campagneNaam: string,
  pc4Count: number,
): Promise<boolean> {
  const html = buildEmailHtml(
    'Campagne actief!',
    `
    <p>Beste ${escHtml(bedrijfsnaam)}, je campagne <strong>"${escHtml(campagneNaam)}"</strong> is nu actief.
    Flyers worden automatisch verstuurd naar nieuwe bewoners in
    <strong>${pc4Count} postcodegebieden</strong>.</p>
    <p>De eerste verzending vindt plaats op de 25e van de komende maand.</p>
    `,
    { text: 'Bekijk je campagne', url: 'https://lokaalkabaal.agency/app' },
  );

  return sendEmail({
    to: email,
    subject: `Campagne "${campagneNaam}" is actief -- LokaalKabaal`,
    html,
  });
}

/** Send flyer dispatch notification */
export async function sendFlyerDispatchNotification(
  email: string,
  bedrijfsnaam: string,
  aantalFlyers: number,
  maand: string,
): Promise<boolean> {
  const html = buildEmailHtml(
    'Flyers verstuurd!',
    `
    <p>Beste ${escHtml(bedrijfsnaam)}, er zijn <strong>${aantalFlyers} flyers</strong> verstuurd
    in ${maand}. Deze worden binnen 3&ndash;5 werkdagen bezorgd door PostNL.</p>
    <p>Via het dashboard zie je wanneer ontvangers jouw QR-code scannen.</p>
    `,
    { text: 'Bekijk conversies', url: 'https://lokaalkabaal.agency/app' },
  );

  return sendEmail({
    to: email,
    subject: `${aantalFlyers} flyers verstuurd -- ${maand}`,
    html,
  });
}

/**
 * Send a magic login link email to the given address.
 *
 * @param email   - Recipient email address
 * @param token   - One-time login token (stored hashed in DB)
 * @param baseUrl - Origin to build the verify URL from (e.g. https://lokaalkabaal.agency)
 * @returns true if the email was accepted by Resend
 */
export async function sendMagicLink(
  email: string,
  token: string,
  baseUrl: string,
): Promise<boolean> {
  const verifyUrl = `${baseUrl}/api/auth/magic-link/verify?token=${encodeURIComponent(token)}`;

  const html = buildEmailHtml(
    'Inloggen bij LokaalKabaal',
    `
    <p>Je hebt gevraagd om in te loggen bij LokaalKabaal. Klik op de knop hieronder
    om direct toegang te krijgen tot je dashboard.</p>
    <p style="color: #999999; font-size: 13px;">
      Deze link is <strong>15 minuten</strong> geldig. Daarna moet je een nieuwe link aanvragen.
      Als je deze e-mail niet hebt aangevraagd, kun je hem veilig negeren.
    </p>
    `,
    { text: 'Inloggen', url: verifyUrl },
  );

  return sendEmail({
    to: email,
    subject: 'Jouw inloglink voor LokaalKabaal',
    html,
  });
}

/**
 * Send a welcome email after a retailer completes registration.
 *
 * @param email        - Retailer email address
 * @param bedrijfsnaam - Company name for personalisation
 * @returns true if the email was accepted by Resend
 */
export async function sendWelcomeEmail(
  email: string,
  bedrijfsnaam: string,
): Promise<boolean> {
  const html = buildEmailHtml(
    `Welkom bij LokaalKabaal, ${escHtml(bedrijfsnaam)}!`,
    `
    <p>Fijn dat je aan boord bent! Met LokaalKabaal bereik je nieuwe bewoners in jouw
    buurt automatisch met een persoonlijke flyer -- elke maand opnieuw.</p>
    <p><strong>Zo ga je van start in 3 stappen:</strong></p>
    <ol style="padding-left: 20px; margin: 12px 0;">
      <li style="margin-bottom: 8px;">Stel je campagne in: kies postcodes en duur</li>
      <li style="margin-bottom: 8px;">Ontwerp je flyer: gebruik onze AI-assistent of upload je eigen ontwerp</li>
      <li style="margin-bottom: 8px;">Wij doen de rest: elke 25e van de maand worden flyers automatisch gedrukt en verstuurd</li>
    </ol>
    <p>Heb je vragen? Stuur een mail naar
      <a href="mailto:hallo@lokaalkabaal.agency"
         style="color: #00E87A; text-decoration: none;">hallo@lokaalkabaal.agency</a>.
    </p>
    `,
    { text: 'Start je eerste campagne', url: 'https://lokaalkabaal.agency/app' },
  );

  return sendEmail({
    to: email,
    subject: `Welkom bij LokaalKabaal, ${bedrijfsnaam}!`,
    html,
  });
}

/**
 * Notify a retailer that someone scanned the QR code on their flyer.
 *
 * @param retailerEmail  - Retailer email address
 * @param bedrijfsnaam   - Company name for personalisation
 * @param scanCount      - Total scans recorded for this campaign so far
 * @param campagneNaam   - Human-readable campaign name
 * @returns true if the email was accepted by Resend
 */
export async function sendScanNotification(
  retailerEmail: string,
  bedrijfsnaam: string,
  scanCount: number,
  campagneNaam: string,
): Promise<boolean> {
  const statRow = buildStatRow([
    { value: scanCount, label: 'Totaal scans' },
  ]);

  const html = buildEmailHtml(
    'Iemand heeft jouw flyer gescand!',
    `
    <p>Goed nieuws, ${escHtml(bedrijfsnaam)}! Een ontvanger van jouw campagne
    <strong>"${escHtml(campagneNaam)}"</strong> heeft de QR-code op de flyer gescand.</p>
    ${statRow}
    <p>Bekijk het dashboard voor een volledig overzicht van scans en conversies.</p>
    `,
    { text: 'Bekijk conversies', url: 'https://lokaalkabaal.agency/app' },
  );

  return sendEmail({
    to: retailerEmail,
    subject: `Nieuwe scan voor campagne "${campagneNaam}" -- LokaalKabaal`,
    html,
  });
}

/**
 * Send a monthly campaign performance report to a retailer.
 *
 * @param email        - Retailer email address
 * @param bedrijfsnaam - Company name for personalisation
 * @param report       - Aggregated stats for the previous month
 * @returns true if the email was accepted by Resend
 */
export async function sendMonthlyReport(
  email: string,
  bedrijfsnaam: string,
  report: MonthlyReport,
): Promise<boolean> {
  const topPcList = report.topPostcodes.length > 0
    ? `<p><strong>Beste postcodegebieden:</strong> ${report.topPostcodes.join(', ')}</p>`
    : '';

  const statRow = buildStatRow([
    { value: report.flyersSent, label: 'Flyers verstuurd' },
    { value: report.scans, label: 'QR-scans' },
    { value: report.conversions, label: 'Conversies' },
    { value: `${report.conversionRate.toFixed(1)}%`, label: 'Conversieratio' },
  ]);

  const html = buildEmailHtml(
    `Maandrapport voor ${escHtml(bedrijfsnaam)}`,
    `
    <p>Hier is een overzicht van je campagneprestaties van de afgelopen maand.</p>
    ${statRow}
    ${topPcList}
    <p>Wil je je bereik vergroten of een nieuw postcodegebied toevoegen?
    Bekijk de campagne-instellingen in je dashboard.</p>
    `,
    { text: 'Naar mijn dashboard', url: 'https://lokaalkabaal.agency/app' },
  );

  return sendEmail({
    to: email,
    subject: `Maandrapport LokaalKabaal -- ${bedrijfsnaam}`,
    html,
  });
}
