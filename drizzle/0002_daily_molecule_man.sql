-- Add operator review columns to campaigns + an index on awaiting_review
-- so /admin/orders' "pending" query stays cheap.
--
-- Drizzle also generated two unrelated ALTERs for flyer_verifications
-- because the live DB has campagne_id as varchar(100) (from
-- 0000_init.sql) while the schema declares it as uuid. That drift
-- pre-dates this migration and can't be fixed with an automatic ALTER
-- (Postgres refuses varchar -> uuid without a USING clause that
-- guarantees every existing value is a valid UUID). Stripping those
-- ALTERs keeps this migration scoped to the admin-review feature; the
-- flyer_verifications drift should be addressed in its own migration
-- once we know the existing rows are safe to cast.
ALTER TABLE "campaigns" ADD COLUMN "awaiting_review" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "reviewed_by" varchar(255);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "review_notes" varchar(2000);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "rejection_reason" varchar(2000);--> statement-breakpoint
CREATE INDEX "idx_campaigns_awaiting_review" ON "campaigns" USING btree ("awaiting_review");
