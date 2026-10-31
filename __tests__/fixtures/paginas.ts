import type {Pagina} from '@lib/content';

const basis = {
  beschrijving: 'Fictieve beschrijving',
  concept: false,
  html: '<p>Fictieve body</p>',
};

export const cta = {
  titel: 'Fictieve oproep',
  tekst: 'Fictieve oproeptekst',
  knoppen: [
    {tekst: 'Eerste knop', link: '/eerste'},
    {tekst: 'Tweede knop', link: '/tweede'},
  ],
};

export const enkeleCta = {...cta, knoppen: [{tekst: 'Enige knop', link: '/enige'}]};

export const home: Pagina<'home'> = {
  ...basis,
  titel: 'Fictieve start',
  hero: {titel: 'Hero titel start', ondertitel: 'Hero ondertitel start'},
  cta,
  dashboardTitel: 'Dashboard titel',
  infokaart: {titel: 'Infokaart titel start'},
  faqTitel: 'Veelgestelde fictie',
  html: '<p>Infokaart body start</p>',
};

export const kalender: Pagina<'kalender'> = {
  ...basis,
  titel: 'Fictieve agenda',
  hero: {titel: 'Hero titel agenda', ondertitel: 'Hero ondertitel agenda'},
  cta: enkeleCta,
  lijst: {titel: 'Lijst titel', ondertitel: 'Lijst ondertitel'},
  archief: {titel: 'Archief titel', ondertitel: 'Archief ondertitel'},
};

export const nieuws: Pagina<'nieuws'> = {
  ...basis,
  titel: 'Fictief nieuws',
  hero: {titel: 'Hero titel nieuws', ondertitel: 'Hero ondertitel nieuws'},
  cta: enkeleCta,
};

export const contact: Pagina<'contact'> = {
  ...basis,
  titel: 'Fictief contact',
  hero: {titel: 'Hero titel contact', ondertitel: 'Hero ondertitel contact'},
  formulier: {titel: 'Formulier titel', tekst: 'Formulier tekst'},
  infokaart: {titel: 'Infokaart titel contact'},
  html: '<p>Infokaart body contact</p>',
};

export const overOns: Pagina<'over-ons'> = {
  ...basis,
  titel: 'Fictief over ons',
  hero: {titel: 'Hero titel over', ondertitel: 'Hero ondertitel over'},
  cta: enkeleCta,
  infokaart: {titel: 'Infokaart titel over'},
  bestuur: {titel: 'Bestuur titel', tekst: 'Bestuur tekst'},
  leden: {titel: 'Leden titel', tekst: 'Leden tekst'},
  html: '<p>Infokaart body over</p>',
};

export const sponsors: Pagina<'sponsors'> = {
  ...basis,
  titel: 'Fictieve sponsors',
  hero: {titel: 'Hero titel sponsors', ondertitel: 'Hero ondertitel sponsors'},
  cta: enkeleCta,
  sponsors: [
    {naam: 'Gouden Voorbeeld', niveau: 'goud', link: 'https://goud.test', logo: undefined},
    {naam: 'Partner Voorbeeld', niveau: 'partner', logo: {src: '/partner.png', width: 120, height: 60}},
  ],
  legeTekst: {
    goud: 'Geen goud',
    zilver: 'Geen zilver',
    brons: 'Geen brons',
    partner: 'Geen partners',
  },
};
