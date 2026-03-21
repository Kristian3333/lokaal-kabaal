-- LokaalKabaal - Volledige database setup
-- Draai dit script in Neon SQL Editor of via: DATABASE_URL="..." npx drizzle-kit push

-- Enums
DO $$ BEGIN
  CREATE TYPE tier AS ENUM ('starter', 'pro', 'agency');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('actief', 'gepauzeerd', 'geannuleerd', 'proef');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('concept', 'actief', 'gepauzeerd', 'afgerond', 'geannuleerd');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE credit_reden AS ENUM ('surplus', 'annulering', 'aanpassing', 'uitbetaling');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ab_test_status AS ENUM ('actief', 'gestopt', 'afgerond');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Retailers
CREATE TABLE IF NOT EXISTS retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  bedrijfsnaam VARCHAR(255) NOT NULL,
  branche VARCHAR(100) NOT NULL,
  stripe_customer_id VARCHAR(100) UNIQUE,
  stripe_subscription_id VARCHAR(100) UNIQUE,
  tier tier NOT NULL DEFAULT 'starter',
  subscription_status subscription_status NOT NULL DEFAULT 'proef',
  is_jaarcontract BOOLEAN NOT NULL DEFAULT false,
  periode_start TIMESTAMP,
  periode_eind TIMESTAMP,
  dashboard_actief_tot TIMESTAMP,
  winkel_pincode VARCHAR(6),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_retailers_email ON retailers(email);
CREATE INDEX IF NOT EXISTS idx_retailers_stripe_sub ON retailers(stripe_subscription_id);

-- Campagnes
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  naam VARCHAR(255) NOT NULL,
  branche VARCHAR(100) NOT NULL,
  status campaign_status NOT NULL DEFAULT 'concept',
  centrum VARCHAR(255) NOT NULL,
  straal_km NUMERIC(6,2) NOT NULL,
  pc4_lijst VARCHAR(4000),
  formaat VARCHAR(5) NOT NULL DEFAULT 'a6',
  dubbelzijdig BOOLEAN NOT NULL DEFAULT false,
  flyer_template_id VARCHAR(255),
  verwacht_aantal_per_maand INTEGER NOT NULL,
  duur_maanden SMALLINT NOT NULL DEFAULT 1,
  start_maand DATE NOT NULL,
  eind_maand DATE NOT NULL,
  filter_bouwjaar_min SMALLINT,
  filter_bouwjaar_max SMALLINT,
  filter_woz_min INTEGER,
  filter_woz_max INTEGER,
  filter_energielabel VARCHAR(50),
  stripe_subscription_item_id VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_retailer ON campaigns(retailer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- Credit ledger
CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  campagne_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  reden credit_reden NOT NULL,
  aantal_flyers INTEGER NOT NULL,
  maand DATE NOT NULL,
  toelichting VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_credits_retailer ON credit_ledger(retailer_id);
CREATE INDEX IF NOT EXISTS idx_credits_maand ON credit_ledger(maand);

-- Retailer postcodes
CREATE TABLE IF NOT EXISTS retailer_postcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  pc4 VARCHAR(4) NOT NULL,
  actief BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rp_retailer ON retailer_postcodes(retailer_id);
CREATE INDEX IF NOT EXISTS idx_rp_pc4 ON retailer_postcodes(pc4);

-- A/B tests
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  campagne_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  naam VARCHAR(255) NOT NULL,
  variant_a_naam VARCHAR(255) NOT NULL,
  variant_b_naam VARCHAR(255) NOT NULL,
  status ab_test_status NOT NULL DEFAULT 'actief',
  aantal_a INTEGER NOT NULL DEFAULT 0,
  aantal_b INTEGER NOT NULL DEFAULT 0,
  scans_a INTEGER NOT NULL DEFAULT 0,
  scans_b INTEGER NOT NULL DEFAULT 0,
  start_datum TIMESTAMP NOT NULL DEFAULT NOW(),
  eind_datum TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ab_retailer ON ab_tests(retailer_id);

-- Flyer verifications (QR-code tracking)
CREATE TABLE IF NOT EXISTS flyer_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  adres VARCHAR(255) NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  stad VARCHAR(100) NOT NULL,
  retailer_id UUID NOT NULL,
  campagne_id VARCHAR(100) NOT NULL,
  overdracht_datum DATE NOT NULL,
  verzonden_op TIMESTAMP NOT NULL DEFAULT NOW(),
  geldig_tot TIMESTAMP NOT NULL,
  gebruikt BOOLEAN NOT NULL DEFAULT false,
  gebruikt_op TIMESTAMP,
  interesse_op TIMESTAMP,
  conversie_op TIMESTAMP,
  follow_up_verzonden BOOLEAN NOT NULL DEFAULT false,
  follow_up_op TIMESTAMP,
  ab_test_id UUID REFERENCES ab_tests(id),
  ab_test_variant VARCHAR(1),
  printone_batch_id VARCHAR(100),
  printone_order_id VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fv_code ON flyer_verifications(code);
CREATE INDEX IF NOT EXISTS idx_fv_retailer ON flyer_verifications(retailer_id);
CREATE INDEX IF NOT EXISTS idx_fv_campagne ON flyer_verifications(campagne_id);
CREATE INDEX IF NOT EXISTS idx_fv_ab_test ON flyer_verifications(ab_test_id);
CREATE INDEX IF NOT EXISTS idx_fv_follow_up ON flyer_verifications(gebruikt, follow_up_verzonden, verzonden_op);

-- PC4 exclusiviteit
CREATE TABLE IF NOT EXISTS pc4_exclusivity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  pc4 VARCHAR(4) NOT NULL,
  branche VARCHAR(100) NOT NULL,
  van_maand DATE NOT NULL,
  tot_maand DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_excl_pc4 ON pc4_exclusivity(pc4);
CREATE INDEX IF NOT EXISTS idx_excl_branche ON pc4_exclusivity(branche);
