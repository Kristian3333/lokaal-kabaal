/**
 * PrintOne API abstraction layer for batch flyer orders.
 * Wraps Print.one v2 API calls with concurrency control
 * and structured return types.
 *
 * PrintOne API key: PRINTONE_API_KEY environment variable.
 */

const PRINTONE_BASE = 'https://api.print.one/v2';

/** A print recipient's address */
export interface PrintRecipient {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
}

/** Merge variables injected into the flyer template */
export interface MergeVars {
  qr_url: string;
  code: string;
  adres: string;
  postcode: string;
  stad: string;
  [key: string]: string;
}

/** Result from placing a single order within a batch */
export interface OrderResult {
  orderId: string | null;
  success: boolean;
  error?: string;
}

/** Result from creating a new Print.one batch */
export interface BatchResult {
  batchId: string | null;
  success: boolean;
  error?: string;
}

/** Raw Print.one API response type */
interface PrintOneResponse {
  id?: string;
  message?: string | string[];
  errors?: string[];
}

/**
 * Make an authenticated request to the Print.one API.
 *
 * @param path - API path (e.g. '/batches')
 * @param method - HTTP method
 * @param body - Optional JSON body
 * @returns Response object with ok flag, status code, and parsed data
 */
async function po<T extends PrintOneResponse>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: T }> {
  const key = process.env.PRINTONE_API_KEY ?? '';
  try {
    const res = await fetch(`${PRINTONE_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
      },
      ...(body != null ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data: data as T };
  } catch (err) {
    console.error(`[printone] ${method} ${path} failed:`, err);
    return { ok: false, status: 0, data: {} as T };
  }
}

/**
 * Extract a human-readable error message from a Print.one response.
 *
 * @param data - The API response data
 * @param fallback - Default message if none found
 */
function extractErrorMessage(data: PrintOneResponse, fallback: string): string {
  if (Array.isArray(data.message)) return data.message.join(', ');
  if (typeof data.message === 'string') return data.message;
  return fallback;
}

/**
 * Create a Print.one batch for a given template and finish type.
 * A batch groups many recipient orders under a single template.
 *
 * @param params - Batch creation parameters
 * @returns BatchResult with batchId on success
 */
export async function createBatch(params: {
  name: string;
  templateId: string;
  finish?: string;
  sender?: PrintRecipient;
  sendDate?: string;
}): Promise<BatchResult> {
  if (!process.env.PRINTONE_API_KEY) {
    console.error('[printone] PRINTONE_API_KEY not configured -- batch creation skipped');
    return { batchId: null, success: false, error: 'API key not configured' };
  }

  const result = await po<PrintOneResponse>('/batches', 'POST', {
    name: params.name,
    templateId: params.templateId,
    finish: params.finish ?? 'GLOSSY',
    ready: params.sendDate ?? null,
    requiredCount: 300,
    ...(params.sender ? {
      sender: { ...params.sender, country: params.sender.country ?? 'NL' },
    } : {}),
  });

  if (!result.ok) {
    const msg = extractErrorMessage(result.data, 'batch aanmaken mislukt');
    console.error(`[printone] createBatch failed (${result.status}): ${msg}`);
    return { batchId: null, success: false, error: msg };
  }

  return { batchId: result.data.id ?? null, success: true };
}

/**
 * Add a single recipient order to an existing Print.one batch.
 *
 * @param batchId - The batch to add the order to
 * @param recipient - The recipient's address information
 * @param mergeVariables - Template merge variables for personalization
 * @returns OrderResult with orderId on success
 */
export async function addOrderToBatch(
  batchId: string,
  recipient: PrintRecipient,
  mergeVariables: MergeVars,
): Promise<OrderResult> {
  if (!process.env.PRINTONE_API_KEY) {
    return { orderId: null, success: false, error: 'API key not configured' };
  }

  const result = await po<PrintOneResponse>(
    `/batches/${batchId}/orders`,
    'POST',
    {
      recipient: { ...recipient, country: recipient.country ?? 'NL' },
      mergeVariables,
    },
  );

  if (!result.ok) {
    const msg = extractErrorMessage(result.data, 'order toevoegen mislukt');
    console.error(`[printone] addOrderToBatch failed for batch ${batchId} (${result.status}): ${msg}`);
    return { orderId: null, success: false, error: msg };
  }

  return { orderId: result.data.id ?? null, success: true };
}

/**
 * Finalize a batch, signaling Print.one to begin printing and mailing.
 *
 * @param batchId - The batch to finalize
 * @returns True if finalized successfully
 */
export async function finalizeBatch(batchId: string): Promise<boolean> {
  if (!process.env.PRINTONE_API_KEY) {
    console.error('[printone] PRINTONE_API_KEY not configured -- batch finalization skipped');
    return false;
  }

  const result = await po<PrintOneResponse>(`/batches/${batchId}`, 'PATCH', {
    ready: true,
  });

  if (!result.ok) {
    const msg = extractErrorMessage(result.data, 'batch finaliseren mislukt');
    console.error(`[printone] finalizeBatch failed for ${batchId} (${result.status}): ${msg}`);
    return false;
  }

  return true;
}

/**
 * Create batch orders for a list of recipients under a single template.
 * Processes recipients with limited concurrency to avoid rate limiting.
 * Each recipient gets their own merge variables (address, QR code, etc.).
 *
 * @param batchId - The Print.one batch to add orders to
 * @param recipients - List of recipients
 * @param mergeVarsList - Merge variables for each recipient (parallel array)
 * @param concurrency - Max concurrent API calls (default: 5)
 * @returns Array of order results, one per recipient
 */
export async function createBatchOrders(
  batchId: string,
  recipients: PrintRecipient[],
  mergeVarsList: MergeVars[],
  concurrency = 5,
): Promise<OrderResult[]> {
  if (recipients.length !== mergeVarsList.length) {
    throw new Error(
      `recipients (${recipients.length}) and mergeVarsList (${mergeVarsList.length}) must have equal length`,
    );
  }

  const results: OrderResult[] = new Array(recipients.length).fill(null);
  let index = 0;

  async function processNext(): Promise<void> {
    if (index >= recipients.length) return;
    const i = index++;
    results[i] = await addOrderToBatch(batchId, recipients[i], mergeVarsList[i]);
    await processNext();
  }

  const workers = Array.from(
    { length: Math.min(concurrency, recipients.length) },
    processNext,
  );
  await Promise.all(workers);

  return results;
}
