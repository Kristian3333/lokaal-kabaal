/**
 * Monthly batch dispatch service for LokaalKabaal.
 * Called on the 25th of each month by the Vercel cron job.
 *
 * For each active campaign whose date range includes the current month:
 * 1. Fetch new resident addresses for the campaign's postcodes
 * 2. Generate unique verification codes for each address
 * 3. Create Print.one batch orders
 * 4. Record verification codes in the database
 * 5. Send a dispatch notification email to the retailer
 * 6. Mark the campaign as "afgerond" if this was the final month
 */

import { eq, and, lte, gte } from 'drizzle-orm';
import { requireDb } from '@/lib/db';
import { campaigns, retailers } from '@/lib/schema';
import type { Campaign, Retailer } from '@/lib/schema';
import { getNewResidents } from '@/lib/addresses';
import type { ResidentAddress } from '@/lib/addresses';
import { generateCode, saveVerificationRecords, codeExpiryDate } from '@/lib/codes';
import type { VerificationRecord } from '@/lib/codes';
import {
  createBatch,
  createBatchOrders,
  finalizeBatch,
} from '@/lib/printone';
import type { PrintRecipient, MergeVars } from '@/lib/printone';
import { sendFlyerDispatchNotification } from '@/lib/email';
import { addSurplusCredits } from '@/lib/credits';

/** Summary for a single campaign dispatch run */
export interface CampaignDispatchResult {
  campagneId: string;
  naam: string;
  retailerEmail: string;
  addressesFound: number;
  flyersSent: number;
  creditsIssued: number;
  isLastMonth: boolean;
  error?: string;
}

/** Summary returned by runMonthlyDispatch */
export interface DispatchResult {
  startedAt: string;
  maand: string;
  campaignsProcessed: number;
  totalFlyersSent: number;
  totalCreditsIssued: number;
  errorCount: number;
  campaigns: CampaignDispatchResult[];
}

/** Default sender address for all Print.one orders */
const SENDER_DEFAULT: PrintRecipient = {
  name: 'LokaalKabaal',
  address: 'Postbus 1000',
  city: 'Amsterdam',
  postalCode: '1000 AA',
  country: 'NL',
};

/**
 * Return the first day of the current month as a YYYY-MM-DD string.
 * This is the canonical "batch month" identifier used throughout.
 */
export function currentBatchMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Parse a campaign's pc4Lijst field into an array of trimmed postcode strings.
 *
 * @param pc4Lijst - Comma-separated PC4 codes (may be null/undefined)
 * @returns Array of postcode strings
 */
export function parsePc4Lijst(pc4Lijst: string | null | undefined): string[] {
  if (!pc4Lijst) return [];
  return pc4Lijst.split(',').map((p) => p.trim()).filter(Boolean);
}

/**
 * Determine whether the given month string equals a campaign's eindMaand.
 * Handles date comparison correctly regardless of day component.
 *
 * @param maand - Current batch month (YYYY-MM-DD)
 * @param eindMaand - Campaign end month (YYYY-MM-DD)
 */
export function isLastMonth(maand: string, eindMaand: string): boolean {
  return maand.slice(0, 7) === eindMaand.slice(0, 7);
}

/**
 * Format a YYYY-MM-DD month string for display in Dutch.
 * Example: '2026-03-01' -> 'maart 2026'
 */
