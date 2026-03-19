// Client-safe tier configuratie (geen Drizzle imports)
// Gebruik deze in zowel client- als server-componenten.

export type Tier = 'buurt' | 'wijk' | 'stad';

export interface TierConfig {
  label: string;
  color: string;
  maxPc4s: number | null;   // null = onbeperkt
  priceMonthly: number;
  priceYearly: number;
  minFlyers: number;
  // Features
  followUp: boolean;
  abTesting: boolean;
  abTestMinFlyers: number;  // per variant
  exclusivity: boolean;
  personalizedQr: boolean;
  flyerHelp: boolean;       // alleen bij jaarcontract
  unlimitedTemplates: boolean;
  conversionDashboard: boolean;
}

export const TIERS: Record<Tier, TierConfig> = {
  buurt: {
    label: 'Buurt',
    color: '#94a3b8',
    maxPc4s: 10,
    priceMonthly: 249,
    priceYearly: 187,
    minFlyers: 300,
    followUp: true,        // alleen bij jaarcontract · gereduceerd tarief
    abTesting: false,
    abTestMinFlyers: 300,
    exclusivity: false,
    personalizedQr: false,
    flyerHelp: false,
    unlimitedTemplates: true,
    conversionDashboard: true,
  },
  wijk: {
    label: 'Wijk',
    color: '#60a5fa',
    maxPc4s: 50,
    priceMonthly: 499,
    priceYearly: 374,
    minFlyers: 300,
    followUp: true,        // alleen bij jaarcontract (isJaarcontract === true)
    abTesting: false,
    abTestMinFlyers: 300,
    exclusivity: false,
    personalizedQr: true,
    flyerHelp: false,
    unlimitedTemplates: true,
    conversionDashboard: true,
  },
  stad: {
    label: 'Stad',
    color: '#00E87A',
    maxPc4s: null,
    priceMonthly: 999,
    priceYearly: 749,
    minFlyers: 300,
    followUp: true,        // alleen bij jaarcontract (isJaarcontract === true)
    abTesting: true,
    abTestMinFlyers: 300,
    exclusivity: true,
    personalizedQr: true,
    flyerHelp: true,       // alleen bij jaarcontract
    unlimitedTemplates: true,
    conversionDashboard: true,
  },
};

// Testaccounts — voorgedefinieerde accounts voor het testen van de pakketten
export const TEST_ACCOUNTS: { email: string; naam: string; tier: Tier; isJaarcontract: boolean; label: string }[] = [
  {
    email: 'test-buurt@lokaalkabaal.nl',
    naam: 'Test Buurt',
    tier: 'buurt',
    isJaarcontract: false,
    label: 'Buurt (maand)',
  },
  {
    email: 'test-buurt-jaar@lokaalkabaal.nl',
    naam: 'Test Buurt (Jaar)',
    tier: 'buurt',
    isJaarcontract: true,
    label: 'Buurt + jaarcontract',
  },
  {
    email: 'test-wijk@lokaalkabaal.nl',
    naam: 'Test Wijk',
    tier: 'wijk',
    isJaarcontract: false,
    label: 'Wijk (maand)',
  },
  {
    email: 'test-stad@lokaalkabaal.nl',
    naam: 'Test Stad',
    tier: 'stad',
    isJaarcontract: false,
    label: 'Stad (maand)',
  },
  {
    email: 'test-stad-jaar@lokaalkabaal.nl',
    naam: 'Test Stad (Jaar)',
    tier: 'stad',
    isJaarcontract: true,
    label: 'Stad + jaarcontract',
  },
];

export function isTestAccount(email: string): boolean {
  return TEST_ACCOUNTS.some(a => a.email === email);
}

export function getTestAccount(email: string) {
  return TEST_ACCOUNTS.find(a => a.email === email) ?? null;
}
