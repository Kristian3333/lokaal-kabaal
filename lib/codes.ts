/**
 * Verification code generation and storage for flyer QR tracking.
 * Codes are 8-character alphanumeric strings using a human-readable alphabet
 * (no 0/O or 1/I confusion).
 */

import { requireDb } from '@/lib/db';
import { flyerVerifications } from '@/lib/schema';
import { generateVerificationCode, buildQRUrl } from '@/lib/verification';
import type { ResidentAddress } from '@/lib/addresses';

/** A generated verification code with its QR URL */
export interface GeneratedCode {
  code: string;
  qrUrl: string;
}

/** All data needed to create a flyer verification record */
export interface VerificationRecord {
  code: string;
  qrUrl: string;
  adres: string;
  postcode: string;
  stad: string;
  retailerId: string;
  campagneId: string;
  overdrachtDatum: string;
  geldigTot: Date;
  printoneBatchId?: string;
  printoneOrderId?: string;
}

/**
 * Generate a single unique verification code and its QR URL.
 * Thin wrapper over verification.ts to keep code generation
 * logic in one place.
 *
 * @returns Object with code and QR URL
 */
export function generateCode(): GeneratedCode {
  const code = generateVerificationCode();
  return { code, qrUrl: buildQRUrl(code) };
}

/**
 * Generate verification codes for a batch of resident addresses.
 * Returns a list of code+qrUrl pairs, one per address.
 *
 * @param addresses - The resident addresses to generate codes for
 * @returns Array of GeneratedCode objects
 */
export function generateCodesForAddresses(
  addresses: ResidentAddress[],
): GeneratedCode[] {
  return addresses.map(() => generateCode());
}

/**
 * Persist a batch of flyer verification records to the database.
 * Inserts all records in a single statement where possible.
 * Returns the count of successfully inserted records.
 *
 * @param records - Verification records to insert
 * @returns Number of records successfully inserted
 */
export async function saveVerificationRecords(
  records: VerificationRecord[],
): Promise<number> {
  if (records.length === 0) return 0;

  const db = requireDb();

  const values = records.map((record) => ({
    code: record.code,
    adres: record.adres,
    postcode: record.postcode,
    stad: record.stad,
    retailerId: record.retailerId,
    campagneId: record.campagneId,
    overdrachtDatum: record.overdrachtDatum,
    geldigTot: record.geldigTot,
    printoneBatchId: record.printoneBatchId,
    printoneOrderId: record.printoneOrderId,
  }));

  // Batch insert in chunks of 100 to avoid query size limits
  const CHUNK_SIZE = 100;
  let saved = 0;

  for (let i = 0; i < values.length; i += CHUNK_SIZE) {
    const chunk = values.slice(i, i + CHUNK_SIZE);
    try {
      await db.insert(flyerVerifications).values(chunk);
      saved += chunk.length;
    } catch (err) {
      console.error(
        `[codes] Failed to save verification batch (offset=${i}, size=${chunk.length}):`,
        err,
      );
    }
  }

  return saved;
}

/**
 * Calculate the expiry date for a verification code.
 * Codes are valid for 30 days from the dispatch date.
 *
 * @param fromDate - The date the flyer was dispatched
 * @returns Expiry date 30 days later
 */
export function codeExpiryDate(fromDate: Date): Date {
  return new Date(fromDate.getTime() + 30 * 24 * 60 * 60 * 1000);
}
