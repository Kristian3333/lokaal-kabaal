# Technische SEO Checklist — LokaalKabaal.agency

**Stack:** Next.js (App Router) + Vercel
**Datum:** 2026-Q1
**Prioriteit:** [KRITIEK] = blokkeert rankings | [HOOG] = significante rankingimpact | [MIDDEL] = optimalisatie

---

## 1. Core Web Vitals — Targets 2025

| Metric | Target | Status-kolom | Next.js/Vercel tip |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5 seconden | [ ] | Gebruik `next/image` met `priority` prop op hero-afbeelding; zet LCP-element boven de vouw |
| **INP** (Interaction to Next Paint) | < 200 milliseconden | [ ] | Vermijd zware client-side JS op landingspagina's; gebruik React Server Components waar mogelijk |
| **CLS** (Cumulative Layout Shift) | < 0.1 | [ ] | Altijd breedte + hoogte opgeven op `<Image>` componenten; reserveer ruimte voor fonts met `font-display: swap` |
| **TTFB** (Time to First Byte) | < 800ms | [ ] | Vercel Edge Network is standaard actief; gebruik `cache: 'force-cache'` voor statische data-fetches |
| **FCP** (First Contentful Paint) | < 1.8 seconden | [ ] | Zet kritieke CSS inline; verwijder render-blocking resources |

**[KRITIEK] Core Web Vitals actiepunten voor Next.js/Vercel:**

- [ ] **LCP-afbeelding:** Hero-afbeelding altijd via `<Image priority />` — nooit via CSS background-image
- [ ] **Font loading:** Gebruik `next/font` met `display: 'swap'` voor alle webfonts
- [ ] **JavaScript bundle:** Analyseer met `@next/bundle-analyzer`; verwijder ongebruikte dependencies
- [ ] **Image formats:** Vercel serveert automatisch WebP/AVIF via `next/image` — zorg dat alle afbeeldingen via deze component gaan
- [ ] **Prefetching:** `<Link prefetch>` is standaard actief in Next.js — zorg dat navigatie snel aanvoelt
- [ ] **Streaming:** Gebruik `loading="lazy"` voor afbeeldingen buiten de viewport
- [ ] **Edge middleware:** Pas minimale middleware toe — elke middleware-laag voegt TTFB toe

---

## 2. Schema Markup Implementatie

**[KRITIEK]**

- [ ] **SoftwareApplication** — op homepage en prijspagina
- [ ] **FAQPage** — op homepage, alle landingspagina's, en branchepagina's
- [ ] **LocalBusiness** — voor de "Over ons" / contactpagina
- [ ] **BreadcrumbList** — op alle pagina's dieper dan niveau 1
- [ ] **Article** — op alle blogartikelen
- [ ] **Organization** — op homepage (naast SoftwareApplication)

**Implementatie in Next.js (App Router):**
```tsx
// app/layout.tsx of per pagina in page.tsx
export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    // ... volledig schema
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* pagina-content */}
    </>
  )
}
```

**Volledig SoftwareApplication + FAQPage schema voor homepage — zie sectie 8 onderaan dit document.**

---

## 3. robots.txt

**[KRITIEK] — Volledig uitgeschreven, direct te gebruiken:**

```
User-agent: *
Allow: /

# Blokkeer interne zoekresultaten en admin-routes
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /_next/
Disallow: /auth/

# Blokkeer URL-parameters die duplicate content veroorzaken
Disallow: /*?ref=
Disallow: /*?utm_
Disallow: /*?fbclid=
Disallow: /*?gclid=

# Sitemap
Sitemap: https://lokaalkabaal.agency/sitemap.xml

# Crawl-delay voor minder relevante bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

User-agent: MJ12bot
Disallow: /
```

---

## 4. Sitemap.xml Structuur

**[KRITIEK]**

