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
