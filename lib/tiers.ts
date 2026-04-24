// Client-safe tier configuratie (geen Drizzle imports)
// Gebruik deze in zowel client- als server-componenten.

export type Tier = 'starter' | 'pro' | 'agency';

export interface TierConfig {
  label: string;
  color: string;
  priceMonthly: number;        // €/maand (maandelijks)
  priceYearly: number;         // €/maand equivalent bij jaarlijks (−15%)
  priceYearlyTotal: number;    // totaal jaarbedrag
  maxCampaigns: number | null; // null = onbeperkt
  maxPc4s: number | null;      // null = onbeperkt; min 40 zodat 300 flyers/mnd haalbaar is
  includedFlyers: number;      // aantal A6 dubbelzijdig flyers per maand inbegrepen
  maxStraalKm: number | null;  // maximale werkgebiedstraal, null = onbeperkt
  // Features
  advancedFilters: boolean;    // bouwjaar, WOZ, energielabel
  followUp: boolean;
  abTesting: boolean;
  personalizedQr: boolean;
  flyerHelp: boolean;
  unlimitedTemplates: boolean;
  conversionDashboard: boolean;
}

// Jaarcontract korting
export const YEARLY_DISCOUNT = 0.15;

// Extra flyers buiten bundel (tot 4999 A6/maand)
export const EXTRA_FLYER_PRICE_A6 = 0.70;

// A5 upgrade toeslag per flyer
export const A5_UPGRADE_PRICE = 0.15;

// Drempel voor custom pricing
export const CUSTOM_PRICING_THRESHOLD = 5000;

export const TIERS: Record<Tier, TierConfig> = {
  starter: {
    label: 'Starter',
    color: '#94a3b8',
    priceMonthly: 349,
    priceYearly: 296.65,        // 349 * 0.85
    priceYearlyTotal: 3559.80,  // 296.65 * 12
    maxCampaigns: 1,
    maxPc4s: 40,
    includedFlyers: 300,
    maxStraalKm: 100,
    advancedFilters: false,
    followUp: false,
    abTesting: false,
    personalizedQr: false,
    flyerHelp: false,
    unlimitedTemplates: true,
    conversionDashboard: true,
  },
  pro: {
    label: 'Pro',
    color: '#60a5fa',
    priceMonthly: 499,
    priceYearly: 424.15,        // 499 * 0.85
    priceYearlyTotal: 5089.80,  // 424.15 * 12
    maxCampaigns: 3,
    maxPc4s: 80,
    includedFlyers: 400,
    maxStraalKm: 200,
    advancedFilters: true,
    followUp: true,
    abTesting: false,
    personalizedQr: true,
    flyerHelp: false,
    unlimitedTemplates: true,
    conversionDashboard: true,
  },
  agency: {
    label: 'Agency',
    color: '#00E87A',
    priceMonthly: 649,
    priceYearly: 551.65,        // 649 * 0.85
    priceYearlyTotal: 6619.80,  // 551.65 * 12
    maxCampaigns: null,
    maxPc4s: null,
    includedFlyers: 500,
    maxStraalKm: null,
    advancedFilters: true,
    followUp: true,
    abTesting: true,
    personalizedQr: true,
    flyerHelp: true,
    unlimitedTemplates: true,
    conversionDashboard: true,
  },
};

// Testaccounts -- voorgedefinieerde accounts voor het testen van de pakketten
export const TEST_ACCOUNTS: { email: string; naam: string; tier: Tier; isJaarcontract: boolean; label: string }[] = [
  {
    email: 'test-starter@lokaalkabaal.nl',
    naam: 'Test Starter',
    tier: 'starter',
    isJaarcontract: false,
    label: 'Starter (maand)',
  },
  {
    email: 'test-starter-jaar@lokaalkabaal.nl',
    naam: 'Test Starter (Jaar)',
    tier: 'starter',
    isJaarcontract: true,
    label: 'Starter + jaarcontract',
  },
  {
    email: 'test-pro@lokaalkabaal.nl',
    naam: 'Test Pro',
    tier: 'pro',
    isJaarcontract: false,
    label: 'Pro (maand)',
  },
  {
    email: 'test-pro-jaar@lokaalkabaal.nl',
    naam: 'Test Pro (Jaar)',
    tier: 'pro',
    isJaarcontract: true,
    label: 'Pro + jaarcontract',
  },
  {
    email: 'test-agency@lokaalkabaal.nl',
    naam: 'Test Agency',
    tier: 'agency',
    isJaarcontract: false,
    label: 'Agency (maand)',
  },
  {
    email: 'test-agency-jaar@lokaalkabaal.nl',
    naam: 'Test Agency (Jaar)',
    tier: 'agency',
    isJaarcontract: true,
    label: 'Agency + jaarcontract',
  },
];