export function formatMaandLabel(maand: string): string {
  const date = new Date(maand + 'T00:00:00Z');
  return date.toLocaleDateString('nl-NL', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Dispatch flyers for a single campaign for the given batch month.
 * Handles address lookup, PrintOne batch creation, code storage, and email.
 *
 * @param campagne - The campaign to dispatch for
 * @param retailer - The retailer who owns the campaign
 * @param maand - Batch month string (YYYY-MM-DD)
 * @param now - Current timestamp (for expiry calculations)
 * @returns Campaign dispatch result summary
 */
async function dispatchCampaign(
  campagne: Campaign,
  retailer: Retailer,
  maand: string,
  now: Date,
): Promise<CampaignDispatchResult> {
  const result: CampaignDispatchResult = {
    campagneId: campagne.id,
    naam: campagne.naam,
    retailerEmail: retailer.email,
    addressesFound: 0,
    flyersSent: 0,
    creditsIssued: 0,
    isLastMonth: isLastMonth(maand, campagne.eindMaand),
  };

  const db = requireDb();
  const pc4List = parsePc4Lijst(campagne.pc4Lijst);

  if (pc4List.length === 0) {
    result.error = 'Geen PC4-codes geconfigureerd';
    return result;
  }

  // Step 1: Fetch new resident addresses
  let addresses: ResidentAddress[];
  try {
    addresses = await getNewResidents(pc4List, maand);
  } catch (err) {
    result.error = `Adresopzoekfout: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[dispatch] Address lookup failed for campaign ${campagne.id}:`, err);
    return result;
  }

  result.addressesFound = addresses.length;

  // Cap at expected volume
  if (addresses.length > campagne.verwachtAantalPerMaand) {
    addresses = addresses.slice(0, campagne.verwachtAantalPerMaand);
  }

  // Step 2: Create Print.one batch (if API key + template are configured)
  let batchId: string | null = null;

  if (campagne.flyerTemplateId && process.env.PRINTONE_API_KEY) {
    const batchResult = await createBatch({
      name: `${retailer.bedrijfsnaam} - ${campagne.naam} - ${maand}`,
      templateId: campagne.flyerTemplateId,
      finish: 'GLOSSY',
      sender: {
        name: retailer.bedrijfsnaam,
        address: SENDER_DEFAULT.address,
        city: SENDER_DEFAULT.city,
        postalCode: SENDER_DEFAULT.postalCode,
      },
    });

    if (!batchResult.success) {
      console.error(
        `[dispatch] Print.one batch creation failed for campaign ${campagne.id}: ${batchResult.error}`,
      );
    } else {
      batchId = batchResult.batchId;
    }
  }

  // Step 3: Generate codes and build batch order payloads
  const geldigTot = codeExpiryDate(now);
  const records: VerificationRecord[] = [];
  const recipients: PrintRecipient[] = [];
  const mergeVarsList: MergeVars[] = [];

  for (const addr of addresses) {
    const { code, qrUrl } = generateCode();

    records.push({
      code,
      qrUrl,
      adres: addr.address,
      postcode: addr.postcode,
      stad: addr.city,
      retailerId: campagne.retailerId,
      campagneId: campagne.id,
      overdrachtDatum: addr.overdrachtDatum,
      geldigTot,
      printoneBatchId: batchId ?? undefined,
    });

    recipients.push({
      name: addr.name,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postcode,
      country: 'NL',
    });

    mergeVarsList.push({
      qr_url: qrUrl,
      code,
      adres: addr.address,
      postcode: addr.postcode,
      stad: addr.city,
    });
  }

  // Step 4: Submit orders to Print.one batch and attach order IDs to records
  if (batchId && recipients.length > 0) {
    const orderResults = await createBatchOrders(batchId, recipients, mergeVarsList);

    for (let i = 0; i < orderResults.length; i++) {
      const orderResult = orderResults[i];
      if (orderResult?.orderId) {
        records[i].printoneOrderId = orderResult.orderId;
      }
    }

    await finalizeBatch(batchId);
  }

  // Step 5: Save verification records to DB
  const saved = await saveVerificationRecords(records);
  result.flyersSent = saved;

  // Step 6: Credit ledger -- record surplus flyers (calculated after save)
  const surplusCount = campagne.verwachtAantalPerMaand - saved;
  if (surplusCount > 0) {
    try {
      await addSurplusCredits(campagne.retailerId, campagne.id, campagne.verwachtAantalPerMaand, saved, maand);
      result.creditsIssued = surplusCount;
    } catch (err) {
      console.error(`[dispatch] Credit ledger insert failed for campaign ${campagne.id}:`, err);
    }
  }

  // Step 7: Send dispatch notification email (fire-and-forget)
  if (result.flyersSent > 0) {
    const maandLabel = formatMaandLabel(maand);
    sendFlyerDispatchNotification(
      retailer.email,
      retailer.bedrijfsnaam,
      result.flyersSent,
      maandLabel,
    ).catch((err: unknown) => {
      console.error(`[dispatch] Notification email failed for campaign ${campagne.id}:`, err);
    });
  }

  // Step 8: Mark campaign as completed if this was the final month
  if (result.isLastMonth) {
    const dashboardActiefTot = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0));
    try {
      await Promise.all([
        db
          .update(campaigns)
          .set({ status: 'afgerond', updatedAt: new Date() })
          .where(eq(campaigns.id, campagne.id)),
        db
          .update(retailers)
          .set({ dashboardActiefTot, updatedAt: new Date() })
          .where(eq(retailers.id, campagne.retailerId)),
      ]);
    } catch (err) {
      console.error(`[dispatch] Status update failed for campaign ${campagne.id}:`, err);
    }
  }

  return result;
}

