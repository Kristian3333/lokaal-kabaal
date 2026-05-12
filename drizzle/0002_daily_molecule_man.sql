ALTER TABLE "flyer_verifications" ALTER COLUMN "campagne_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "awaiting_review" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "reviewed_by" varchar(255);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "review_notes" varchar(2000);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "rejection_reason" varchar(2000);--> statement-breakpoint
ALTER TABLE "flyer_verifications" ADD CONSTRAINT "flyer_verifications_campagne_id_campaigns_id_fk" FOREIGN KEY ("campagne_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_campaigns_awaiting_review" ON "campaigns" USING btree ("awaiting_review");