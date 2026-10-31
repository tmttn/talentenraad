import {content} from '@lib/content';
import {SiteHeader} from './site-header';

/**
 * Server-side Site Header Component
 *
 * Reads the main navigation from content/site.yaml and renders the SiteHeader component.
 */
export async function SiteHeaderServer() {
  const site = await content.getSite();

  return (
    <SiteHeader
      navigationLinks={site.navigatie.map(item => ({text: item.tekst, url: item.link}))}
    />
  );
}
