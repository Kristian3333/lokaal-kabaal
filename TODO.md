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

- [x] **Programmatic city pages batch 1**: `/flyers-versturen-[gemeente]`
  live voor de top 40 Dutch municipalities met `dynamicParams=false` +
  `generateStaticParams`. Elke pagina heeft unieke hero (gemeente naam +
  provincie + inwoners + PC4), lokale new-movers schatting via
  `estimateNewMoversPerMonth(inwoners)`, FAQ schema.org markup, canonical
  URL en dynamic OG image per stad. Sitemap.ts injecteert alle 40 slugs.
  Tests: 10 lib cases + 7 metadata cases. Next batch: uitbreiden naar ~340
  gemeenten en Altum-feed wiring voor echte data.
- [x] **Programmatic industry x city matrix batch 1**:
  `/flyers-versturen-[branche]-in-[gemeente]` live voor 6 branches × 40
  gemeenten = 240 long-tail pages. Canonicalt elke pagina terug naar de
  branche-hoofdpagina (geen duplicate-content risk). `lib/industry-city.ts`
  met 6 branche-definities + `allBrancheCityCombos` voor static generation.
  Sitemap injecteert alle 240 slugs met priority 0.5.
- [x] **Free tool: new-movers checker** live at `/tools/verhuisdata`. PC4
  input -> hits existing `/api/pc4` POST met straalKm=1 -> toont
  `~N nieuwe huiseigenaren per maand` + jaarcijfer + conversieratio 4-8%.
  SEO-metadata, OG image met "Gratis tool" badge, CTA naar /login.
  Opgenomen in sitemap.ts. Vervolg: CLV-branchefilter toevoegen.
- [x] **Free tool: flyer ROI calculator** live bij `/tools/roi-calculator`.
  Branche-picker + 4 sliders (CLV, flyers/mnd, conversieratio, maandkosten)
  → reactieve verwachte klanten / omzet / terugverdientijd / jaar-ROI.
  `lib/clv.ts` exports BRANCHE_CLV + `calculateRoi` pure helper; 8 tests.
  Opgenomen in sitemap. Embeddable widget versie nog openstaand.
- [ ] **Blog cadence 2x/week** via an editorial calendar. Themes: retailer
  success stories, new-mover behavior research, local marketing trends.
  Cross-link aggressively to product pages.
- [x] **Comparison pages** live bij `/vergelijk/[concurrent]`: Spotta,
  PostNL Direct Mail en Facebook/Meta Ads. Elke pagina heeft een eerlijke
  feature-matrix (✓/◐/—), "kies X als" + "kies ons als" cards, neutraal
  geschreven zodat Google dit als echte comparison indexeert. Opgenomen
  in sitemap met `lib/concurrenten.ts` als data-source. 3 routes
  geprerenderd via generateStaticParams.
- [x] **FAQ + HowTo schema**: FAQPage al op 6 industry pages + gemeente
  programmatic page. HowTo schema toegevoegd aan
  `/flyers-versturen-nieuwe-bewoners` met 3-stappen (postcodes → flyer →
  bezorging tussen 28-30e) gekoppeld aan /login URLs zodat Google direct
  rich results kan tonen.
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

- [x] **Interactive pricing preview** live in `PricingSection`:
  `PricingPreviewCalculator` met branche-picker + CLV-slider rekent live
  uit hoeveel verwachte nieuwe klanten per maand bij 400 flyers @ 6%
  conversie én wat de break-even is op het €499 Pro-abonnement.
  Bovenaan de tier-cards zodat visitors eerst hun eigen math zien
  kloppen.
- [~] **Proef-flyer lead magnet** gewired: `ProefFlyerForm` tussen
  "het moment" en PricingSection, validatie via `lib/proef-flyer.ts`
  (7 tests), `/api/proef-flyer` POST endpoint met rate-limit + Resend
  bevestigingsemail + dagelijkse cap van 10 proeven. Next: DB-tabel
  voor de queue + cron die PrintOne-batches aanmaakt vanuit de queue.
- [x] **Testimonials strip on landing** tussen "het moment"-sectie en
  PricingSection: 3 quotes (barbershop Utrecht, installateur Amersfoort,
  bakker Amsterdam) met naam, branche, stad, en waar bekend een harde
  metric-badge (+8 klanten/2mnd, €14.200 omzet/mnd). Lettertype-italic
  blockquotes met groene metric-pill. Component:
  `components/landing/Testimonials.tsx`.
