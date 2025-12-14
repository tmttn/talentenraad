import {fetchOneEntry} from '@builder.io/sdk-react-nextjs';
// eslint-disable-next-line import-x/extensions
import {SiteFooter} from './site-footer';

// eslint-disable-next-line n/prefer-global/process
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

type FooterData = {
	logoUrl?: string;
	tagline?: string;
	address?: {
		street?: string;
		city?: string;
	};
	email?: string;
	navigationGroups?: Array<{
		title: string;
		links: Array<{text: string; url: string}>;
	}>;
	socialLinks?: Array<{
		platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin';
		url: string;
	}>;
	copyrightText?: string;
};

/**
 * Server-side Site Footer Component
 *
 * Fetches footer content from Builder.io and renders the SiteFooter component.
 * Falls back to default values if no content is found.
 */
export async function SiteFooterServer() {
	let footerData: FooterData = {};

	try {
		const content = await fetchOneEntry({
			model: 'site-footer',
			apiKey: BUILDER_API_KEY,
		});

		if (content?.data) {
			footerData = content.data as FooterData;
		}
	} catch (error) {
		console.error('Error fetching site footer:', error);
	}

	return (
		<SiteFooter
			logoUrl={footerData.logoUrl}
			tagline={footerData.tagline}
			address={footerData.address}
			email={footerData.email}
			navigationGroups={footerData.navigationGroups}
			socialLinks={footerData.socialLinks}
			copyrightText={footerData.copyrightText}
		/>
	);
}
