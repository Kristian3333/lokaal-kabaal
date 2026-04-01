import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Neem contact op met LokaalKabaal. Vragen over flyers versturen naar nieuwe bewoners? Wij helpen je graag verder.',
  openGraph: {
    title: 'Contact | LokaalKabaal',
    description: 'Neem contact op met LokaalKabaal. Vragen over flyers versturen naar nieuwe bewoners? Wij helpen je graag verder.',
  },
};

/** Contact page -- server component shell that owns metadata. */
export default function ContactPage() {
  return <ContactClient />;
}