Alle te indexeren URL's — gebruik `next-sitemap` package of handmatige `app/sitemap.ts`:

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Prioriteit 1.0 — core commerciële pagina's
    { url: 'https://lokaalkabaal.agency/', changeFrequency: 'weekly', priority: 1.0 },
    { url: 'https://lokaalkabaal.agency/flyers-versturen-nieuwe-bewoners', changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://lokaalkabaal.agency/direct-mail-mkb', changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://lokaalkabaal.agency/prijzen', changeFrequency: 'weekly', priority: 0.9 },

    // Prioriteit 0.8 — branchepagina's
    { url: 'https://lokaalkabaal.agency/flyers-versturen-kapper', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://lokaalkabaal.agency/flyers-versturen-bakker', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://lokaalkabaal.agency/flyers-versturen-installateur', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://lokaalkabaal.agency/flyers-versturen-makelaar', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://lokaalkabaal.agency/flyers-versturen-restaurant', changeFrequency: 'monthly', priority: 0.8 },

    // Prioriteit 0.7 — ondersteunende pagina's
    { url: 'https://lokaalkabaal.agency/hoe-het-werkt', changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://lokaalkabaal.agency/over-ons', changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://lokaalkabaal.agency/contact', changeFrequency: 'monthly', priority: 0.7 },

    // Prioriteit 0.6 — blog/kennisbank
    { url: 'https://lokaalkabaal.agency/blog', changeFrequency: 'weekly', priority: 0.6 },
    { url: 'https://lokaalkabaal.agency/blog/verhuiskaart-nederland', changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://lokaalkabaal.agency/blog/kadaster-eigendomsoverdracht-uitleg', changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://lokaalkabaal.agency/blog/nieuwe-bewoners-voorkeursleverancier', changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://lokaalkabaal.agency/blog/direct-mail-effectiviteit-2025', changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://lokaalkabaal.agency/blog/marketing-tips-lokale-winkel', changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://lokaalkabaal.agency/blog/roi-flyer-campagne', changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://lokaalkabaal.agency/blog/google-ads-vs-direct-mail-mkb', changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://lokaalkabaal.agency/blog/welkomstmarketing-strategie', changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://lokaalkabaal.agency/blog/verhuispiek-nederland-lente-zomer', changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://lokaalkabaal.agency/blog/flyers-kappers-nieuwe-klanten', changeFrequency: 'yearly', priority: 0.5 },
    { url: 'https://lokaalkabaal.agency/blog/flyers-bakkers-nieuwe-bewoners', changeFrequency: 'yearly', priority: 0.5 },
    { url: 'https://lokaalkabaal.agency/blog/installateur-marketing-nieuwe-huiseigenaren', changeFrequency: 'yearly', priority: 0.5 },

    // Prioriteit 0.3 — juridisch
    { url: 'https://lokaalkabaal.agency/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://lokaalkabaal.agency/voorwaarden', changeFrequency: 'yearly', priority: 0.3 },
  ]
}
```

---

## 5. Canonical Tags Strategie

**[HOOG]**

- [ ] Elke pagina heeft een self-referencing canonical tag
- [ ] UTM-parameter URLs canonical naar de schone URL
- [ ] Paginering (als van toepassing): gebruik `rel="next"` + `rel="prev"` + canonical op pagina 1

**Implementatie in Next.js (App Router):**
```tsx
// app/flyers-versturen-nieuwe-bewoners/page.tsx
export const metadata: Metadata = {
  alternates: {
    canonical: '/flyers-versturen-nieuwe-bewoners',
  },
}
```

**[MIDDEL] Regels:**
- Trailing slash: kies één standaard (`/` of geen `/`) en houd het consistent in canonical + sitemap
- HTTPS: alle canonicals verwijzen naar https:// versie
- www vs. non-www: kies één en gebruik het overal consistent

---

## 6. hreflang — NL + toekomstige BE-expansie

**[MIDDEL] Nu:**
```html
<link rel="alternate" hreflang="nl-NL" href="https://lokaalkabaal.agency/" />
<link rel="alternate" hreflang="x-default" href="https://lokaalkabaal.agency/" />
```

**[MIDDEL] Bij BE-expansie (Belgisch Nederlands):**
```html
<link rel="alternate" hreflang="nl-NL" href="https://lokaalkabaal.agency/" />
<link rel="alternate" hreflang="nl-BE" href="https://lokaalkabaal.agency/be/" />
<link rel="alternate" hreflang="x-default" href="https://lokaalkabaal.agency/" />
```

**Strategie BE-expansie:** Gebruik submap `/be/` boven subdomain `be.lokaalkabaal.agency` — dit houdt domeinautoriteit gecentraliseerd en is eenvoudiger te beheren in Next.js.

---

## 7. Internal Linking Architectuur

**[HOOG]**

| Van (bron) | Naar (bestemming) | Ankertekst | Prioriteit |
|---|---|---|---|
| Homepage hero | /flyers-versturen-nieuwe-bewoners | "flyers versturen naar nieuwe bewoners" | Kritiek |
| Homepage branches | /flyers-versturen-kapper | "LokaalKabaal voor kappers" | Hoog |
| Homepage branches | /flyers-versturen-bakker | "LokaalKabaal voor bakkers" | Hoog |
| Homepage branches | /flyers-versturen-installateur | "LokaalKabaal voor installateurs" | Hoog |
| Homepage branches | /flyers-versturen-makelaar | "LokaalKabaal voor makelaars" | Hoog |
| Homepage branches | /flyers-versturen-restaurant | "LokaalKabaal voor restaurants" | Hoog |
| /flyers-versturen-nieuwe-bewoners | /direct-mail-mkb | "direct mail voor MKB" | Hoog |
| /direct-mail-mkb | /flyers-versturen-nieuwe-bewoners | "flyers versturen naar nieuwe bewoners" | Hoog |
| /flyers-versturen-kapper | /blog/flyers-kappers-nieuwe-klanten | "meer over kappers en flyers" | Middel |
| /blog/verhuiskaart-nederland | /flyers-versturen-nieuwe-bewoners | "bereik nieuwe bewoners" | Hoog |
| /blog/verhuiskaart-nederland | /direct-mail-mkb | "direct mail voor lokale MKB" | Hoog |
| /blog/kadaster-* | /flyers-versturen-nieuwe-bewoners | "automatisch flyers versturen via Kadaster" | Hoog |
| /blog/roi-flyer-campagne | /prijzen | "bekijk de prijzen" | Hoog |
| Alle blogartikelen | Homepage | "LokaalKabaal" (merknaam, 1× per artikel) | Middel |
| /over-ons | Homepage | "terug naar de homepage" | Laag |
| Footer (alle pagina's) | /flyers-versturen-nieuwe-bewoners | "Flyers nieuwe bewoners" | Middel |
| Footer (alle pagina's) | /direct-mail-mkb | "Direct mail MKB" | Middel |

**Regels:**
- Maximum 1 exact-match ankertekst per pagina naar dezelfde bestemming
- Breadcrumbs op alle pagina's dieper dan niveau 1
- Geen orphan pages — elke pagina heeft minimaal 2 inkomende interne links

---

## 8. Pagespeed Optimalisatie — Vercel/Next.js Specifiek

**[KRITIEK]**

- [ ] **next/image op alle afbeeldingen** — automatische WebP-conversie, lazy loading, size hints
- [ ] **next/font voor alle fonts** — elimineert render-blocking font-requests, inlines font-face in CSS
- [ ] **Dynamic imports voor zware componenten** — gebruik `dynamic(() => import(...), { ssr: false })` voor dashboard-widgets
- [ ] **Vercel Analytics activeren** — gratis Core Web Vitals monitoring per route

**[HOOG]**

- [ ] **Static generation voor marketing-pagina's** — alle landingspagina's, branchepagina's en blogartikelen zijn statisch (SSG), niet server-side rendered
- [ ] **Edge caching voor API-routes** — voeg `cache-control: public, s-maxage=3600` headers toe aan Kadaster-data endpoints
- [ ] **Preconnect voor externe resources** — voeg `<link rel="preconnect">` toe voor Google Fonts (als niet via next/font) en analytics scripts
- [ ] **CSS bundling** — Tailwind CSS purging is standaard actief; verifieer dat `content` config alle componenten dekt

**[MIDDEL]**

- [ ] **Third-party scripts** — laad Google Analytics, Hotjar etc. via `next/script` met `strategy="afterInteractive"`
- [ ] **Viewport meta tag** — `<meta name="viewport" content="width=device-width, initial-scale=1" />` is standaard in Next.js App Router — verifieer

---

## 9. Open Graph Tags — Templates per Paginatype

**[HOOG]**

### Template: Homepage
```tsx
export const metadata: Metadata = {
  title: 'Flyers Versturen Nieuwe Bewoners — Automatisch | LokaalKabaal',
  description: 'LokaalKabaal verstuurt automatisch gepersonaliseerde flyers naar nieuwe huiseigenaren op basis van Kadaster-data. Wees er eerder. Vanaf €49/mnd.',
  openGraph: {
    title: 'Wees er eerder — Automatisch flyers bij nieuwe bewoners | LokaalKabaal',
    description: 'Kadaster-trigger → gepersonaliseerde flyer → bezorgd binnen 2 werkdagen. Volledig automatisch voor lokale MKB.',
    url: 'https://lokaalkabaal.agency/',
    siteName: 'LokaalKabaal',
    images: [
      {
        url: 'https://lokaalkabaal.agency/og/homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'LokaalKabaal — Automatisch flyers versturen naar nieuwe bewoners via Kadaster',
      },
    ],
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Automatisch flyers bij nieuwe bewoners | LokaalKabaal',
    description: 'Kadaster-trigger → flyer op de mat binnen 2 werkdagen. Volledig automatisch voor lokale MKB.',
    images: ['https://lokaalkabaal.agency/og/homepage.jpg'],
  },
}
```

### Template: Landingspagina
```tsx
export const metadata: Metadata = {
  title: '[PAGINA TITEL] | LokaalKabaal',
  description: '[PAGINA META DESCRIPTION]',
  openGraph: {
    title: '[PAGINA TITEL]',
    description: '[PAGINA META DESCRIPTION]',
    url: 'https://lokaalkabaal.agency/[SLUG]',
    siteName: 'LokaalKabaal',
    images: [
      {
        url: 'https://lokaalkabaal.agency/og/[SLUG].jpg',
        width: 1200,
        height: 630,
        alt: '[ALT TEKST MET PRIMAIR ZOEKWOORD]',
      },
    ],
    locale: 'nl_NL',
    type: 'website',
  },
}
```

### Template: Blogartikel
```tsx
export const metadata: Metadata = {
  title: '[ARTIKEL TITEL] | LokaalKabaal Blog',
  description: '[ARTIKEL META DESCRIPTION]',
  openGraph: {
    title: '[ARTIKEL TITEL]',
    description: '[ARTIKEL META DESCRIPTION]',
    url: 'https://lokaalkabaal.agency/blog/[SLUG]',
    siteName: 'LokaalKabaal',
    images: [
      {
        url: 'https://lokaalkabaal.agency/og/blog/[SLUG].jpg',
        width: 1200,
        height: 630,
        alt: '[ALT TEKST]',
      },
    ],
    locale: 'nl_NL',
    type: 'article',
    publishedTime: '[ISO_DATE]',
    authors: ['LokaalKabaal'],
  },
}
```

---

## 10. Schema Markup JSON-LD Homepage — Volledig

**[KRITIEK] — Kant-en-klaar te plakken in `<script type="application/ld+json">`:**

```json
[
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LokaalKabaal",
    "url": "https://lokaalkabaal.agency",
    "description": "SaaS-platform dat automatisch gepersonaliseerde direct mail flyers verstuurt naar nieuwe huiseigenaren op basis van Kadaster-data. Kadaster-trigger, druk, bezorging — binnen 2 werkdagen.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "inLanguage": "nl-NL",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": "49.00",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "49.00",
        "priceCurrency": "EUR",
        "unitText": "MONTH"
      },
      "availability": "https://schema.org/InStock"
    },
    "provider": {
      "@type": "Organization",
      "name": "LokaalKabaal",
      "url": "https://lokaalkabaal.agency",
      "logo": {
        "@type": "ImageObject",
        "url": "https://lokaalkabaal.agency/logo.svg"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "Dutch",
        "email": "hallo@lokaalkabaal.agency"
      }
    },
    "featureList": [
      "Automatische Kadaster-koppeling",
      "Gepersonaliseerde flyerdruk",
      "Bezorging binnen 2 werkdagen",
      "Postcode-targeting op wijkniveau",
      "Realtime dashboard met verzendoverzicht",
      "Geen contracten, per maand opzegbaar",
      "Branche-specifieke flyertemplates"
    ],
    "screenshot": "https://lokaalkabaal.agency/screenshots/dashboard.jpg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "47",
      "bestRating": "5",
      "worstRating": "1"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LokaalKabaal",
    "url": "https://lokaalkabaal.agency",
    "logo": "https://lokaalkabaal.agency/logo.svg",
    "description": "SaaS-platform voor geautomatiseerde direct mail aan nieuwe bewoners op basis van Kadaster-data.",
    "foundingDate": "2024",
    "areaServed": {
      "@type": "Country",
      "name": "Netherlands"
    },
    "knowsAbout": [
      "Direct mail marketing",
      "Kadaster eigendomsoverdrachten",
      "Lokale MKB marketing",
      "Verhuistrigger marketing"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Hoe snel ontvangen nieuwe bewoners mijn flyer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Zodra het Kadaster een eigendomsoverdracht registreert in uw doelpostcodes, start LokaalKabaal automatisch het druk- en bezorgproces. De flyer ligt gemiddeld binnen 2 werkdagen op de mat — ruimschoots binnen het kritieke 30-dagen venster."
        }
      },
      {
        "@type": "Question",
        "name": "Voor welke branches is LokaalKabaal geschikt?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "LokaalKabaal werkt voor elke lokale ondernemer met een vaste klantrelatie: kappers, bakkers, installateurs, makelaars, restaurants, fysiotherapeuten, tandartsen en meer."
        }
      },
      {
        "@type": "Question",
        "name": "Moet ik zelf een flyer ontwerpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nee. U levert uw logo en de gewenste tekst. Onze branche-specifieke templates zijn drukklaar. Eenmalige setup, daarna volledig automatisch."
        }
      },
      {
        "@type": "Question",
        "name": "Aan welk adres wordt de flyer bezorgd?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "De flyer wordt bezorgd op het adres van de nieuwe eigendomsoverdracht zoals geregistreerd bij het Kadaster — het exacte woonadres van de nieuwe bewoner. U kiest zelf welke postcodes u target."
        }
      },
      {
        "@type": "Question",
        "name": "Wat kost LokaalKabaal per verstuurde flyer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "LokaalKabaal werkt met een maandelijks abonnement. Druk en bezorging zijn inbegrepen voor alle eigendomsoverdrachten in uw gekozen postcodes. Geen verborgen kosten per stuk."
        }
      }
    ]
  }
]
```

---

## 11. Aanvullende Checklist Items

**[KRITIEK]**
- [ ] HTTPS actief en alle HTTP-requests worden doorgestuurd naar HTTPS
- [ ] www → non-www redirect (of andersom) consistent geconfigureerd in Vercel
- [ ] 404-pagina geeft HTTP 404-statuscode terug (niet 200)
- [ ] Geen indexeerbare duplicate content (test met Screaming Frog of Sitebulb)

**[HOOG]**
- [ ] Google Search Console geconfigureerd en sitemap ingediend
- [ ] Bing Webmaster Tools geconfigureerd (gratis, additioneel bereik)
- [ ] Broken link scan voor lancering (Ahrefs of gratis alternatief: Broken Link Checker)
- [ ] Mobile-friendliness test geslaagd (Google Mobile-Friendly Test)

**[MIDDEL]**
- [ ] Favicon aanwezig (alle formaten: 16x16, 32x32, 180x180 Apple touch icon)
- [ ] `<html lang="nl">` aanwezig op alle pagina's
- [ ] Geen lege title tags of duplicate title tags
- [ ] Afbeeldingen hebben alt-teksten (geen lege alt op decoratieve afbeeldingen — gebruik `alt=""`)
