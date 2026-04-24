import type { Metadata } from "next";
import { Manrope, DM_Mono, Instrument_Serif } from 'next/font/google';
import "./globals.css";
import ToastContainer from "@/components/Toast";

const siteUrl = 'https://lokaalkabaal.agency';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Flyers Versturen Nieuwe Bewoners - Automatisch | LokaalKabaal",
    template: "%s | LokaalKabaal",
  },
  description: "LokaalKabaal verstuurt automatisch gepersonaliseerde flyers naar nieuwe huiseigenaren. Elke maand tussen de 28e en 30e bij alle nieuwe bewoners in uw postcodes op de mat. Wees er eerder dan de concurrent.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "LokaalKabaal",
    title: "Flyers Versturen Nieuwe Bewoners - Automatisch | LokaalKabaal",
    description: "LokaalKabaal verstuurt automatisch gepersonaliseerde flyers naar nieuwe huiseigenaren. Bezorgd tussen de 28e en 30e van elke maand. Wees er eerder dan de concurrent.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent('Van nieuwe bewoner naar vaste klant')}&subtitle=${encodeURIComponent('Elke maand automatisch op de mat bij alle nieuwe huiseigenaren in jouw postcodes')}`,
        width: 1200,
        height: 630,
        alt: 'LokaalKabaal -- flyers naar nieuwe bewoners',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flyers Versturen Nieuwe Bewoners - Automatisch | LokaalKabaal",
    description: "LokaalKabaal verstuurt automatisch gepersonaliseerde flyers naar nieuwe huiseigenaren. Bezorgd tussen de 28e en 30e van elke maand.",
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('Van nieuwe bewoner naar vaste klant')}&subtitle=${encodeURIComponent('Elke maand automatisch op de mat')}`],
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
    description: "SaaS-platform dat automatisch gepersonaliseerde direct mail flyers verstuurt naar nieuwe huiseigenaren. Bezorgd tussen de 28e en 30e van elke maand.",
    sameAs: ["https://www.linkedin.com/company/lokaalkabaal"],
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LokaalKabaal",
    url: siteUrl,
    description: "SaaS-platform dat automatisch gepersonaliseerde direct mail flyers verstuurt naar nieuwe huiseigenaren. Bezorgd tussen de 28e en 30e van elke maand -- druk en bezorging geregeld.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "349.00",
      highPrice: "649.00",
      offerCount: 3,
    },
    featureList: [
      "Automatische verwerking eigendomsoverdrachten",
      "Gepersonaliseerde flyerdruk",
      "Bezorging via PostNL",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        {/* Cookie-less analytics via Plausible. Opt-in via env var; when
            NEXT_PUBLIC_PLAUSIBLE_DOMAIN is unset we don't inject the script
            at all, which keeps preview deployments + local dev tracker-free. */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className={`${manrope.variable} ${dmMono.variable} ${instrumentSerif.variable}`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:shadow-lg"
        >
          Ga naar inhoud
        </a>
        <main id="main-content">
          {children}
        </main>
        <ToastContainer />
      </body>
    </html>
  );
}
