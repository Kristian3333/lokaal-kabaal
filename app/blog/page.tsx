import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips en inzichten over direct mail, lokale marketing en het bereiken van nieuwe bewoners in jouw postcodegebied.',
  openGraph: {
    title: 'Blog | LokaalKabaal',
    description: 'Tips en inzichten over direct mail, lokale marketing en het bereiken van nieuwe bewoners in jouw postcodegebied.',
  },
};

/** Blog overview page -- server component shell that owns metadata. */
export default function BlogPage() {
  return <BlogClient />;
}
