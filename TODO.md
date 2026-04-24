# Lokaalkabaal TODO

Feedback round 1 items (from site walkthrough, April 2026) have been implemented.
This list is the **audit-driven follow-up** after that implementation pass.

Grouped by area. Open questions / blockers are flagged inline.

---

## Round 1: implemented (April 2026)

Archived here for traceability. All items are live in the code.

- [x] `#hoe-het-werkt` bezorgdatum aangepast van "25e" naar "28-30e" sitewide
- [x] Alle mentions van "€49 voor eerste campagne" verwijderd
- [x] Rewrite pricing: Starter €349, Pro €499, Agency €649 (A6 dubbelzijdig standaard)
- [x] Jaarabonnement: 15% korting (was 25%)
- [x] A5 upgrade: +€0,15/flyer
- [x] Extra flyers buiten bundel: €0,70/flyer, custom pricing vanaf 5000/mnd (support@lokaalkabaal.agency)
- [x] Persoonlijke flyerhulp CTA toegevoegd voor Agency jaarcontract (Design@lokaalkabaal.agency)
- [x] Uitgebreide sector list in signup (gedeeld met wizard stap 2)
- [x] Magic link flow werkt lokaal + prod (request origin fallback i.p.v. hardcoded URL)
- [x] Algemene voorwaarden en privacybeleid gelinkt vanuit wizard step 1 checkboxes
- [x] Wizard step 2 pre-fillt sector met de branche gekozen bij signup
- [x] Wizard step 4 infinite-loop bug gefixt (geocode verplaatst naar useEffect)
- [x] Wizard step 8 is nu pakketkeuze (starter/pro/agency, maand/jaar)
- [x] Autofill website URL normaliseert scheme client-side
- [x] Dubbelzijdig toggle verwijderd uit flow, A6 dubbelzijdig is altijd standaard
- [x] Credits model vervangen door pakketkeuze; nav-item omgenoemd naar "Abonnement"
- [x] Bedrijfsgegevens pre-populated vanaf signup in Mijn profiel
- [x] Logout redirect naar landingspagina (was /login)

---

## Round 2: audit findings (open)

### Pricing consistency (highest priority)

- [x] Stripe checkout route nu gesynchroniseerd met lib/tiers (was nog €99/€199/€499)
- [x] Stripe checkout klantscherm: yearly bedrag toont nu 2 decimalen
- [x] `lib/printone-pricing.ts` intact gelaten (tests hangen ervan af) maar PriceCalculator en wizard step 6 tonen nu "inbegrepen in abonnement" i.p.v. aparte printkosten

### SEO

- [x] `app/login/page.tsx`: metadata toegevoegd via `app/login/layout.tsx` (robots noindex)
- [x] Metadata toegevoegd op `app/privacy/page.tsx` en `app/voorwaarden/page.tsx`
- [x] Metadata toegevoegd op 4 blogposts: `digital-first`, `digitale-moeheid`, `eerste-kennismaking`, `hyperlokaal`
- [x] Structured data: schema.org offer nu `AggregateOffer` met lowPrice/highPrice €349-€649
- [x] Sitemap heeft privacy + voorwaarden + alle blogposts
- [x] `app/page.tsx` is nu een server-component dat metadata exporteert en de client-logica delegeert aan `components/landing/LandingPage.tsx`. Homepage heeft nu een eigen title/description/canonical/OG.

### Security

- [x] Cron routes (`follow-up`, `monthly-report`, `dispatch`) zijn allemaal CRON_SECRET-beschermd
- [x] `/api/codes/redeem` is REDEEM_API_KEY-protected (server-to-server, geen brute-force surface)
- [x] `/api/verify/[code]` POST (pincode-flow) krijgt nu een stricter `redeemLimiter` (10 pogingen per 10 min per IP) om 4-6 digit pincode brute-force onhaalbaar te maken
- [x] SSRF-guard toegevoegd op `/api/flyer/generate` via `isValidExternalUrl` (blokkeert 127.0.0.1, 169.254.*, interne ranges). `/api/scrape` had de check al.

### Accessibility

- [x] AdaptiveLogo heeft nu default `alt="Logo"` (en accepteert een override-prop); hero images gemarkeerd als `role="presentation"`
- [x] Sidebar nav-iconen hebben `aria-hidden="true"`; actieve item heeft `aria-current="page"`
- [x] Belangrijke wizard inputs (centrum-pc4, straal, duur) hebben `<label htmlFor>` → `<input id>` coupling
- [x] Login "Wachtwoord vergeten?" heeft aria-label
- [x] Color contrast: `rgba(255,255,255,0.2)` opgetild naar `0.55` op landing (vertrouwen/connectie labels) en login footer

