import {AdminErrorPage} from '@components/error-pages';

/**
 * Admin 404 Not Found Page
 *
 * Shown when an admin route doesn't exist or notFound() is called
 * from an admin server component.
 */
export default function AdminNotFound() {
  return (
    <AdminErrorPage
      code='404'
      title='Pagina niet gevonden'
      description='De pagina die je zoekt bestaat niet of is verplaatst.'
    />
  );
}
