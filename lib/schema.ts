import { pgTable, uuid, varchar, boolean, timestamp, date, index } from 'drizzle-orm/pg-core';

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
  createdAt:       timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  codeIdx:      index('idx_fv_code').on(t.code),
  retailerIdx:  index('idx_fv_retailer').on(t.retailerId),
  campagneIdx:  index('idx_fv_campagne').on(t.campagneId),
}));

export type FlyerVerification = typeof flyerVerifications.$inferSelect;
export type NewFlyerVerification = typeof flyerVerifications.$inferInsert;