### Tests / coverage

- [x] `lib/auth.ts` tests (7 cases: round-trip, tampering, expiry, malformed)
- [x] `lib/branches.ts` tests (5 cases: non-empty, geen duplicaten, core sectors aanwezig)
- [x] `lib/email-templates.ts` tests (13 cases: escHtml edges, buildEmailHtml branding/CTA, buildStatRow)
- [x] `lib/dispatch.ts` pure-helper tests (14 cases: parsePc4Lijst null/whitespace/empty, isLastMonth across months/years, formatMaandLabel Dutch locale, currentBatchMonth format)
- [x] `calcOverage` + 6 tests (bundle boundaries, negative input, fractional flyers, tier-specific quotas)
- [x] `lib/checkout-handler.ts` heeft nu 7 integration-tests met `vi.mock` voor Stripe SDK + db: empty-id, retrieve-throws, unpaid, paid-zonder-email, paid+webhook-done (→tier), paid-maar-webhook-pending, paid-maar-db-down
- [x] API integratietests gewired: `test_auth_logout.ts` (2), `test_auth_session.ts` (3), `test_subscription_status.ts` (2), `test_cron_dispatch.ts` (5), `test_printone_webhook.ts` (6), `test_stripe_webhook.ts` (5 met real HMAC signature generatie). In totaal 23 API integration-cases, inclusief signature-mismatch + expired-timestamp paths voor Stripe.
- [x] Wizard step 8 pakketkeuze-logica gevangen in `computeAbonnement(tier, jaarcontract)` in `lib/tiers` + 5 tests (monthly/yearly voor elke tier, label-matching, 15% jaarcontract-invariant). Volgt nu dezelfde source-of-truth als Stripe checkout. Volledige Playwright E2E blijft open als separate infra-investering.

### Performance

- [x] `<img>` tags in FlyerPreview/FlyerDesigner bewust behouden: user-uploaded logos/hero zijn base64 data URLs die `next/image` niet kan optimaliseren. Heroverwegen zodra we naar Blob-hosted uploads migreren.
- [x] `/app` first-load JS verlaagd van **127 kB → 98 kB** (page: 38.8 → 9.97 kB) door wizard/flyer-designer/billing/settings/conversies dynamic-import te maken
- [x] Hero3D rendert nu alleen op viewport >768px + als geen `prefers-reduced-motion`. LCP op mobiel daalt significant.

### UX gaps

- [x] QR pincode conversie is volledig geïmplementeerd: `/verify/[code]/page.tsx` toont retailer-branding + status, `PinForm` laat shop-staff een 4-6 digit pincode invoeren, `POST /api/verify/[code]` valideert tegen `retailers.winkelPincode` (met `redeemLimiter`) en schrijft `conversieOp` naar de DB
- [x] Landingspagina branding sectie: "Binnenkort" badge + copy legt uit dat de feature herontwerp krijgt terwijl instellingen opgeslagen blijven. Eindbeslissing rebuild-vs-verwijderen staat gedocumenteerd onder "Open questions" maar is niet blocking voor deze release.
- [x] Stap 4 toont nu een rode foutbanner boven de kaart wanneer de geocoder de PC4 niet vindt
- [x] Stap 7 PrintOne failure toont nu een duidelijke retry-instructie in de errormelding
- [x] `aantalFlyers` aanpasbaar door pc4Lijst te trimmen in stap 4; expliciete override-input uitgesteld als deze workaround onvoldoende blijkt
- [x] Toast-vs-inline regel vastgelegd in `docs/review-lessons.md`: toast voor background/cross-page failures, inline voor directe user-actions

### Business logic

