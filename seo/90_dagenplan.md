# 90-Dagenplan — SEO Uitvoering LokaalKabaal.agency

**Start:** Week 1 na publicatie van dit document
**Doel na 90 dagen:** Organisch vindbaar op alle primaire zoekwoorden, technische basis solide, eerste backlinks actief

**Rollen:**
- **Oprichter** = eigenaar van het bedrijf, verantwoordelijk voor content-review, PR-contacten, en strategische beslissingen
- **Developer** = verantwoordelijk voor technische implementatie (Next.js, Vercel, schema markup, robots.txt, sitemap)
- **Schrijver** = verantwoordelijk voor het schrijven en publiceren van landingspagina- en blogteksten

---

## Weken 1–2: Technische Basis

### Week 1

**Taken:**
- [ ] **Developer:** `robots.txt` implementeren conform de checklist in `technische_seo_checklist.md` — blokkeer `/api/`, `/dashboard/`, `/admin/`, UTM-parameters
- [ ] **Developer:** `sitemap.xml` genereren via `app/sitemap.ts` — alle 25+ URLs met juiste prioriteiten
- [ ] **Developer:** Canonical tags implementeren op alle bestaande pagina's via `metadata.alternates.canonical` in Next.js
- [ ] **Developer:** `<html lang="nl">` verifiëren in root layout; `next/font` activeren voor alle fonts
- [ ] **Oprichter:** Google Search Console activeren, eigendom verifiëren, sitemap indienen

**KPI Week 1:** Sitemap geïndexeerd in Search Console, 0 Critical Errors in GSC

---

### Week 2

**Taken:**
- [ ] **Developer:** Core Web Vitals meten via PageSpeed Insights en Vercel Analytics — baseline vastleggen voor LCP, INP, CLS
- [ ] **Developer:** `next/image` op alle afbeeldingen controleren — hero-afbeelding heeft `priority` prop
- [ ] **Developer:** Schema markup voor homepage implementeren: SoftwareApplication + FAQPage + Organization (volledig JSON-LD uit `technische_seo_checklist.md`)
- [ ] **Developer:** Open Graph tags implementeren voor homepage en alle bestaande pagina's
- [ ] **Oprichter:** Bing Webmaster Tools activeren + Google Bedrijfsprofiel aanmaken en volledig invullen

**KPI Week 2:** LCP homepage < 3.0s (baseline), alle schema markup valide (test via schema.org validator), GSC toont 0 Coverage Errors

---

## Weken 3–4: Core Pagina's Live

### Week 3

**Taken:**
- [ ] **Schrijver:** Landingspagina `/flyers-versturen-nieuwe-bewoners` schrijven en publiceren conform `landingspagina_flyers_nieuwe_bewoners.md` — inclusief FAQPage schema markup
- [ ] **Schrijver:** Landingspagina `/direct-mail-mkb` schrijven en publiceren conform `landingspagina_direct_mail_mkb.md` — inclusief FAQPage schema markup
- [ ] **Developer:** Interne linking instellen: homepage → beide landingspagina's met juiste ankerteksten conform de linkarchitectuurstabel in `technische_seo_checklist.md`
- [ ] **Developer:** BreadcrumbList schema markup implementeren op beide nieuwe pagina's
- [ ] **Oprichter:** URLs indienen voor indexering in Google Search Console via "URL Inspecteren"

**KPI Week 3:** Beide landingspagina's geïndexeerd in GSC, schema markup valide, interne links actief

---

### Week 4

**Taken:**
- [ ] **Schrijver:** Kapperspagina `/flyers-versturen-kapper` live zetten conform het volledige kappersdeel van `branchepagina_template.md`
- [ ] **Developer:** Canonical en OG-tags voor alle nieuwe pagina's controleren — geen duplicate titles, geen ontbrekende descriptions
- [ ] **Developer:** Core Web Vitals tweede meting — LCP, INP, CLS target halen (LCP < 2.5s)
- [ ] **Oprichter:** Trustpilot-profiel aanmaken; eerste 3 bestaande klanten vragen een review te schrijven
- [ ] **Oprichter:** Capterra en G2 listings aanmaken (gratis basisprofiel)

**KPI Week 4:** 3 commerciële pagina's live en geïndexeerd, LCP homepage < 2.5s, Trustpilot-profiel actief met minimaal 1 review

---

## Weken 5–8: Content & Branche-pagina's

