import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inloggen',
  description: 'Log in op je LokaalKabaal dashboard om campagnes te beheren, flyers te ontwerpen en conversies te zien.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://lokaalkabaal.agency/login' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
