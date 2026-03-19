import {
  pgTable, uuid, varchar, boolean, timestamp, date, index,
  integer, text, pgEnum,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tierEnum = pgEnum('tier', ['buurt', 'wijk', 'stad']);
export const abTestStatusEnum = pgEnum('ab_test_status', ['actief', 'gestopt', 'afgerond']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['actief', 'gepauzeerd', 'geannuleerd', 'proef']);

// ─── Retailers (klanten) ──────────────────────────────────────────────────────

export const retailers = pgTable('retailers', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  email:                varchar('email', { length: 255 }).unique().notNull(),
  bedrijfsnaam:         varchar('bedrijfsnaam', { length: 255 }).notNull(),
  branche:              varchar('branche', { length: 100 }).notNull(),
  stripeCustomerId:     varchar('stripe_customer_id', { length: 100 }).unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }).unique(),
  tier:                 tierEnum('tier').default('buurt').notNull(),
  subscriptionStatus:   subscriptionStatusEnum('subscription_status').default('proef').notNull(),
  // Jaarcontract vlag — bepaalt of persoonlijke flyerhulp beschikbaar is (Stad)
  isJaarcontract:       boolean('is_jaarcontract').default(false).notNull(),
  // Factureringsperiode start/eind voor huidig abonnement
  periodeStart:         timestamp('periode_start'),
  periodeEind:          timestamp('periode_eind'),
  createdAt:            timestamp('created_at').defaultNow().notNull(),
  updatedAt:            timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  emailIdx:    index('idx_retailers_email').on(t.email),
  stripeIdx:   index('idx_retailers_stripe_sub').on(t.stripeSubscriptionId),
}));

// ─── Retailer actieve postcodes ───────────────────────────────────────────────

export const retailerPostcodes = pgTable('retailer_postcodes', {
  id:         uuid('id').primaryKey().defaultRandom(),
  retailerId: uuid('retailer_id').notNull().references(() => retailers.id, { onDelete: 'cascade' }),
  pc4:        varchar('pc4', { length: 4 }).notNull(),
  actief:     boolean('actief').default(true).notNull(),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  retailerIdx: index('idx_rp_retailer').on(t.retailerId),
  pc4Idx:      index('idx_rp_pc4').on(t.pc4),
}));

// ─── Exclusiviteit per postcode + branche (alleen Stad-tier) ─────────────────
//
// Wanneer een Stad-klant postcodes claimt, registreren we dit hier.
// Bij een nieuwe Stad-aanmelding checken we of de combinatie pc4+branche
// al bezet is voor de gewenste periode. Als bezet, tonen we een melding:
//   "Postcodegebied XXXX is bezet door een concurrent in [branche]
//    van [startDatum] t/m [eindDatum]."

export const pc4Exclusivity = pgTable('pc4_exclusivity', {
  id:         uuid('id').primaryKey().defaultRandom(),
  pc4:        varchar('pc4', { length: 4 }).notNull(),
  branche:    varchar('branche', { length: 100 }).notNull(),
  retailerId: uuid('retailer_id').notNull().references(() => retailers.id, { onDelete: 'cascade' }),
  startDatum: date('start_datum').notNull(),
  eindDatum:  date('eind_datum'),              // null = onbeperkt actief
  actief:     boolean('actief').default(true).notNull(),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pc4BrancheIdx: index('idx_excl_pc4_branche').on(t.pc4, t.branche),
  retailerIdx:   index('idx_excl_retailer').on(t.retailerId),
}));

// ─── A/B testen (alleen Stad-tier) ───────────────────────────────────────────
//
// Elke A/B test heeft minimaal 300 flyers per variant (600 totaal).
// De twee varianten worden willekeurig toegewezen aan ontvangende adressen.

export const abTests = pgTable('ab_tests', {
  id:               uuid('id').primaryKey().defaultRandom(),
  retailerId:       uuid('retailer_id').notNull().references(() => retailers.id, { onDelete: 'cascade' }),
  naam:             varchar('naam', { length: 255 }).notNull(),
  // Template-identifiers (bijv. Vercel Blob URL of template naam)
  variantANaam:     varchar('variant_a_naam', { length: 255 }).notNull(),
  variantBNaam:     varchar('variant_b_naam', { length: 255 }).notNull(),
  status:           abTestStatusEnum('status').default('actief').notNull(),
  // Tellingen (worden geüpdated bij elke flyer-verzending en elke scan)
  aantalA:          integer('aantal_a').default(0).notNull(),
  aantalB:          integer('aantal_b').default(0).notNull(),
  scansA:           integer('scans_a').default(0).notNull(),
  scansB:           integer('scans_b').default(0).notNull(),
  startDatum:       timestamp('start_datum').defaultNow().notNull(),
  eindDatum:        timestamp('eind_datum'),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  retailerIdx: index('idx_ab_retailer').on(t.retailerId),
}));

