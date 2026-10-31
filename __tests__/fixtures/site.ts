import type {Site} from '@lib/content';

export const fixtureSite: Site = {
  navigatie: [
    {tekst: 'Start', link: '/'},
    {tekst: 'Agenda', link: '/agenda'},
  ],
  footer: {
    tagline: 'Een fictieve ouderraad\nMet een fictieve slogan',
    adres: {straat: 'Voorbeeldstraat 1', gemeente: '1000 Voorbeeldstad'},
    email: 'info@voorbeeld.test',
    groepen: [
      {titel: 'Eerste groep', links: [{tekst: 'Binnenlands', link: '/binnen'}]},
      {titel: 'Tweede groep', links: [{tekst: 'Buitenlands', link: 'https://voorbeeld.test/buiten'}]},
    ],
    sociaal: [
      {platform: 'facebook', link: 'https://facebook.test/raad'},
      {platform: 'instagram', link: 'https://instagram.test/raad'},
    ],
    copyright: 'Voorbeeldraad. Alle rechten voorbehouden.',
  },
  cta: {
    titel: 'Een vraag?',
    tekst: 'Stuur ons gerust een bericht.',
    knop: {tekst: 'Schrijf ons', link: '/schrijf'},
  },
  decoraties: {
    enabled: true,
    season: 'christmas',
    decorations: {
      christmasLights: true,
      snowfall: true,
      icicles: false,
      gingerbreadMan: false,
      christmasBalls: true,
    },
  },
  aankondiging: {
    actief: true,
    tekst: 'Fictieve aankondiging',
    type: 'waarschuwing',
    link: '/meer',
  },
};