/**
 * Run the monthly batch dispatch for all active campaigns.
 * Called on the 25th of each month via the Vercel cron job.
 *
 * Queries all campaigns with status='actief' where the current month
 * falls between startMaand and eindMaand (inclusive). For each:
 * - Fetches new resident addresses for the target postcodes
 * - Generates verification codes and creates PrintOne orders
 * - Records everything in flyerVerifications
 * - Sends notification email to the retailer
 * - Updates campaign status to 'afgerond' if this is the final month
 *
 * A failure in one campaign never stops processing of others.
 *
 * @returns Summary of what was dispatched
 */
export async function runMonthlyDispatch(): Promise<DispatchResult> {
  const now = new Date();
  const maand = currentBatchMonth();
  const db = requireDb();

  const started = now.toISOString();

  // Fetch all active campaigns in scope for this batch month
  const activeCampaigns = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.status, 'actief'),
        lte(campaigns.startMaand, maand),
        gte(campaigns.eindMaand, maand),
      ),
    );

  const campaignResults: CampaignDispatchResult[] = [];

  for (const campagne of activeCampaigns) {
    // Fetch retailer for email and branding
    const retailerRows = await db
      .select()
      .from(retailers)
      .where(eq(retailers.id, campagne.retailerId))
      .limit(1);

    const retailer = retailerRows[0];

    if (!retailer) {
      console.error(`[dispatch] Retailer not found for campaign ${campagne.id}`);
      campaignResults.push({
        campagneId: campagne.id,
        naam: campagne.naam,
        retailerEmail: '',
        addressesFound: 0,
        flyersSent: 0,
        creditsIssued: 0,
        isLastMonth: isLastMonth(maand, campagne.eindMaand),
        error: 'Retailer niet gevonden',
      });
      continue;
    }

    try {
      const result = await dispatchCampaign(campagne, retailer, maand, now);
      campaignResults.push(result);
    } catch (err) {
      console.error(`[dispatch] Unhandled error for campaign ${campagne.id}:`, err);
      campaignResults.push({
        campagneId: campagne.id,
        naam: campagne.naam,
        retailerEmail: retailer.email,
        addressesFound: 0,
        flyersSent: 0,
        creditsIssued: 0,
        isLastMonth: isLastMonth(maand, campagne.eindMaand),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    startedAt: started,
    maand,
    campaignsProcessed: activeCampaigns.length,
    totalFlyersSent: campaignResults.reduce((s, r) => s + r.flyersSent, 0),
    totalCreditsIssued: campaignResults.reduce((s, r) => s + r.creditsIssued, 0),
    errorCount: campaignResults.filter((r) => r.error != null).length,
    campaigns: campaignResults,
  };
}