### Week 5

**Taken:**
- [ ] **Schrijver:** Blog artikel 1 publiceren: "Verhuiskaart Nederland 2024" (`/blog/verhuiskaart-nederland`) — inclusief top-20 tabel en datavisualisatie
- [ ] **Schrijver:** Blog artikel 2 publiceren: "Kadaster eigendomsoverdracht uitgelegd" (`/blog/kadaster-eigendomsoverdracht-uitleg`)
- [ ] **Oprichter:** Persbericht schrijven voor Emerce/MarketingTribune met haak: "Eerste NL-platform koppelt Kadaster aan geautomatiseerde direct mail voor MKB"
- [ ] **Developer:** Article schema markup implementeren op beide blogartikelen
- [ ] **Oprichter:** Product Hunt launch voorbereiden (screenshots, beschrijving, makers-tekst)

**KPI Week 5:** 2 blogartikelen live, persbericht klaar, Product Hunt draft gereed

---

### Week 6

**Taken:**
- [ ] **Schrijver:** Bakkerij-branchepagina `/flyers-versturen-bakker` live zetten (gebruik template uit `branchepagina_template.md`, pas kappers-inhoud aan voor bakkers)
- [ ] **Schrijver:** Installateur-branchepagina `/flyers-versturen-installateur` live zetten
- [ ] **Oprichter:** Product Hunt lanceren — aankondiging via LinkedIn en eigen netwerk voor upvotes op dag 1
- [ ] **Oprichter:** Persbericht insturen naar Emerce, MarketingTribune, en Startups.nl
- [ ] **Developer:** Interne links updaten: homepage branches-sectie linkt nu naar alle 3 branchepagina's

**KPI Week 6:** 2 nieuwe branchepagina's live, Product Hunt gelanceerd, 1 persbericht verstuurd

---

### Week 7

**Taken:**
- [ ] **Schrijver:** Blog artikel 3 publiceren: "Hoe lang duurt het voor nieuwe bewoners vaste klanten worden?" (`/blog/nieuwe-bewoners-voorkeursleverancier`)
- [ ] **Schrijver:** Blog artikel 4 publiceren: "Direct mail effectiviteit 2025" (`/blog/direct-mail-effectiviteit-2025`)
- [ ] **Schrijver:** Restaurant-branchepagina `/flyers-versturen-restaurant` live zetten
- [ ] **Oprichter:** Outreach naar Bakkersvak.nl en Kappersweb.nl — pitch voor branche-specifiek gastblog
- [ ] **Developer:** `/blog` overzichtspagina aanmaken met interne links naar alle gepubliceerde artikelen

**KPI Week 7:** 2 nieuwe blogartikelen live, restaurantpagina live, 2 outreach-berichten verstuurd

---

### Week 8

**Taken:**
- [ ] **Schrijver:** Blog artikel 5 publiceren: "Nieuwe klanten werven als lokale winkel" (`/blog/marketing-tips-lokale-winkel`) — langste artikel (2.000 woorden), kandidaat voor featured snippet
- [ ] **Schrijver:** Makelaar-branchepagina `/flyers-versturen-makelaar` live zetten
- [ ] **Oprichter:** Follow-up op outreach week 7; pitch naar Frankwatching voor gastblog
- [ ] **Oprichter:** ZZP Nederland listing aanmaken; Startups.nl profiel compleet maken
- [ ] **Developer:** Sitemap updaten met alle nieuwe pagina's; opnieuw indienen in Search Console

**KPI Week 8:** 5 branchepagina's live, 5 blogartikelen live, 1 response op PR-outreach, sitemap geüpdated

---

## Weken 9–12: Authority Building & Optimalisatie

### Week 9

**Taken:**
- [ ] **Schrijver:** Blog artikel 6 publiceren: "ROI berekenen van een flyercampagne" (`/blog/roi-flyer-campagne`)
- [ ] **Schrijver:** Blog artikel 7 publiceren: "Google Ads vs. direct mail voor lokale MKB" (`/blog/google-ads-vs-direct-mail-mkb`)
- [ ] **Oprichter:** Frankwatching gastblog schrijven en insturen (750–1.000 woorden, link naar `/direct-mail-mkb`)
- [ ] **Oprichter:** GSC-data analyseren: welke pagina's hebben impressies maar weinig klikken? Title tags en meta descriptions aanpassen.
- [ ] **Developer:** hreflang implementeren voor NL-NL conform de checklist

