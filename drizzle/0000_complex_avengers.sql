CREATE TYPE "public"."ab_test_status" AS ENUM('actief', 'gestopt', 'afgerond');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('concept', 'actief', 'gepauzeerd', 'afgerond', 'geannuleerd');--> statement-breakpoint
CREATE TYPE "public"."credit_reden" AS ENUM('surplus', 'annulering', 'aanpassing', 'uitbetaling');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('actief', 'gepauzeerd', 'geannuleerd', 'proef');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('starter', 'pro', 'agency');--> statement-breakpoint
CREATE TABLE "ab_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"retailer_id" uuid NOT NULL,
	"campagne_id" uuid,
	"naam" varchar(255) NOT NULL,
	"variant_a_naam" varchar(255) NOT NULL,
	"variant_b_naam" varchar(255) NOT NULL,
	"status" "ab_test_status" DEFAULT 'actief' NOT NULL,
	"aantal_a" integer DEFAULT 0 NOT NULL,
	"aantal_b" integer DEFAULT 0 NOT NULL,
	"scans_a" integer DEFAULT 0 NOT NULL,
	"scans_b" integer DEFAULT 0 NOT NULL,
	"start_datum" timestamp DEFAULT now() NOT NULL,
	"eind_datum" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"retailer_id" uuid NOT NULL,
	"naam" varchar(255) NOT NULL,
	"branche" varchar(100) NOT NULL,
	"status" "campaign_status" DEFAULT 'concept' NOT NULL,
	"centrum" varchar(255) NOT NULL,
	"straal_km" numeric(6, 2) NOT NULL,
	"pc4_lijst" varchar(4000),
	"formaat" varchar(5) DEFAULT 'a6' NOT NULL,
	"dubbelzijdig" boolean DEFAULT false NOT NULL,
	"flyer_template_id" varchar(255),
	"verwacht_aantal_per_maand" integer NOT NULL,
	"duur_maanden" smallint DEFAULT 1 NOT NULL,
	"start_maand" date NOT NULL,
	"eind_maand" date NOT NULL,
	"filter_bouwjaar_min" smallint,
	"filter_bouwjaar_max" smallint,
	"filter_woz_min" integer,
	"filter_woz_max" integer,
	"filter_energielabel" varchar(50),
	"stripe_subscription_item_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"retailer_id" uuid NOT NULL,
	"campagne_id" uuid,
	"reden" "credit_reden" NOT NULL,
	"aantal_flyers" integer NOT NULL,
	"maand" date NOT NULL,
	"toelichting" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flyer_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"adres" varchar(255) NOT NULL,
	"postcode" varchar(10) NOT NULL,
	"stad" varchar(100) NOT NULL,
	"retailer_id" uuid NOT NULL,
	"campagne_id" varchar(100) NOT NULL,
	"overdracht_datum" date NOT NULL,
	"verzonden_op" timestamp DEFAULT now() NOT NULL,
	"geldig_tot" timestamp NOT NULL,
	"gebruikt" boolean DEFAULT false NOT NULL,
	"gebruikt_op" timestamp,
	"follow_up_verzonden" boolean DEFAULT false NOT NULL,
	"follow_up_op" timestamp,
	"ab_test_id" uuid,
	"ab_test_variant" varchar(1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "flyer_verifications_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "pc4_exclusivity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"retailer_id" uuid NOT NULL,
	"pc4" varchar(4) NOT NULL,
	"branche" varchar(100) NOT NULL,
	"van_maand" date NOT NULL,
	"tot_maand" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retailer_postcodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"retailer_id" uuid NOT NULL,
	"pc4" varchar(4) NOT NULL,
	"actief" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retailers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"bedrijfsnaam" varchar(255) NOT NULL,
	"branche" varchar(100) NOT NULL,
	"stripe_customer_id" varchar(100),
	"stripe_subscription_id" varchar(100),
	"tier" "tier" DEFAULT 'starter' NOT NULL,
	"subscription_status" "subscription_status" DEFAULT 'proef' NOT NULL,
	"is_jaarcontract" boolean DEFAULT false NOT NULL,
	"periode_start" timestamp,
	"periode_eind" timestamp,
	"dashboard_actief_tot" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "retailers_email_unique" UNIQUE("email"),
	CONSTRAINT "retailers_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "retailers_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "ab_tests" ADD CONSTRAINT "ab_tests_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ab_tests" ADD CONSTRAINT "ab_tests_campagne_id_campaigns_id_fk" FOREIGN KEY ("campagne_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_campagne_id_campaigns_id_fk" FOREIGN KEY ("campagne_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flyer_verifications" ADD CONSTRAINT "flyer_verifications_ab_test_id_ab_tests_id_fk" FOREIGN KEY ("ab_test_id") REFERENCES "public"."ab_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc4_exclusivity" ADD CONSTRAINT "pc4_exclusivity_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_postcodes" ADD CONSTRAINT "retailer_postcodes_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ab_retailer" ON "ab_tests" USING btree ("retailer_id");--> statement-breakpoint
CREATE INDEX "idx_campaigns_retailer" ON "campaigns" USING btree ("retailer_id");--> statement-breakpoint
CREATE INDEX "idx_campaigns_status" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_credits_retailer" ON "credit_ledger" USING btree ("retailer_id");--> statement-breakpoint
CREATE INDEX "idx_credits_maand" ON "credit_ledger" USING btree ("maand");--> statement-breakpoint
CREATE INDEX "idx_fv_code" ON "flyer_verifications" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_fv_retailer" ON "flyer_verifications" USING btree ("retailer_id");--> statement-breakpoint
CREATE INDEX "idx_fv_campagne" ON "flyer_verifications" USING btree ("campagne_id");--> statement-breakpoint
CREATE INDEX "idx_fv_ab_test" ON "flyer_verifications" USING btree ("ab_test_id");--> statement-breakpoint
CREATE INDEX "idx_fv_follow_up" ON "flyer_verifications" USING btree ("gebruikt","follow_up_verzonden","verzonden_op");--> statement-breakpoint
CREATE INDEX "idx_excl_pc4" ON "pc4_exclusivity" USING btree ("pc4");--> statement-breakpoint
CREATE INDEX "idx_excl_branche" ON "pc4_exclusivity" USING btree ("branche");--> statement-breakpoint
CREATE INDEX "idx_rp_retailer" ON "retailer_postcodes" USING btree ("retailer_id");--> statement-breakpoint
CREATE INDEX "idx_rp_pc4" ON "retailer_postcodes" USING btree ("pc4");--> statement-breakpoint
CREATE INDEX "idx_retailers_email" ON "retailers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_retailers_stripe_sub" ON "retailers" USING btree ("stripe_subscription_id");