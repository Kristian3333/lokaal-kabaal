import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Flyers Versturen Nieuwe Bewoners - Automatisch',
  description: 'LokaalKabaal bezorgt tussen de 28e en 30e van elke maand gepersonaliseerde flyers bij alle nieuwe huiseigenaren in jouw postcodes. Wees er eerder dan de concurrent.',
  alternates: { canonical: 'https://lokaalkabaal.agency' },
  openGraph: {
    title: 'Flyers Versturen Nieuwe Bewoners - Automatisch | LokaalKabaal',
    description: 'Elke maand tussen de 28e en 30e automatisch flyers naar alle nieuwe huiseigenaren in jouw postcodes.',
    url: 'https://lokaalkabaal.agency',
  },
};

export default function HomePage(): React.JSX.Element {
  return <LandingPage />;
}
