import {content} from '@lib/content';
import {SiteFooter} from './site-footer';

/**
 * Server-side Site Footer Component
 *
 * Reads the footer from content/site.yaml and renders the SiteFooter component.
 */
export async function SiteFooterServer() {
  const {footer} = await content.getSite();

  return (
    <SiteFooter
      tagline={footer.tagline}
      address={{street: footer.adres.straat, city: footer.adres.gemeente}}
      email={footer.email}
      navigationGroups={footer.groepen.map(group => ({
        title: group.titel,
        links: group.links.map(item => ({text: item.tekst, url: item.link})),
      }))}
      socialLinks={footer.sociaal.map(item => ({platform: item.platform, url: item.link}))}
      copyrightText={footer.copyright}
    />
  );
}