**KPI Week 9:** 2 nieuwe blogartikelen live, gastblog ingediend, 1e GSC-optimalisatieronde afgerond

---

### Week 10

**Taken:**
- [ ] **Schrijver:** Blog artikel 8 publiceren: "Welkomstmarketing strategie" (`/blog/welkomstmarketing-strategie`)
- [ ] **Oprichter:** Linkbuilding outreach: e-mail naar 5 MKB-blogs en ondernemersplatforms met verzoek tot vermelding van de Verhuiskaart Nederland als data-bron
- [ ] **Oprichter:** Eerste klanttestimonials ophalen voor homepage social proof — minimaal 3 concrete quotes met naam + bedrijf
- [ ] **Developer:** A/B-test opzetten voor CTA-tekst op homepage (Vercel Edge Config of eenvoudige variant)
- [ ] **Oprichter:** Capterra en G2 profielen verrijken met screenshots en beschrijving

**KPI Week 10:** 8 blogartikelen live, 5 linkbuilding outreach-e-mails verstuurd, testimonials op homepage

---

### Week 11

**Taken:**
- [ ] **Schrijver:** Blog artikel 9 publiceren: "Verhuispiek Nederland — lente en zomer" (`/blog/verhuispiek-nederland-lente-zomer`)
- [ ] **Schrijver:** Blog artikel 10 publiceren: "Flyers voor kappers" (`/blog/flyers-kappers-nieuwe-klanten`)
- [ ] **Oprichter:** Verhuiskaart Nederland als data-bron pitchen bij 3 woon- en vastgoedmedia (NUL.nl, Vastgoedjournaal, Huizenzoeker)
- [ ] **Developer:** Pagespeed-audit herhalen: alle Core Web Vitals opnieuw meten, acties definiëren voor resterende gaps
- [ ] **Oprichter:** GSC positie-rapport: welke zoekwoorden staan op positie 11–20? Content op die pagina's uitbreiden of verbeteren.

**KPI Week 11:** 10 blogartikelen live, 3 vastgoed-outreach verstuurd, CWV < targets op alle pagina's

---

### Week 12

**Taken:**
- [ ] **Schrijver:** Blog artikel 11 publiceren: "Flyers voor bakkers" (`/blog/flyers-bakkers-nieuwe-bewoners`)
- [ ] **Schrijver:** Blog artikel 12 publiceren: "Installateur marketing voor nieuwe huiseigenaren" (`/blog/installateur-marketing-nieuwe-huiseigenaren`)
- [ ] **Oprichter:** Volledige linkbuilding rapportage: welke backlinks zijn binnengekomen? (Ahrefs of Google Search Console links-rapport)
- [ ] **Oprichter + Developer:** 90-dagen evaluatie: KPI-dashboard invullen, prioriteiten bepalen voor maanden 4–6
- [ ] **Oprichter:** Plan voor BE-expansie (Belgisch-Nederlandse markt) opstellen op basis van 90-dagen data

**KPI Week 12:** Alle 12 blogartikelen live, 90-dagen evaluatie afgerond, backlink-rapport beschikbaar

---

## KPI-Dashboard na 90 Dagen

### Zoekwoord Rankings (doel: pagina 1 Google NL)

| Zoekwoord | Positie doel (dag 90) | Hoe te meten |
|---|---|---|
| flyers versturen nieuwe bewoners | Top 3 | Google Search Console + Ahrefs/Semrush |
| automatisch flyers sturen | Top 5 | Google Search Console |
| welkomstflyer nieuwe bewoners | Top 3 | Google Search Console |
| direct mail nieuwe bewoners | Top 10 | Google Search Console |
| verhuistrigger marketing | Top 3 | Google Search Console |
| flyers versturen kapper | Top 5 | Google Search Console |
| hoeveel mensen verhuizen per jaar nederland | Top 10 | Google Search Console |
| kadaster eigendomsoverdracht hoe werkt het | Top 10 | Google Search Console |
| direct mail mkb | Top 10 | Google Search Console |
| marketing nieuwe huiseigenaren nederland | Top 5 | Google Search Console |

---

### Organische Bezoekers per Maand

