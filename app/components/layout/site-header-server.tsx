import {fetchOneEntry} from '@builder.io/sdk-react-nextjs';
import {SiteHeader} from './site-header';

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

type HeaderData = {
  logoUrl?: string;
  logoAlt?: string;
  navigationLinks?: Array<{text: string; url: string}>;
};

/**
 * Server-side Site Header Component
 *
 * Fetches header content from Builder.io and renders the SiteHeader component.
 * Falls back to default values if no content is found.
 */
export async function SiteHeaderServer() {
  let headerData: HeaderData = {};

  try {
    const content = await fetchOneEntry({
      model: 'site-header',
      apiKey: BUILDER_API_KEY,
    });

    if (content?.data) {
      headerData = content.data as HeaderData;
    }
  } catch (error) {
    console.error('Error fetching site header:', error);
  }

  return (
    <SiteHeader
      logoUrl={headerData.logoUrl}
      logoAlt={headerData.logoAlt}
      navigationLinks={headerData.navigationLinks}
    />
  );
}
