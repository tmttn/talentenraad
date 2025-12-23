import type {Metadata} from 'next';
import {AdminErrorPage} from '@components/error-pages';

export const metadata: Metadata = {
  title: 'Pagina niet gevonden',
};

/**
 * Admin 404 Page (Proxy Target)
 *
 * This page is the target for proxy rewrites when an invalid admin path
 * is accessed. The proxy detects non-existent admin routes and rewrites
 * to this page with a 404 status code.
 *
 * This solves the issue where Next.js App Router returns 500 instead of
 * 404 for non-existent routes on Vercel.
 */
export default function AdminNotFoundPage() {
  return (
    <AdminErrorPage
      code='404'
      title='Pagina niet gevonden'
      description='De pagina die je zoekt bestaat niet of is verplaatst.'
    />
  );
}
