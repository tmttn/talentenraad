import {AdminErrorPage} from '@components/error-pages';

/**
 * Admin 404 Not Found Page (Root Level)
 *
 * Shown when an admin route outside the protected area doesn't exist.
 * This catches 404s for routes like /admin/invalid that are not within
 * the (protected) route group.
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
