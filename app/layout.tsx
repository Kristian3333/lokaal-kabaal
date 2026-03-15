import type { Metadata } from "next";
import "./globals.css";

const siteUrl = 'https://lokaalkabaal.agency';

export const metadata: Metadata = {
  title: {
    default: "Flyers Versturen Nieuwe Bewoners — Automatisch | LokaalKabaal",
    template: "%s | LokaalKabaal",
  },
  description: "LokaalKabaal verstuurt automatisch gepersonaliseerde flyers naar nieuwe huiseigenaren op basis van Kadaster-data. Wees er eerder dan de concurrent. Vanaf €49/mnd.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "LokaalKabaal",
    title: "Flyers Versturen Nieuwe Bewoners — Automatisch | LokaalKabaal",
    description: "LokaalKabaal verstuurt automatisch gepersonaliseerde flyers naar nieuwe huiseigenaren op basis van Kadaster-data. Wees er eerder dan de concurrent.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Flyers Versturen Nieuwe Bewoners — Automatisch | LokaalKabaal",
    description: "LokaalKabaal verstuurt automatisch gepersonaliseerde flyers naar nieuwe huiseigenaren op basis van Kadaster-data.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

const schemaOrg = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LokaalKabaal",
    url: siteUrl,
    description: "SaaS-platform dat automatisch gepersonaliseerde direct mail flyers verstuurt naar nieuwe huiseigenaren op basis van Kadaster-data.",
    sameAs: ["https://www.linkedin.com/company/lokaalkabaal"],
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LokaalKabaal",
    url: siteUrl,
    description: "SaaS-platform dat automatisch gepersonaliseerde direct mail flyers verstuurt naar nieuwe huiseigenaren op basis van Kadaster-data. Volledig geautomatiseerd: Kadaster-trigger, druk, bezorging — binnen 2 werkdagen bij de nieuwe bewoner op de mat.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", priceCurrency: "EUR", price: "49.00" },
    featureList: [
      "Automatische Kadaster-koppeling",
      "Gepersonaliseerde flyerdruk",
      "Bezorging binnen 2 werkdagen",
      "Postcode-targeting",
      "Realtime dashboard",
      "Geen contracten, per maand opzegbaar",
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