// ─── Flyer Verifications (QR-code tracking) ───────────────────────────────────

export const flyerVerifications = pgTable('flyer_verifications', {
  id:              uuid('id').primaryKey().defaultRandom(),
  code:            varchar('code', { length: 10 }).unique().notNull(),
  adres:           varchar('adres', { length: 255 }).notNull(),
  postcode:        varchar('postcode', { length: 10 }).notNull(),
  stad:            varchar('stad', { length: 100 }).notNull(),
  retailerId:      uuid('retailer_id').notNull(),
  campagneId:      varchar('campagne_id', { length: 100 }).notNull(),
  overdrachtDatum: date('overdracht_datum').notNull(),
  verzondenOp:     timestamp('verzonden_op').defaultNow().notNull(),
  geldigTot:       timestamp('geldig_tot').notNull(),
  gebruikt:        boolean('gebruikt').default(false).notNull(),
  gebruiktOp:      timestamp('gebruikt_op'),
  // Follow-up flyer (Wijk + Stad): tweede flyer verstuurd na 30 dagen als QR ongebruikt
  followUpVerzonden: boolean('follow_up_verzonden').default(false).notNull(),
  followUpOp:        timestamp('follow_up_op'),
  // A/B test koppeling (alleen Stad-tier)
  abTestId:        uuid('ab_test_id').references(() => abTests.id),
  abTestVariant:   varchar('ab_test_variant', { length: 1 }),  // 'A' of 'B'
  createdAt:       timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  codeIdx:      index('idx_fv_code').on(t.code),
  retailerIdx:  index('idx_fv_retailer').on(t.retailerId),
  campagneIdx:  index('idx_fv_campagne').on(t.campagneId),
  abTestIdx:    index('idx_fv_ab_test').on(t.abTestId),
  followUpIdx:  index('idx_fv_follow_up').on(t.gebruikt, t.followUpVerzonden, t.verzondenOp),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type Retailer = typeof retailers.$inferSelect;
export type NewRetailer = typeof retailers.$inferInsert;
export type RetailerPostcode = typeof retailerPostcodes.$inferSelect;
export type Pc4Exclusivity = typeof pc4Exclusivity.$inferSelect;
export type AbTest = typeof abTests.$inferSelect;
export type NewAbTest = typeof abTests.$inferInsert;
export type FlyerVerification = typeof flyerVerifications.$inferSelect;
export type NewFlyerVerification = typeof flyerVerifications.$inferInsert;

// ─── Feature-gating helpers ───────────────────────────────────────────────────
//
// Gebruik deze functies in API routes en het dashboard om te controleren
// welke features een klant heeft op basis van hun tier.

export const TIER_LIMITS = {
  buurt: {
    maxPc4s:          10,
    minFlyers:        300,
    followUp:         false,
    abTesting:        false,
    exclusivity:      false,
    personalizedQr:   false,  // basis QR-tracking
    flyerHelp:        false,
    unlimitedTemplates: true,
  },
  wijk: {
    maxPc4s:          50,
    minFlyers:        300,
    followUp:         true,   // alleen bij jaarcontract · kostprijs print.one (€0,69/stuk 300+ of €1,52 klein)
    abTesting:        false,
    exclusivity:      false,
    personalizedQr:   true,   // gepersonaliseerde welkomstpagina bij QR-scan
    flyerHelp:        false,
    unlimitedTemplates: true,
  },
  stad: {
    maxPc4s:          Infinity,
    minFlyers:        300,    // minimum per batch; A/B test vereist 600 (300+300)
    followUp:         true,   // alleen bij jaarcontract · kostprijs print.one
    abTesting:        true,
    exclusivity:      true,
    personalizedQr:   true,
    flyerHelp:        true,   // alleen bij jaarcontract
    unlimitedTemplates: true,
  },
} as const;

export type Tier = keyof typeof TIER_LIMITS;

export function canUseFeature<F extends keyof typeof TIER_LIMITS.buurt>(
  tier: Tier,
  feature: F,
): boolean {
  return TIER_LIMITS[tier][feature] as boolean;
}
