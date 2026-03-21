// Client-safe tier configuratie (geen Drizzle imports)
// Gebruik deze in zowel client- als server-componenten.

export type Tier = 'starter' | 'pro' | 'agency';

export interface TierConfig {
  label: string;
  color: string;
  priceMonthly: number;        // €/maand (maandelijks)
  priceYearly: number;         // €/maand equivalent bij jaarlijks (−25%)
  priceYearlyTotal: number;    // totaal jaarbedrag
  maxCampaigns: number | null; // null = onbeperkt
  maxPc4s: number | null;      // null = onbeperkt; min 40 zodat 300 flyers/mnd haalbaar is
  // Features
  advancedFilters: boolean;    // bouwjaar, WOZ, energielabel
  followUp: boolean;
  abTesting: boolean;
  personalizedQr: boolean;
  flyerHelp: boolean;
  unlimitedTemplates: boolean;
  conversionDashboard: boolean;
}

export const TIERS: Record<Tier, TierConfig> = {
  starter: {
    label: 'Starter',
    color: '#94a3b8',
    priceMonthly: 99,
    priceYearly: 74.25,         // 99 * 0.75
    priceYearlyTotal: 891,      // 74.25 * 12
    maxCampaigns: 1,
    maxPc4s: 40,                // ~300 flyers/mnd bij gemiddeld 7–8 overdrachten/pc4
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
    priceMonthly: 199,
    priceYearly: 149.25,        // 199 * 0.75
    priceYearlyTotal: 1791,     // 149.25 * 12
    maxCampaigns: 3,
    maxPc4s: 80,
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
    priceMonthly: 499,
    priceYearly: 374.25,        // 499 * 0.75
    priceYearlyTotal: 4491,     // 374.25 * 12
    maxCampaigns: null,
    maxPc4s: null,              // onbeperkt
    advancedFilters: true,
    followUp: true,
    abTesting: true,
    personalizedQr: true,
    flyerHelp: true,
    unlimitedTemplates: true,
    conversionDashboard: true,
  },
};

// Testaccounts — voorgedefinieerde accounts voor het testen van de pakketten
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

/** Geeft true als het aantal actieve campagnes onder de limiet ligt */
export function canStartCampaign(tier: Tier, activeCampaigns: number): boolean {
  const limit = TIERS[tier].maxCampaigns;
  if (limit === null) return true;
  return activeCampaigns < limit;
}