export function isTestAccount(email: string): boolean {
  return TEST_ACCOUNTS.some(a => a.email === email);
}

export function getTestAccount(email: string) {
  return TEST_ACCOUNTS.find(a => a.email === email) ?? null;
}

/**
 * Returns the displayed subscription summary for the campaign wizard: tier
 * label plus the effective monthly price (yearly equivalent when
 * jaarcontract=true, otherwise priceMonthly).
 *
 * Exported separately so step 8 of the wizard and the Stripe checkout path
 * both read the price from the same source of truth.
 */
export function computeAbonnement(
  tier: Tier,
  jaarcontract: boolean,
): { tier: string; base: number; total: number } {
  const cfg = TIERS[tier];
  const monthly = jaarcontract ? cfg.priceYearly : cfg.priceMonthly;
  return { tier: cfg.label, base: monthly, total: monthly };
}

/** Geeft true als het aantal actieve campagnes onder de limiet ligt */
export function canStartCampaign(tier: Tier, activeCampaigns: number): boolean {
  const limit = TIERS[tier].maxCampaigns;
  if (limit === null) return true;
  return activeCampaigns < limit;
}

/** Stripe InvoiceItem create params produced by buildOverageInvoiceItem. */
export interface OverageInvoiceItemParams {
  customer: string;
  amount: number;   // cents
  currency: 'eur';
  description: string;
  metadata: Record<string, string>;
}

/**
 * Build Stripe InvoiceItem parameters for a single month's overage, or null
 * when the retailer stayed inside their bundle (no charge needed).
 *
 * The helper is pure so it can be covered by unit tests; the actual
 * `stripe.invoiceItems.create(...)` call lives in the cron dispatch pipeline
 * where the Stripe SDK is imported.
 *
 * @param customerId     The retailer's Stripe customer id
 * @param tier           Current subscription tier
 * @param flyersThisMonth  Flyers the retailer actually sent this month
 * @param maandLabel     Human-readable month label, e.g. "april 2026"
 */
export function buildOverageInvoiceItem(
  customerId: string,
  tier: Tier,
  flyersThisMonth: number,
  maandLabel: string,
): OverageInvoiceItemParams | null {
  const { overageCount, overageEuros } = calcOverage(tier, flyersThisMonth);
  if (overageCount === 0) return null;
  return {
    customer: customerId,
    amount: Math.round(overageEuros * 100),
    currency: 'eur',
    description: `Extra flyers ${maandLabel}: ${overageCount} x €${EXTRA_FLYER_PRICE_A6.toFixed(2)}`,
    metadata: {
      tier,
      overageCount: String(overageCount),
      maand: maandLabel,
      platform: 'lokaalkabaal',
    },
  };
}

/**
 * Compute overage (flyers above the tier's monthly bundle) and the resulting
 * charge at the €0,70/flyer rate.
 *
 * Intended for downstream Stripe invoice-item creation: pass the number of
 * flyers the retailer actually wants to send in a given month and receive the
 * overage count plus the EUR cost to bill on top of the subscription.
 *
 * @param tier         The retailer's subscription tier
 * @param flyersThisMonth  Total flyers the retailer wants to send this month
 * @returns { overageCount, overageEuros } -- both 0 when within the bundle
 */
export function calcOverage(
  tier: Tier,
  flyersThisMonth: number,
): { overageCount: number; overageEuros: number } {
  const included = TIERS[tier].includedFlyers;
  const overage = Math.max(0, Math.floor(flyersThisMonth) - included);
  // Round to cents to avoid floating-point drift when inserted into Stripe.
  const euros = Math.round(overage * EXTRA_FLYER_PRICE_A6 * 100) / 100;
  return { overageCount: overage, overageEuros: euros };
}
