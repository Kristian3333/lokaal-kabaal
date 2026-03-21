import {
  pgTable, uuid, varchar, boolean, timestamp, date, index,
  integer, pgEnum, numeric, smallint,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────

// MIGRATIE VEREIST: tier enum is gewijzigd van 'buurt'|'wijk'|'stad' naar 'starter'|'pro'|'agency'
export const tierEnum = pgEnum('tier', ['starter', 'pro', 'agency']);
export const abTestStatusEnum = pgEnum('ab_test_status', ['actief', 'gestopt', 'afgerond']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['actief', 'gepauzeerd', 'geannuleerd', 'proef']);
export const campaignStatusEnum = pgEnum('campaign_status', ['concept', 'actief', 'gepauzeerd', 'afgerond', 'geannuleerd']);
export const creditRedenEnum = pgEnum('credit_reden', ['surplus', 'annulering', 'aanpassing', 'uitbetaling']);

// ─── Retailers (klanten) ──────────────────────────────────────────────────────

export const retailers = pgTable('retailers', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  email:                varchar('email', { length: 255 }).unique().notNull(),
  bedrijfsnaam:         varchar('bedrijfsnaam', { length: 255 }).notNull(),
  branche:              varchar('branche', { length: 100 }).notNull(),
  stripeCustomerId:     varchar('stripe_customer_id', { length: 100 }).unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }).unique(),
  tier:                 tierEnum('tier').default('starter').notNull(),
  subscriptionStatus:   subscriptionStatusEnum('subscription_status').default('proef').notNull(),
  isJaarcontract:       boolean('is_jaarcontract').default(false).notNull(),
  periodeStart:         timestamp('periode_start'),
  periodeEind:          timestamp('periode_eind'),
  // Dashboard lifecycle: actief t/m 1 maand na laatste batch
  dashboardActiefTot:   timestamp('dashboard_actief_tot'),
  createdAt:            timestamp('created_at').defaultNow().notNull(),
  updatedAt:            timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  emailIdx:    index('idx_retailers_email').on(t.email),
  stripeIdx:   index('idx_retailers_stripe_sub').on(t.stripeSubscriptionId),
}));

// ─── Campagnes ────────────────────────────────────────────────────────────────
//
// Elke campagne heeft een duur (1–24 maanden), een werkgebied, een formaat
// en optionele targeting-filters (Pro/Agency).
// Flyers worden elke 25e van de maand verstuurd.
// Na de laatste batch blijft het dashboard 1 maand actief.

export const campaigns = pgTable('campaigns', {
  id:               uuid('id').primaryKey().defaultRandom(),
  retailerId:       uuid('retailer_id').notNull().references(() => retailers.id, { onDelete: 'cascade' }),
  naam:             varchar('naam', { length: 255 }).notNull(),
  branche:          varchar('branche', { length: 100 }).notNull(),
  status:           campaignStatusEnum('status').default('concept').notNull(),

  // Werkgebied
  centrum:          varchar('centrum', { length: 255 }).notNull(),
  straalKm:         numeric('straal_km', { precision: 6, scale: 2 }).notNull(),
  pc4Lijst:         varchar('pc4_lijst', { length: 4000 }),          // kommagescheiden pc4's

  // Flyer instellingen
  formaat:          varchar('formaat', { length: 5 }).notNull().default('a6'),   // 'a6' | 'a5' | 'sq'
  dubbelzijdig:     boolean('dubbelzijdig').default(false).notNull(),
  flyerTemplateId:  varchar('flyer_template_id', { length: 255 }),

  // Volume & duur
  verwachtAantalPerMaand: integer('verwacht_aantal_per_maand').notNull(),
  duurMaanden:      smallint('duur_maanden').notNull().default(1),   // 1–24

  // Startdatum + berekende einddatum
  startMaand:       date('start_maand').notNull(),                   // eerste batch op de 25e van deze maand
  eindMaand:        date('eind_maand').notNull(),                    // laatste batch op de 25e van deze maand

  // Targeting-filters (Pro/Agency only)
  filterBouwjaarMin:  smallint('filter_bouwjaar_min'),               // bijv. 1900
  filterBouwjaarMax:  smallint('filter_bouwjaar_max'),               // bijv. 2024
  filterWozMin:       integer('filter_woz_min'),                     // in € (bijv. 150000)
  filterWozMax:       integer('filter_woz_max'),                     // in € (bijv. 1500000)
  filterEnergielabel: varchar('filter_energielabel', { length: 50 }), // kommagescheiden, bijv. 'A,B,C'

  // Stripe koppeling
  stripeSubscriptionItemId: varchar('stripe_subscription_item_id', { length: 100 }),

  createdAt:        timestamp('created_at').defaultNow().notNull(),
  updatedAt:        timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  retailerIdx: index('idx_campaigns_retailer').on(t.retailerId),
  statusIdx:   index('idx_campaigns_status').on(t.status),
}));

// ─── Credit-ledger ────────────────────────────────────────────────────────────
//
// Credits = flyers die betaald zijn maar niet (of nog niet) verzonden.
// Worden automatisch toegepast in de maand na de laatste campagnemaand.
// Credits verlopen niet binnen dit window.

