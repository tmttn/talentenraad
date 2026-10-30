// @vitest-environment node
import {paginaSchemas, tekstSchema} from '../../../app/lib/content/schemas';
import {mapPagina, type BuilderPage} from '../../../scripts/migrate-content/pages';

function typo(text: string) {
  return {component: {name: 'Typography', options: {text}}};
}

function text(html: string) {
  return {component: {name: 'Text', options: {text: html}}};
}

const overOns: BuilderPage = {
  name: 'Over Ons',
  data: {
    url: '/over-ons',
    blocks: [
      {component: {name: 'Hero', options: {}}, children: [typo('De Talentenraad'), typo('Samen op weg')]},
      {component: {name: 'InfoCard', options: {title: 'Onze Missie', description: '<p>Wij <strong>helpen</strong>.</p>'}}},
      {children: [
        typo('Het Bestuur'),
        typo('Dagelijks bestuur'),
        {component: {name: 'TeamGrid', options: {category: 'bestuur'}}},
      ]},
      {children: [
        typo('Onze Leden'),
        typo('Alle leden'),
        {component: {name: 'TeamGrid', options: {category: 'lid'}}},
      ]},
      {component: {name: 'CTABanner', options: {}}, children: [
        typo('Wil je meehelpen?'),
        typo('Nieuwe ouders welkom'),
        {children: [{component: {name: 'CTAButton', options: {text: 'Neem contact op', href: '/contact'}}}]},
      ]},
    ],
  },
};

