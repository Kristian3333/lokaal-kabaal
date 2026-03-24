ALTER TABLE "flyer_verifications" ADD COLUMN "interesse_op" timestamp;--> statement-breakpoint
ALTER TABLE "flyer_verifications" ADD COLUMN "conversie_op" timestamp;--> statement-breakpoint
ALTER TABLE "flyer_verifications" ADD COLUMN "printone_batch_id" varchar(100);--> statement-breakpoint
ALTER TABLE "flyer_verifications" ADD COLUMN "printone_order_id" varchar(100);--> statement-breakpoint
ALTER TABLE "retailers" ADD COLUMN "winkel_pincode" varchar(6);--> statement-breakpoint
ALTER TABLE "retailers" ADD COLUMN "wachtwoord_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "retailers" ADD COLUMN "magic_link_token" varchar(100);--> statement-breakpoint
ALTER TABLE "retailers" ADD COLUMN "magic_link_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "retailers" ADD COLUMN "logo_url" varchar(500);--> statement-breakpoint
ALTER TABLE "retailers" ADD COLUMN "merk_kleur" varchar(7);--> statement-breakpoint
ALTER TABLE "retailers" ADD COLUMN "welkomst_tekst" varchar(500);