export const creditLedger = pgTable('credit_ledger', {
  id:          uuid('id').primaryKey().defaultRandom(),
  retailerId:  uuid('retailer_id').notNull().references(() => retailers.id, { onDelete: 'cascade' }),
  campagneId:  uuid('campagne_id').references(() => campaigns.id, { onDelete: 'set null' }),
  reden:       creditRedenEnum('reden').notNull(),
  aantalFlyers: integer('aantal_flyers').notNull(),                  // positief = surplus, negatief = verbruikt
  maand:       date('maand').notNull(),                             // de maand waarop dit geldt
  toelichting: varchar('toelichting', { length: 500 }),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  retailerIdx: index('idx_credits_retailer').on(t.retailerId),
  maandIdx:    index('idx_credits_maand').on(t.maand),
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

// ─── A/B testen (alleen Agency-tier) ─────────────────────────────────────────

export const abTests = pgTable('ab_tests', {
  id:               uuid('id').primaryKey().defaultRandom(),
  retailerId:       uuid('retailer_id').notNull().references(() => retailers.id, { onDelete: 'cascade' }),
  campagneId:       uuid('campagne_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  naam:             varchar('naam', { length: 255 }).notNull(),
  variantANaam:     varchar('variant_a_naam', { length: 255 }).notNull(),
  variantBNaam:     varchar('variant_b_naam', { length: 255 }).notNull(),
  status:           abTestStatusEnum('status').default('actief').notNull(),
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
  // QR-scan tracking: interesse = consument scant, conversie = bedrijf scant bij kassa
  interesseOp:     timestamp('interesse_op'),
  conversieOp:     timestamp('conversie_op'),
  followUpVerzonden: boolean('follow_up_verzonden').default(false).notNull(),
  followUpOp:        timestamp('follow_up_op'),
  abTestId:        uuid('ab_test_id').references(() => abTests.id),
  abTestVariant:   varchar('ab_test_variant', { length: 1 }),
  // Print.one batch tracking
  printoneBatchId: varchar('printone_batch_id', { length: 100 }),
  printoneOrderId: varchar('printone_order_id', { length: 100 }),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  codeIdx:      index('idx_fv_code').on(t.code),
  retailerIdx:  index('idx_fv_retailer').on(t.retailerId),
  campagneIdx:  index('idx_fv_campagne').on(t.campagneId),
  abTestIdx:    index('idx_fv_ab_test').on(t.abTestId),
  followUpIdx:  index('idx_fv_follow_up').on(t.gebruikt, t.followUpVerzonden, t.verzondenOp),
}));

// ─── PC4-exclusiviteit (alleen Agency-tier) ───────────────────────────────────

export const pc4Exclusivity = pgTable('pc4_exclusivity', {
  id:          uuid('id').primaryKey().defaultRandom(),
  retailerId:  uuid('retailer_id').notNull().references(() => retailers.id, { onDelete: 'cascade' }),
  pc4:         varchar('pc4', { length: 4 }).notNull(),
  branche:     varchar('branche', { length: 100 }).notNull(),
  vanMaand:    date('van_maand').notNull(),
  totMaand:    date('tot_maand').notNull(),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pc4Idx:     index('idx_excl_pc4').on(t.pc4),
  brancheIdx: index('idx_excl_branche').on(t.branche),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type Retailer = typeof retailers.$inferSelect;
export type NewRetailer = typeof retailers.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type CreditEntry = typeof creditLedger.$inferSelect;
export type NewCreditEntry = typeof creditLedger.$inferInsert;
export type RetailerPostcode = typeof retailerPostcodes.$inferSelect;
export type AbTest = typeof abTests.$inferSelect;
export type NewAbTest = typeof abTests.$inferInsert;
export type FlyerVerification = typeof flyerVerifications.$inferSelect;
export type NewFlyerVerification = typeof flyerVerifications.$inferInsert;

// ─── Feature-gating helpers ───────────────────────────────────────────────────

export const TIER_LIMITS = {
  starter: {
    maxCampaigns:     1,
    maxPc4s:          40,
    advancedFilters:  false,
    followUp:         false,
    abTesting:        false,
    personalizedQr:   false,
    flyerHelp:        false,
    unlimitedTemplates: true,
  },
  pro: {
    maxCampaigns:     3,
    maxPc4s:          80,
    advancedFilters:  true,
    followUp:         true,
    abTesting:        false,
    personalizedQr:   true,
    flyerHelp:        false,
    unlimitedTemplates: true,
  },
  agency: {
    maxCampaigns:     Infinity,
    maxPc4s:          Infinity,
    advancedFilters:  true,
    followUp:         true,
    abTesting:        true,
    personalizedQr:   true,
    flyerHelp:        true,
    unlimitedTemplates: true,
  },
} as const;

export type Tier = keyof typeof TIER_LIMITS;

export function canUseFeature<F extends keyof (typeof TIER_LIMITS)['starter']>(
  tier: Tier,
  feature: F,
): boolean {
  return TIER_LIMITS[tier][feature] as boolean;
}

/** Controleert of een retailer nog een campagne mag starten */
export function canStartCampaign(tier: Tier, activeCampaigns: number): boolean {
  const limit = TIER_LIMITS[tier].maxCampaigns;
  return activeCampaigns < limit;
}
