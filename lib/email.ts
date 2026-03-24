import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = 'LokaalKabaal <noreply@lokaalkabaal.agency>';

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
export async function sendPaymentConfirmation(email: string, bedrijfsnaam: string, tier: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Welkom bij LokaalKabaal -- ${tier} abonnement bevestigd`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <h1 style="font-size: 20px; margin-bottom: 16px;">Welkom, ${bedrijfsnaam}!</h1>
        <p style="color: #444; line-height: 1.7;">
          Je <strong>${tier}</strong> abonnement bij LokaalKabaal is bevestigd. Je kunt nu inloggen
          en je eerste campagne instellen.
        </p>
        <a href="https://lokaalkabaal.agency/app"
           style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #00E87A; color: #0A0A0A; text-decoration: none; border-radius: 6px; font-weight: 700;">
          Ga naar je dashboard
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
          LokaalKabaal -- Automatische flyers naar nieuwe bewoners
        </p>
      </div>
    `,
  });
}

/** Send campaign activation email */
export async function sendCampaignActivation(email: string, bedrijfsnaam: string, campagneNaam: string, pc4Count: number): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Campagne "${campagneNaam}" is actief -- LokaalKabaal`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <h1 style="font-size: 20px; margin-bottom: 16px;">Campagne actief!</h1>
        <p style="color: #444; line-height: 1.7;">
          Beste ${bedrijfsnaam}, je campagne <strong>"${campagneNaam}"</strong> is nu actief.
          Flyers worden automatisch verstuurd naar nieuwe bewoners in ${pc4Count} postcodegebieden.
        </p>
        <p style="color: #444; line-height: 1.7;">
          De eerste verzending vindt plaats op de 25e van de komende maand.
        </p>
        <a href="https://lokaalkabaal.agency/app"
           style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #00E87A; color: #0A0A0A; text-decoration: none; border-radius: 6px; font-weight: 700;">
          Bekijk je campagne
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
          LokaalKabaal -- Automatische flyers naar nieuwe bewoners
        </p>
      </div>
    `,
  });
}

/** Send flyer dispatch notification */
export async function sendFlyerDispatchNotification(email: string, bedrijfsnaam: string, aantalFlyers: number, maand: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `${aantalFlyers} flyers verstuurd -- ${maand}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <h1 style="font-size: 20px; margin-bottom: 16px;">Flyers verstuurd!</h1>
        <p style="color: #444; line-height: 1.7;">
          Beste ${bedrijfsnaam}, er zijn <strong>${aantalFlyers} flyers</strong> verstuurd in ${maand}.
          Deze worden binnen 3-5 werkdagen bezorgd door PostNL.
        </p>
        <a href="https://lokaalkabaal.agency/app"
           style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #00E87A; color: #0A0A0A; text-decoration: none; border-radius: 6px; font-weight: 700;">
          Bekijk conversies
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
          LokaalKabaal -- Automatische flyers naar nieuwe bewoners
        </p>
      </div>
    `,
  });
}