describe('mapPagina', () => {
  it('maps over-ons to frontmatter and body', () => {
    const result = mapPagina('/over-ons', overOns);
    expect(result).toEqual({
      naam: 'over-ons',
      frontmatter: {
        titel: 'Over Ons - Talentenraad',
        beschrijving: 'Samen op weg',
        hero: {titel: 'De Talentenraad', ondertitel: 'Samen op weg'},
        infokaart: {titel: 'Onze Missie'},
        bestuur: {titel: 'Het Bestuur', tekst: 'Dagelijks bestuur'},
        leden: {titel: 'Onze Leden', tekst: 'Alle leden'},
        cta: {
          titel: 'Wil je meehelpen?',
          tekst: 'Nieuwe ouders welkom',
          knoppen: [{tekst: 'Neem contact op', link: '/contact'}],
        },
      },
      body: 'Wij **helpen**.',
    });
    expect(paginaSchemas['over-ons'].safeParse(result && 'frontmatter' in result ? result.frontmatter : undefined).success).toBe(true);
  });

  it('uses Builder title and description when present', () => {
    const entry: BuilderPage = {...overOns, data: {...overOns.data, title: 'Eigen titel', description: 'Eigen omschrijving'}};
    const result = mapPagina('/over-ons', entry);
    expect(result).toMatchObject({frontmatter: {titel: 'Eigen titel', beschrijving: 'Eigen omschrijving'}});
  });

  it('maps a text page from Box and Text blocks', () => {
    const entry: BuilderPage = {
      name: 'Privacybeleid',
      data: {
        url: '/privacybeleid',
        title: 'Privacybeleid - Talentenraad',
        blocks: [{component: {name: 'Box', options: {}}, children: [
          text('<h1 style="a">Privacybeleid</h1>'),
          text('<p>Laatst bijgewerkt: 1 januari 2025</p>'),
          text('\n\t<p>Intro <em>tekst</em></p>\n'),
          text('<h2>1. Kop</h2><p>Inhoud</p>'),
        ]}],
      },
    };
    const result = mapPagina('/privacybeleid', entry);
    expect(result).toEqual({
      tekst: 'privacybeleid',
      frontmatter: {titel: 'Privacybeleid - Talentenraad', beschrijving: 'Intro tekst'},
      body: 'Laatst bijgewerkt: 1 januari 2025\n\nIntro _tekst_\n\n## 1. Kop\n\nInhoud',
    });
    expect(tekstSchema.safeParse((result as {frontmatter: unknown}).frontmatter).success).toBe(true);
  });

  it('keeps paragraph breaks of plain-text InfoCard descriptions', () => {
    const entry: BuilderPage = {
      name: 'Contact',
      data: {url: '/contact', blocks: [
        {component: {name: 'Hero', options: {}}, children: [text('<h1>Contact</h1>'), text('<p>Vraag?</p>')]},
        {children: [text('<h2>Bericht</h2>'), text('<p>Vul in</p>'), {component: {name: 'ContactForm', options: {}}}]},
        {component: {name: 'InfoCard', options: {title: 'Gegevens', description: 'Eerste alinea.\n\nTweede alinea\nmet regel.'}}},
      ]},
    };
    expect(mapPagina('/contact', entry)).toMatchObject({body: 'Eerste alinea.\n\nTweede alinea  \nmet regel.'});
  });

  it('cuts the fallback description of a text page at a sentence boundary', () => {
    const lang = `${'woord '.repeat(10).trim()}. Tweede zin ${'woord '.repeat(40)}einde.`;
    const entry: BuilderPage = {
      name: 'Cookiebeleid',
      data: {url: '/cookiebeleid', blocks: [{component: {name: 'Box', options: {}}, children: [
        text('<h1>Cookiebeleid</h1>'),
        text(`<p>${lang}</p>`),
      ]}]},
    };
    const result = mapPagina('/cookiebeleid', entry) as {frontmatter: {beschrijving: string}};
    expect(result.frontmatter.beschrijving).toBe(`${'woord '.repeat(10).trim()}.`);
  });

  it('maps the sponsors page with empty-state texts and an options-based CTA', () => {
    const section = (kop: string, leeg: string) => ({component: {name: 'Section', options: {}}, children: [text(`<h2>${kop}</h2>`), text(`<p>${leeg}</p>`)]});
    const entry: BuilderPage = {
      name: 'Sponsors',
      data: {
        url: '/sponsors',
        blocks: [
          {component: {name: 'Hero', options: {}}, children: [text('<h1>Onze Sponsors</h1>'), text('<p>Dank!</p>')]},
          section('Goud', 'Geen goud'),
          section('Zilver', 'Geen zilver'),
          section('Brons', 'Geen brons'),
          section('Partners', 'Geen partners'),
          {component: {name: 'UnifiedCta', options: {title: 'Word sponsor!', description: 'Neem contact op', buttonText: 'Contact', buttonLink: '/contact'}}},
        ],
      },
    };
    const result = mapPagina('/sponsors', entry) as {frontmatter: unknown};
    expect(result).toMatchObject({naam: 'sponsors', frontmatter: {
      sponsors: [],
      legeTekst: {goud: 'Geen goud', zilver: 'Geen zilver', brons: 'Geen brons', partner: 'Geen partners'},
      cta: {titel: 'Word sponsor!', tekst: 'Neem contact op', knoppen: [{tekst: 'Contact', link: '/contact'}]},
    }});
    expect(paginaSchemas.sponsors.safeParse(result.frontmatter).success).toBe(true);
  });

  it('maps kalender with list and archive texts', () => {
    const entry: BuilderPage = {
      name: 'Kalender',
      data: {url: '/kalender', blocks: [
        {component: {name: 'Hero', options: {}}, children: [typo('Kalender'), typo('Alles')]},
        {children: [typo('Komende'), typo('Ontdek'), {component: {name: 'ActivitiesList', options: {}}}]},
        {component: {name: 'ActivitiesArchive', options: {title: 'Archief', subtitle: 'Voorbij'}}},
      ]},
    };
    const result = mapPagina('/kalender', entry) as {frontmatter: unknown};
    expect(result.frontmatter).toMatchObject({lijst: {titel: 'Komende', ondertitel: 'Ontdek'}, archief: {titel: 'Archief', ondertitel: 'Voorbij'}});
    expect(paginaSchemas.kalender.safeParse(result.frontmatter).success).toBe(true);
  });

  it('maps home with two cta buttons, dashboard and faq titles', () => {
    const entry: BuilderPage = {
      name: 'Home',
      data: {url: '/', blocks: [
        {component: {name: 'Hero', options: {}}, children: [typo('Welkom'), typo('Ouderraad')]},
        {children: [typo('In een oogopslag'), {component: {name: 'HomepageDashboard', options: {}}}]},
        {component: {name: 'InfoCard', options: {title: 'Samen', description: '<p>Tekst</p>'}}},
        {children: [typo('Vragen'), {component: {name: 'FAQ', options: {}}}]},
        {component: {name: 'UnifiedCTA', options: {}}, children: [
          typo('Doe mee'), typo('Vragen?'),
          {children: [
            {component: {name: 'CTAButton', options: {text: 'Contact', href: '/contact'}}},
            {component: {name: 'CTAButton', options: {text: 'Team', href: '/over-ons'}}},
          ]},
        ]},
      ]},
    };
    const result = mapPagina('/', entry) as {naam: string; frontmatter: {cta: {knoppen: unknown[]}}; body: string};
    expect(result.naam).toBe('home');
    expect(result.body).toBe('Tekst');
    expect(result.frontmatter.cta.knoppen).toHaveLength(2);
    expect(paginaSchemas.home.safeParse(result.frontmatter).success).toBe(true);
  });

  it('maps contact and nieuws', () => {
    const contact: BuilderPage = {
      name: 'Contact',
      data: {url: '/contact', blocks: [
        {component: {name: 'Hero', options: {}}, children: [typo('Contact'), typo('Vraag?')]},
        {children: [typo('Bericht'), typo('Vul in'), {component: {name: 'ContactForm', options: {}}}]},
        {component: {name: 'InfoCard', options: {title: 'Gegevens', description: '<p>Mail ons</p>'}}},
      ]},
    };
    const nieuws: BuilderPage = {
      name: 'Nieuws',
      data: {url: '/nieuws', blocks: [
        {component: {name: 'Hero', options: {}}, children: [typo('Nieuws'), typo('Blijf op de hoogte')]},
        {component: {name: 'NewsList', options: {}}},
      ]},
    };
    const c = mapPagina('/contact', contact) as {frontmatter: unknown; body: string};
    expect(paginaSchemas.contact.safeParse(c.frontmatter).success).toBe(true);
    expect(c.body).toBe('Mail ons');
    const n = mapPagina('/nieuws', nieuws) as {frontmatter: unknown; body: string};
    expect(paginaSchemas.nieuws.safeParse(n.frontmatter).success).toBe(true);
    expect(n.body).toBe('');
  });

  it('throws for an unknown url', () => {
    expect(() => mapPagina('/onbekend', overOns)).toThrow('/onbekend');
  });
});