| Periode | Doel | Bron |
|---|---|---|
| Einde maand 1 | 50–100 bezoekers/mnd | Google Analytics 4 |
| Einde maand 2 | 200–400 bezoekers/mnd | Google Analytics 4 |
| Einde maand 3 | 500–1.000 bezoekers/mnd | Google Analytics 4 |

*Opmerking: SEO heeft een aanlooptijd. Resultaten van publicaties in week 1 zijn pas volledig zichtbaar na 8–12 weken. De doelen voor maand 3 reflecteren het gecombineerde effect van alle content uit de voorgaande weken.*

---

### Backlinks

| Metric | Doel dag 90 |
|---|---|
| Totaal verwijzende domeinen | Minimaal 15 |
| Verwijzende domeinen DA30+ | Minimaal 5 |
| Vermeldingen in branche-media | Minimaal 3 |
| Product Hunt: top 10 van de dag | Ja/Nee |

---

### Core Web Vitals

| Metric | Target | Status dag 90 |
|---|---|---|
| LCP homepage | < 2.5 seconden | [ ] |
| INP homepage | < 200 ms | [ ] |
| CLS homepage | < 0.1 | [ ] |
| LCP landingspagina's | < 2.5 seconden | [ ] |

---

### Conversie (Organisch Verkeer)

| Metric | Definitie | Doel dag 90 |
|---|---|---|
| Organische aanvragen | Aanmeldingen / demo-verzoeken via organisch verkeer | Minimaal 5 |
| Organische conversieratio | Aanvragen / organische bezoekers | > 1% |
| Kosten per organische aanvraag | SEO-investering (uren) / aanvragen | < €100 equivalent |

---

## Meetmethode

### Tools

| Tool | Doel | Frequentie |
|---|---|---|
| **Google Search Console** | Zoekwoordposities, impressies, klikken, indexeringsstatus, backlinks | Wekelijks |
| **Google Analytics 4** | Organisch verkeer, sessiebron, conversies, pagina-gedrag | Wekelijks |
| **Vercel Analytics** | Core Web Vitals per route, real-user data | Wekelijks |
| **PageSpeed Insights** | LCP, INP, CLS per pagina (lab data) | Bij elke nieuwe publicatie |
| **Ahrefs (of Semrush)** | Backlink monitoring, zoekwoordposities, concurrentenanalyse | Maandelijks |
| **Schema.org Validator** | Schema markup validatie | Bij elke nieuwe pagina |
| **Google Rich Results Test** | FAQ-schema zichtbaarheid in SERP | Bij elke nieuwe pagina |

---

### Rapportages

**Wekelijks (elke maandag, 30 min):**
- GSC: nieuwe klikken, impressies, positieveranderingen
- GA4: organisch sessieaantal vs. vorige week
- Gepubliceerde content deze week

**Maandelijks (eerste maandag van de maand, 2 uur):**
- Volledige zoekwoordpositie-rapportage (alle 10 primaire zoekwoorden)
- Backlink-rapportage: nieuwe links, verloren links
- Core Web Vitals meting alle pagina's
- Conversie-analyse: hoeveel aanvragen via organisch kanaal?
- Contentplanning volgende maand: welke artikelen, welke aanpassingen?

**Na 90 dagen (grote evaluatie, 4 uur):**
- KPI-dashboard volledig invullen en vergelijken met doelen
- Top 5 beste presterende pagina's identificeren — investeer hierin verder
- Zoekwoorden die op pagina 2 staan — gerichte optimalisatieacties
- Beslissing: doorgaan met zelfde strategie, bijsturen, of versnellen?

---

## Risico's en Mitigatie

| Risico | Kans | Impact | Mitigatie |
|---|---|---|---|
| Google indexeert pagina's langzaam | Middel | Hoog | Indienen via GSC URL Inspect; interne links vanuit homepage zorgen voor snelle ontdekking |
| Content scoort niet op doelzoekwoord | Middel | Middel | Monitor GSC na 6 weken; pas title, H1, en eerste 200 woorden aan als positie > 30 |
| Geen backlinks na 90 dagen | Laag | Hoog | Product Hunt en Emerce-persbericht zijn de hoogste kans-items; focus hier maximale energie op |
| Core Web Vitals halen target niet | Laag | Middel | Vercel biedt van nature goede performance; next/image en next/font zijn de twee grootste hefbomen |
| Concurrent kopieert aanpak | Laag | Middel | EEAT-content (originele data, klanttestimonials) en Kadaster-integratie zijn niet snel na te bouwen |