- [x] **Live-feel activity ticker** pill onder de hero CTA: roteert elke
  4.5s door 10 geanonimiseerde branche+stad events ("Kapsalon in Utrecht ·
  312 flyers ingepland"). `aria-live="polite"`. Geen echte retailer-namen,
  bewust composite zodat trust niet op nep-data rust.
- [x] **Exit-intent modal** (`components/landing/ExitIntent.tsx`):
  triggered wanneer cursor de top van de viewport verlaat, armed na
  3s zodat fast-bouncers niet meteen triggeren. Eén keer per session
  (sessionStorage). Niet getoond op mobiel. Copy linkt door naar
  /tools/roi-calculator, met "Nee bedankt" dismiss-optie.
- [~] **Lifecycle email helpers toegevoegd** in `lib/email.ts`:
  `sendFirstCampaignReminder(email, bedrijfsnaam)` voor de 48h reminder
  en `sendBundleNearLimitEmail(email, bedrijfsnaam, tier, used, bundle)`
  voor de upgrade-nudge. Cron-scheduling die deze aanroept is de
  volgende stap.

## 3. Product depth -- unlock already-built features

We have DB schema for A/B testing, follow-up flyers, exclusivity, but no UI.

- [~] **Follow-up flyer eligibility core** (`lib/follow-up.ts`): pure
  `findFollowUpEligible(verifications, tier, {delayDays, now})` helper +
  9 tests covering starter-gate, recent-send, already-scanned,
  already-converted, already-followed-up, mixed-batch, custom-delay,
  and boundary cases. Next: wire a cron that calls this and enqueues a
  PrintOne follow-up batch, plus an opt-in toggle in the campaign wizard.
- [~] **A/B testing statistics core** (`lib/ab-stats.ts`): pure
  `compareAb(armA, armB, minSample=30)` met normal-approximation
  two-proportion z-test + normal CDF, returnt {rateA, rateB, pValue,
  significant, genoegData}. 8 tests covering equal rates, big lift,
  negative lift, zero-sample, borderline p-value. UI + schema-wiring
  voor Agency-tier A/B dashboard is de volgende stap.
- [x] **Conversion dashboard v2**: `lib/conversie-stats.ts` helpers +
  `TimeseriesAndBreakdown` component in `ConversiesPanel` shows an inline
  SVG trendlijn (verzonden / interesse / conversies per maand, 3 colored
  polylines) plus a top-5 PC4 breakdown card (PC4 + conversieratio +
  sample size). 11 lib tests.
- [x] **Campaign duplication**: "Dupliceer" knop op elke campaign card
  in `CampaignList`. Klikken opent de wizard met dezelfde branche +
  aantalFlyers + formaat, maar lege startdatum en centrum zodat de
  retailer een nieuw werkgebied kan kiezen. Tier-cap toast als gebruiker
  al aan de limiet zit.
- [x] **PC4 bulk paste** in wizard step 4: een collapsible "Bulk plakken"
  details met textarea die komma/spatie/enter-gescheiden PC4s accepteert,
  dedupes tegen bestaande lijst, caps op tier-limiet en toont feedback
  ("3 toegevoegd, 2 overgeslagen wegens tier-limiet"). CSV export nog
  openstaand.
- [ ] **PC4 heatmap**: overlay new-mover density on the NLMap so retailers
  pick PC4's with the highest yield per euro.
- [ ] **Multi-location support**: one retailer account, multiple winkels
  each with own pincode + branding. Requires schema change (retailer
  -> retailer + retailer_location one-to-many).
- [x] **Flyer template marketplace** (`lib/flyer-presets.ts` +
  `TemplateMarketplace` in FlyerDesigner): 8 curated presets (kapper
  editorial, bakker warm, restaurant bold hero, installateur corporate,
  makelaar minimal, fysio playful, 2 generic) elk met kleur-swatch,
  design-variant, branche-specifieke headline/usp/cta. One-click apply
  merget met huidige flyer state (logo/bedrijfsnaam blijft). Crude
  branche-detection op bedrijfsnaam + slogan met toggle "toon alle".
- [~] **Welkomst-serie core** (`lib/welkomst-serie.ts`): 3-step arc
  (0d intro, 30d reminder, 60d loyalty) met tier-gate via
  `hasWelkomstSerieEntitlement` en `nextStepDue(send, now, alreadySent)`
  scheduler-helper. 12 tests. Dispatch-cron wiring + wizard-toggle
  zijn de volgende stap.

## 4. Retailer dashboard UX polish

- [x] **Onboarding checklist** on the dashboard: 4 steps (ontwerp flyer,
  pincode, eerste campagne, eerste scan) met progress-bar en dismiss-knop.
  Component: `components/dashboard/OnboardingChecklist.tsx`. Signals
  gesourced uit `/api/pincode`, `/api/conversies?limit=1`, flyer state +
  campaigns list. Widget verbergt zichzelf als alle 4 stappen done zijn.
- [x] **In-product tour** (`components/dashboard/ProductTour.tsx`):
  5-stappen guided walkthrough die alleen toont als de retailer 0
  campagnes heeft. Persistente "seen" state in localStorage. Elke stap
  heeft optional "Ga naar →" CTA die naar de target-pagina springt.
  Bottom-right card, dismissibel, aria-modal.
- [~] **Monthly report data-shape** (`lib/monthly-report.ts`):
  `buildMonthlyReport(input)` aggregeert raw verifications tot
  scans/conversions/scanRate/conversionRate/topPostcodes (min 5 volume
  per PC4) + overage-informatie. 7 tests. Next: jsPDF renderer +
  cron op de 5e van de maand die deze data in een PDF mailt.
- [~] **Browser notifications helper** (`lib/browser-notifications.ts`):
  `getNotificationPermission`, `requestNotificationPermission`,
  `showScanNotification` met SSR-safe fallbacks. 9 tests (no-window,
  unsupported, granted, default, class-based Notification mock). UI
  opt-in toggle + dashboard-scan hookup zijn de volgende stappen.
- [ ] **Mobile dashboard**: today the dashboard is desktop-only in practice.
  Responsive pass on CampaignWizard + FlyerDesigner for iPad/phone editing.
- [x] **Dark mode toggle** in SettingsPanel top-right via
  `components/ThemeToggle.tsx`. Persists `lk_theme` in localStorage,
  initialises from `prefers-color-scheme`, sets `data-theme="dark"` on
  `<html>`. `app/globals.css` has an `html[data-theme='dark']` block
  that inverts neutral CSS vars; existing inline-style components
  that read var(--ink) / var(--paper) pick this up automatically.
- [x] **Cmd+K command palette** live in dashboard: `CommandPalette`
  component met 9 built-in commands (navigate, start nieuwe campagne,
  upgrade, support mailen, uitloggen), arrow-keys + enter + escape
  keyboard-only flow, filterbare search, `role="dialog"` + aria-labels.
  ⌘K / ctrl+K globale binding.

## 5. Trust, compliance, and social proof

- [x] **AVG / DPIA verantwoording** live op `/avg-dpia`: 8 secties
  (doel, gegevens, rechtsgrond met balans-test, verwerkers-lijst,
  technische maatregelen, bewaartermijnen, betrokkenenrechten,
  contact). Privacy-pagina linkt prominent naar deze versie voor
  procurement-teams. Opgenomen in sitemap.
- [x] **ISO 27001 roadmap page** live op `/iso-27001-roadmap`: 17
  controles (A.5.x + A.8.x) gelabeld als Live / In progress / Gepland,
  elk met een concrete beschrijving van welke controle al in de code
  zit (session-cookies, SSRF-guard, CSV-injection, rate-limit, etc.)
  en welke er nog aan zitten te komen (externe pentest, drizzle-kit
  CI, Better Uptime). Summary counts aan de top.
- [x] **Sample maandrapport preview** live op `/voorbeelden/maandrapport`:
  4 summary-cards, 6-maands SVG trendlijn (verstuurd / scans / conversies),
  top-5 PC4 tabel met realistische illustratieve data. Retailers zien
  wat ze krijgen vóór signup. PDF-download komt nadat de real-data
  cron wired is.
- [ ] **Trustpilot / Google reviews** integration with schema.org Review
  markup on the pricing page.
- [x] **Security.txt** at `/.well-known/security.txt` via Next.js rewrite:
  RFC 9116 fields (Contact, Expires, Preferred-Languages, Canonical,
  Policy) serving plain text. Tested end-to-end.
- [x] **Cookie-less Plausible analytics** gewired in root layout.
  Script injecteert alleen wanneer `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` gezet
  is, dus preview-deployments + local dev zijn tracker-loos. Defer-loaded,
  geen cookies, positioneert ons als de privacy-first keuze.
- [x] **Partner logos strip** (`components/landing/PartnerStrip.tsx`)
  tussen "het moment" en testimonials op landing. Toont 6 partner-namen
  (PostNL, Altum AI, Stripe, Print.one, Neon, Vercel) als typografische
  lockups. Straks met echte SVG-logos swap-in zonder call-site change.

## 6. Platform & integrations

Turn LokaalKabaal from a SaaS into a platform that other tools plug into.

- [~] **Public REST API v1 skeleton**: `GET /api/v1/campaigns` returns
  the caller's campaigns as `{data:[...], meta:{count,apiVersion}}`.
  Auth via session cookie today + TODO voor Bearer personal-access-token
  pad zodra retailers een API key kunnen aanmaken. WWW-Authenticate
  header + docs-link in 401. 2 tests. Next: /v1/conversions en
  webhook-subscriptions.
- [ ] **Shopify + WooCommerce plugin**: auto-call `/api/codes/redeem` when
  a customer checks out with one of our codes. Removes manual pincode entry
  for webshops. Listing on Shopify App Store = acquisition channel.
- [ ] **Lightspeed / MplusKASSA POS integration** for in-store redeem.
  Same API surface, different UX.
- [~] **Zapier/Slack integration foundation**: `/docs/webhooks` public
  page documenteert event-types (scan.registered, conversion.registered,
  campaign.dispatched, monthly_report.ready), payload-shape en
  HMAC-SHA256 signatuur-verificatie in Node.js. Retailer kan nu een
  Zapier catch-hook opzetten zodra de DB-tabel voor subscriptions er is.
- [~] **Webhook outbox primitives** (`lib/webhook-outbox.ts`):
  `canonicalJson` (key-sort voor stabiele signatures), `signWebhookBody`
  + `verifyWebhookSignature` (HMAC-SHA256, timing-safe compare),
  `retryDelaySeconds` (exponential backoff 30s→2min→8min→30min→2h),
  typed `WebhookEvent` union. 13 tests. Next: DB-tabel
  `webhook_subscriptions` + cron die queue verwerkt.
- [~] **Gemeente partnership pagina** live op `/gemeenten`: 4 bouwstenen
  (welkomstbooklet, digital embed, verhuisdata-dashboard, co-branded QR),
  inclusief iframe-embed snippet voor gemeentelijke verhuis-landingspagina's
  met `?gemeente=` / `?pc4=` params + "plan kennismakingscall" CTA naar
  gemeenten@lokaalkabaal.agency. Embed-route zelf (/embed/welkomstpakket)
  is nog TBD.
- [~] **Slack + Teams message builders** (`lib/slack-messages.ts`):
  `buildSlackMessage(event)` retourneert block-kit payload,
  `buildTeamsMessage(event)` MessageCard-structure. Beide met
  event-specifieke copy voor scan/conversion/dispatch/monthly-report.
  8 tests. Klaar om vanuit de webhook-outbox delivery-cron aan te roepen.

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
- [~] **Yearly upgrade A/B helper** (`lib/yearly-upgrade.ts`):
  `assignIncentive(retailerId)` buckets retailers deterministisch in 3
  varianten (control 15% discount, first-month-free + 10%, +200
  bonus-flyers), `incentiveCopy(variant)` geeft pill + longTitle +
  subtitlePerTier. 9 tests inclusief hash-stability en alle
  variant-specifieke copy. Wizard + PricingSection UI-wiring is
  de volgende stap.

## 8. Internationalization & expansion

- [ ] **Belgium**: Kadaster-equivalent is Algemene Administratie van de
  Patrimoniumdocumentatie. Altum has a BE feed. Scope a 3-week expansion
  PoC; Flemish-speaking retailers convert at Dutch-ish rates.
- [~] **Engelse UI seed** (`lib/i18n.ts`): typed EN dictionary voor 20
  core UI-strings (landing CTAs + wizard + sidebar + auth tabs),
  `t(locale, key)` helper met fallback naar Dutch source als key
  ontbreekt, `resolveLocale(acceptLanguage, cookie)` parser. 10 tests.
  Next: locale-aware layout dat de header parset en call-sites omzetten
  van hardcoded Dutch naar `t(locale, ...)`.
- [ ] **Germany** as year 2+ bet: Grundbuch data exists, DSGVO-alignment
  is doable, the market is 5x NL. Needs partner on printing side.

## 9. Data products & analytics moat

- [x] **Public NL verhuisdata dashboard** live op `/nl-verhuisdata`:
  hero met landelijke totalen, tabel per provincie (sorted by new-movers)
  met top-3 gemeenten per provincie als inlinks naar de gemeente-
  programmatic pages. `lib/provincie-data.ts` helper + 5 tests. ISR
  revalidate=86400 op de pagina + dynamic OG image met "Open data" badge.
- [x] **Industry benchmark landing pages** live op `/nl-verhuisdata/[branche]`
  voor 6 branches (kapper/bakker/restaurant/installateur/fysio/makelaar).
  Elke pagina toont de nationale markt (klantwaarde × verhuizingen
  × 4% conversie) + provincie-tabel met verwachte maandomzet +
  inlinks naar gemeente-pages. Next: kwartaal-PDF voor bestaande
  retailers bovenop deze publieke versie.
- [x] **Predictive CLV** end-to-end: `lib/predictive-clv.ts` core +
  9 tests + wizard step 6 UI-banner die de verwachte klantwaarde-band
  (low / mid / high EUR) toont op basis van spec + actieve
  bouwjaar/WOZ-filters. `specToBrancheKey` map in de wizard normaliseert
  de verbose branche-labels naar BRANCHE_CLV keys. Retailer ziet nu
  verwacht rendement per jaar vóór Stripe-checkout.
- [x] **Churn signal helper** (`lib/churn-signal.ts`): `assessChurn(series)`
  returnt een severity-bucket (healthy/watch/risk/critical) op basis van
  de laatste maand vs. baseline gemiddelde scan-rate. Epsilon-bewust voor
  floating-point grenssgevallen. 8 tests (te weinig data, stabiele rate,
  15/35/60% drops, out-of-order input, zero-volume maanden skip).
  Next: sluit aan op een cron die retailers proactief mailt.

## 10. Infra & performance

- [ ] **Move user-uploaded logos + hero images to Vercel Blob** (already
  installed) and swap the base64 `<img>` for `next/image` with proper
  responsive srcsets. Dashboard bandwidth drops significantly.
- [x] **Edge ISR aangezet** op de zwaarste publieke pagina's:
  `/flyers-versturen-nieuwe-bewoners`, `/flyers-versturen-[gemeente]`,
  `/nl-verhuisdata` hebben `export const revalidate = 86400` (24h)
  zodat cold visitors altijd een cached HTML krijgen en tier-config
  updates zonder redeploy propageren.
- [ ] **E2E test harness**: Playwright on critical flows (signup, wizard,
  checkout redirect, conversion via pincode). One GHA job, runs against
  a staging deploy per PR.
- [x] **Telemetry surface** (`lib/telemetry.ts`) met `captureError`,
  `captureWarning`, `captureEvent` helpers + 6 tests. ErrorBoundary gebruikt
  nu `captureError` i.p.v. kale `console.error`. Swap-in point voor Sentry
  / Highlight is nu één file; nieuwe callers worden automatisch meegenomen.
  Volgende stap: install `@sentry/nextjs` en vervang `console.*` calls in
  de helpers door Sentry hooks.
- [~] **Database migration scripts** aan `package.json` toegevoegd:
  `npm run db:check` (drizzle-kit check voor drift), `npm run db:generate`,
  `npm run db:migrate`. Maakt het triviaal om een GHA-step te toevoegen
  die `db:check` runt en een PR blokkeert bij ongenoteerde schema-drift.
  De GHA workflow zelf is nog niet toegevoegd.
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
- [x] **Plain-language samenvatting** bovenaan `/privacy` en `/voorwaarden`:
  `PlainLanguageToggle` component toont 5-6 bullet-point TL;DR in gewone
  taal, standaard uitgeklapt zodat de bounce-rate op legal pages daalt.
  aria-expanded + collapsible.
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