- [x] `lib/dispatch.ts` cap nu op `min(verwachtAantalPerMaand, TIERS[tier].includedFlyers)` zodat retailers geen free extra flyers krijgen
- [x] Stripe `yearlyTotal` gesloten door vitest invariant (`test_TIERS_yearlyTotalMatchesStripeFormula_forAllTiers`)
- [x] `addSurplusCredits` verwijderd uit dispatch -- het credits-concept past niet meer bij het abonnementmodel. `credit_ledger` blijft als historische tabel, geen nieuwe writes vanuit cron.
- [x] `calcOverage(tier, flyersThisMonth)` helper toegevoegd en dispatch waarschuwt nu met console.warn wanneer een batch de bundle overshoot (inclusief euro-bedrag)
- [x] `buildOverageInvoiceItem(customerId, tier, flyersThisMonth, maandLabel)` pure helper beschikbaar -- produceert drop-in `stripe.invoiceItems.create()` params (tested)
- [x] Overage billing end-to-end gewired in `lib/dispatch.ts`: als `wanted > tierQuota` en de retailer een `stripeCustomerId` heeft, wordt er een Stripe Invoice Item aangemaakt voor de extra flyers; zonder Stripe customer valt dispatch terug op hard-cap met een warning in de logs

### Domain / infrastructure

- [x] Stap-voor-stap deployment guide geschreven in `docs/deployment.md` (GoDaddy DNS A/CNAME records, Vercel domain add, env-var tabel, cron verificatie, Stripe/PrintOne webhook setup, post-deploy smoke test). De DNS-actie zelf blijft handwerk voor wie Vercel + GoDaddy toegang heeft.
- [x] `NEXT_PUBLIC_BASE_URL` optioneel gemaakt + boot-time `console.warn` in `lib/email` als de var in productie ontbreekt (emails vallen dan terug op https://lokaalkabaal.agency maar de warning maakt de configuratiedrift zichtbaar)

---

## Open questions / external blockers

- Carmen (Altum) antwoord op extra filters voor Pro-tier (openstaand sinds round 1) -- niet blocking voor de huidige Pro-propositie, Altum kan later worden uitgebreid zonder codewijziging
- Landingspagina branding "rebuild vs. remove" beslissing -- feature staat nu achter "Binnenkort" badge, tijd om later te kiezen

---

# Round 3: master plan (vision + roadmap)

## North star

**"The lokale ondernemer wins every new neighbour in NL before the concurrent does."**

Today we sell a flyer-automation subscription. Where LokaalKabaal should be
in 12 months: the default operating system for hyperlocal customer
acquisition -- part data product (new-mover signal), part marketing
automation (flyers + SMS + email), part community layer (municipalities,
welkomstpakketten), and part proof-of-ROI dashboard. Everything on this plan
builds a moat towards that.

The bets below are ordered by leverage: the top of each section unlocks the
rest of it.

---

## 1. Growth -- programmatic SEO + content engine

Direct-mail SEO today is 7 industry pages (bakker, kapper, installateur ...) +
4 blog posts. The opportunity is long-tail local intent.

- [ ] **Programmatic city pages**: `/flyers-versturen-[gemeente]` for all ~340
  Dutch municipalities. Each page pulls real monthly new-movers count for
  that municipality from our own Altum-feed snapshot. Unique copy per city
  + a local case study slot. Auto-generated, human-edited top 30. This is
  *the* biggest Google NL play we have.
- [ ] **Programmatic industry x city matrix**: "kapper in Rotterdam",
  "bakker in Utrecht". 7 branches x 340 cities = ~2.400 auto-generated
  landing pages. Canonical to the main industry page, differentiated by a
  data block (new movers/mnd in that city for that branche).
- [ ] **Free tool: new-movers checker**. Public page: enter a PC4, show the
  monthly average new-movers count + CLV estimate for their branche. Strong
  link bait, captures leads before signup. Public `/tools/verhuisdata/[pc4]`.
- [ ] **Free tool: flyer ROI calculator** as a standalone page with its own
  SEO keywords ("ROI direct mail", "flyer rendement berekenen"). Embeddable
  widget version for bloggers/partners.
- [ ] **Blog cadence 2x/week** via an editorial calendar. Themes: retailer
  success stories, new-mover behavior research, local marketing trends.
  Cross-link aggressively to product pages.
- [ ] **Comparison pages**: "LokaalKabaal vs Spotta", "LokaalKabaal vs PostNL
  Direct Mail", "Flyer vs Meta Ads voor lokale ondernemer". High-intent
  bottom-of-funnel pages.
- [ ] **FAQ schema + HowTo schema** on all product pages (we already have
  plain JSON-LD, need explicit `@type: FAQPage` and `@type: HowTo` blocks).
- [ ] **Backlink strategy**: partner with gemeente welkomstpakket sites,
  Ondernemersvereniging listings, Chamber of Commerce content partnerships.
- [x] **Dynamic OG image generation** via `/api/og?title=...&subtitle=...&badge=...`
  using edge runtime + `next/og`. 1200x630, brand palette, Instrument Serif
  title. Root layout references it in OpenGraph + Twitter card so shares
  from the homepage already get branded cards; blog and industry pages can
  opt in by overriding their `metadata.openGraph.images`.

## 2. Acquisition funnel polish

Current signup -> wizard -> Stripe -> first batch takes ~20 minutes and has no
safety nets for drop-off.

- [ ] **Interactive pricing preview on landing**: show a live "Jij betaalt
  per vaste klant" slider that pulls branche-specific CLV into a break-even
  calculation. Converts visitors who are doing the math mentally anyway.
- [ ] **"Probeer een proef flyer gratis"** lead magnet: send a sample flyer
  to the retailer's own address free-of-charge in exchange for email
  + bedrijfsnaam. Converts the fence-sitters.
- [ ] **Testimonials + case studies** with real numbers. Currently zero
  social proof on the landing page.
- [ ] **Live scan/order ticker** (anonymized) on the landing: "Laatste scan:
  kapsalon in Utrecht, 14 min geleden". Manufactures trust + activity.
- [ ] **Exit-intent capture**: modal with "Wacht, bereken eerst wat
  een nieuwe klant jou per jaar oplevert" + ROI calc.
- [ ] **Lifecycle email sequence** in Resend: welcome -> first campaign
  setup reminder (48h) -> scan recap (after first dispatch) -> upgrade
  nudge at 80% of bundle. Today only welcome + dispatch notifications exist.

## 3. Product depth -- unlock already-built features

We have DB schema for A/B testing, follow-up flyers, exclusivity, but no UI.

- [~] **Follow-up flyer eligibility core** (`lib/follow-up.ts`): pure
  `findFollowUpEligible(verifications, tier, {delayDays, now})` helper +
  9 tests covering starter-gate, recent-send, already-scanned,
  already-converted, already-followed-up, mixed-batch, custom-delay,
  and boundary cases. Next: wire a cron that calls this and enqueues a
  PrintOne follow-up batch, plus an opt-in toggle in the campaign wizard.
- [ ] **A/B testing UI**. Agency tier only. Two flyer variants, auto 50/50
  split, dashboard shows scan-rate and conversion per variant. Schema
  (`ab_tests`, `abTestVariant`) already exists.
- [~] **Conversion dashboard v2 core** (`lib/conversie-stats.ts`):
  `bucketByTime(points, 'day'|'month')` + `breakdownByPostcode(points)` +
  `sparklinePoints(values, w, h)` SVG-polyline helper + 11 tests. Next step:
  wire into `ConversiesPanel` with an inline `<svg>` sparkline and a
  PC4-breakdown table.
- [ ] **Campaign duplication**: one-click "Start dezelfde campagne ergens
  anders" for retailers with multiple locations.
- [ ] **PC4 bulk import + export**. CSV upload or paste list for retailers
  who already know their territory.
- [ ] **PC4 heatmap**: overlay new-mover density on the NLMap so retailers
  pick PC4's with the highest yield per euro.
- [ ] **Multi-location support**: one retailer account, multiple winkels
  each with own pincode + branding. Requires schema change (retailer
  -> retailer + retailer_location one-to-many).
- [ ] **Flyer template marketplace**: curated designs per branche, one-click
  apply with brand colors auto-substituted.
- [ ] **Welkomst-serie** (3-flyer arc): month 1 = intro offer, month 2 =
  reminder + review CTA, month 3 = loyalty signup. Sold as an add-on.

## 4. Retailer dashboard UX polish

- [x] **Onboarding checklist** on the dashboard: 4 steps (ontwerp flyer,
  pincode, eerste campagne, eerste scan) met progress-bar en dismiss-knop.
  Component: `components/dashboard/OnboardingChecklist.tsx`. Signals
  gesourced uit `/api/pincode`, `/api/conversies?limit=1`, flyer state +
  campaigns list. Widget verbergt zichzelf als alle 4 stappen done zijn.
- [ ] **In-product tour** for first-time users (intro.js or custom) that
  walks through wizard, flyer editor, conversies panel.
- [ ] **Monthly report PDF** auto-generated and emailed on the 5th of each
  month with scans/conversions/ROI. Shareable link so retailers can show
  their accountant.
- [ ] **Browser notifications** for real-time scan events (opt-in) -- gives
  retailers a dopamine hit that keeps them engaged.
- [ ] **Mobile dashboard**: today the dashboard is desktop-only in practice.
  Responsive pass on CampaignWizard + FlyerDesigner for iPad/phone editing.
- [ ] **Dark mode** toggle in SettingsPanel. CSS vars already exist; just
  needs a `data-theme` attr + alternate palette.
- [ ] **Keyboard shortcuts** for dashboard power users (cmd+k command
  palette). Differentiator vs competitors who mostly have no keyboard UX.

## 5. Trust, compliance, and social proof

- [ ] **AVG / DPIA document** publicly linked from /privacy. Procurement
  teams at bigger clients will ask.
- [ ] **ISO 27001 roadmap** (not cert yet, but document the controls we do
  have: HTTPS/TLS, encrypted-at-rest Neon, scrypt password hashes, signed
  session tokens, rate limiting, signature-verified webhooks).
- [ ] **Sample campaign reports** PDF downloadable without signup for
  retailers evaluating the product.
- [ ] **Trustpilot / Google reviews** integration with schema.org Review
  markup on the pricing page.
- [x] **Security.txt** at `/.well-known/security.txt` via Next.js rewrite:
  RFC 9116 fields (Contact, Expires, Preferred-Languages, Canonical,
  Policy) serving plain text. Tested end-to-end.
- [ ] **Cookie-less analytics** (Plausible or Umami) instead of any
  future GA addition. Positions us as the privacy-first choice vs GAM-heavy
  competitors.
- [ ] **Partner logos strip** (municipalities, Ondernemersvereniging,
  printers) on landing for instant trust.

## 6. Platform & integrations

Turn LokaalKabaal from a SaaS into a platform that other tools plug into.

- [ ] **Public REST API** for retailers: CRUD campaigns, read conversions,
  webhook subscriptions. Needs OAuth / personal access tokens.
- [ ] **Shopify + WooCommerce plugin**: auto-call `/api/codes/redeem` when
  a customer checks out with one of our codes. Removes manual pincode entry
  for webshops. Listing on Shopify App Store = acquisition channel.
- [ ] **Lightspeed / MplusKASSA POS integration** for in-store redeem.
  Same API surface, different UX.
- [ ] **Zapier integration**: "when new scan happens, send Slack message /
  add to Google Sheet". 3-line build on their side, huge distribution for us.
- [ ] **Webhook outbox** in our DB for retailers to subscribe to our events
  (scan, conversion, monthly_report_ready). Pair with the public API.
- [ ] **Gemeente welkomstpakket partnership SDK**: iframe / embed so a
  municipality site can render "welkomstpakket retailers in jouw buurt"
  driven by our retailer database. Revenue share.
- [ ] **Slack / Teams bot**: /lokaalkabaal scans today. Enterprise feel.

## 7. Monetization expansion

- [ ] **White-label "Powered by LokaalKabaal"** voor marketingbureaus die
  meerdere lokale retailers beheren. Tier above Agency, high-margin, low
  support overhead once built.
- [ ] **Add-on: design-on-demand**. Currently free for Agency jaarcontract
  as "Persoonlijke flyerhulp". Productize as a €49/flyer a-la-carte for
  other tiers -- known willingness to pay, existing mail alias already in
  production.
- [ ] **Add-on: digital retargeting**. After scan, retailer can re-engage
  the new resident via Facebook/Google display ads on a lookalike
  audience. Partnership with a retargeting provider, we take a cut.
- [ ] **Municipal contracts**: sell gemeenten a "Welcome to [city]" booklet
  that bundles 20 local merchants. Flat-fee per printed batch, merchants
  pay per placement. High ACV, sticky.
- [ ] **Data products** (anonymized): sell monthly "new movers by PC4"
  aggregates to estate agents / insurance brokers / moving companies.
  Zero marginal cost for us, pure upside.
- [ ] **Yearly contract upgrade incentive**: today 15% off. Experiment with
  "first month free + 10% off" or a concrete "200 extra flyers this month"
  bonus to increase yearly share. A/B testable via the billing toggle.

## 8. Internationalization & expansion

- [ ] **Belgium**: Kadaster-equivalent is Algemene Administratie van de
  Patrimoniumdocumentatie. Altum has a BE feed. Scope a 3-week expansion
  PoC; Flemish-speaking retailers convert at Dutch-ish rates.
- [ ] **English UI toggle** for expat-owned SMBs in NL. 10% of Amsterdam
  retailers are non-Dutch-speaking founders. Low lift (existing i18n via
  next-intl), moderate unlock.
- [ ] **Germany** as year 2+ bet: Grundbuch data exists, DSGVO-alignment
  is doable, the market is 5x NL. Needs partner on printing side.

## 9. Data products & analytics moat

- [ ] **Public NL new-movers dashboard** at
  `lokaalkabaal.agency/nl-verhuisdata` with monthly totals per province
  for free, PC4 detail behind lead-gate. Press-release-able.
- [ ] **Industry benchmark reports**: "de gemiddelde kapsalon in Utrecht
  ziet 4.8% scan-rate". Quarterly PDF sent to all retailers, positions us
  as the market authority.
- [ ] **Predictive CLV model**: use retailer branche + PC4 socioeconomic
  data (WOZ average, bouwjaar spread) to predict expected conversion per
  new mover. Shown at campaign setup so retailers understand expected ROI
  before paying.
- [ ] **Churn signal**: flag campaigns with declining scan-rates so we can
  proactively reach out before the retailer cancels.

## 10. Infra & performance

- [ ] **Move user-uploaded logos + hero images to Vercel Blob** (already
  installed) and swap the base64 `<img>` for `next/image` with proper
  responsive srcsets. Dashboard bandwidth drops significantly.
- [ ] **Edge caching for public landing pages**: ISR with revalidate=3600
  on industry + city pages, invalidate via webhook when content changes.
- [ ] **E2E test harness**: Playwright on critical flows (signup, wizard,
  checkout redirect, conversion via pincode). One GHA job, runs against
  a staging deploy per PR.
- [x] **Telemetry surface** (`lib/telemetry.ts`) met `captureError`,
  `captureWarning`, `captureEvent` helpers + 6 tests. ErrorBoundary gebruikt
  nu `captureError` i.p.v. kale `console.error`. Swap-in point voor Sentry
  / Highlight is nu één file; nieuwe callers worden automatisch meegenomen.
  Volgende stap: install `@sentry/nextjs` en vervang `console.*` calls in
  de helpers door Sentry hooks.
- [ ] **Database migrations in CI**: currently `drizzle-kit migrate` is
  manual. Add a GHA check that `drizzle-kit generate` produces no diff
  versus the schema file.
- [ ] **Rate-limit backend upgrade**: in-memory `lib/rate-limit.ts` doesn't
  coordinate across serverless instances. Move to Upstash Redis for
  stricter bot/brute-force protection at scale.
- [x] **Health probe endpoint** at `/api/health`: returns
  `{ok:true, db: 'up'|'down'|'unconfigured', ts}` with `cache-control:
  no-store`. Ready for Better Uptime / Vercel monitors.
- [ ] **Uptime + synthetic monitoring**: Better Uptime checks against
  /api/health, /api/auth/session, /api/pc4grenzen. On-call
  alerts via Slack.

## 11. Accessibility & content craft

- [ ] **Full WCAG 2.2 AA audit** of the dashboard. Previous passes fixed
  obvious items; need a screen-reader sweep + focus-trap checks on wizard
  steps.
- [ ] **Keyboard-only navigation** verified end-to-end, especially the
  wizard's range sliders and PC4 chips editor.
- [ ] **Plain-language toggle** on legal pages (voorwaarden/privacy) that
  shows a TL;DR summary above each article for readability.
- [ ] **Dutch copy polish**: have a native copywriter rewrite the landing
  hero + pricing section. Current copy is good but reads engineer-native.

---

## Prioritization scoring

One-line summary of where to start if we're resource-constrained (ICE
framework: Impact * Confidence / Effort, 1-10 each, higher is better).

| Bet                                   | I | C | E | ICE |
| ------------------------------------- | - | - | - | --- |
| Programmatic city pages               | 9 | 8 | 4 | 18  |
| Free new-movers checker tool          | 8 | 8 | 3 | 21  |
| Follow-up flyer UI                    | 8 | 9 | 3 | 24  |
| Onboarding checklist on dashboard     | 7 | 9 | 2 | 32  |
| Conversion dashboard v2               | 7 | 8 | 3 | 19  |
| Shopify plugin                        | 8 | 7 | 6 | 9   |
| Municipal welkomstpakket contracts    | 9 | 5 | 8 | 6   |
| Sentry error tracking                 | 6 | 9 | 2 | 27  |
| Belgium expansion PoC                 | 8 | 5 | 9 | 4   |

Top 3 to start: **onboarding checklist**, **Sentry**, **follow-up flyer UI**.
These compound with everything else -- better onboarding means more
activated retailers, which means more scans, which means the conversion
dashboard has something to show. Error tracking makes every future
shipped item safer.
