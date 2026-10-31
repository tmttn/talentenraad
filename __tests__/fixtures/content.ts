import type {Activiteit, FaqItem, NieuwsItem, Teamlid} from '@lib/content';

export const makeActiviteit = (overrides: Partial<Activiteit> = {}): Activiteit => ({
  titel: 'Voorbeeldfeest',
  datum: '2025-06-15',
  tijd: '14:00',
  locatie: 'Voorbeeldzaal',
  categorie: 'feest',
  samenvatting: 'Een fictieve samenvatting van het feest.',
  afbeelding: undefined,
  aliassen: [],
  concept: false,
  slug: 'voorbeeldfeest',
  html: '<p>Fictieve inhoud van het feest</p>',
  ...overrides,
});

export const makeNieuws = (overrides: Partial<NieuwsItem> = {}): NieuwsItem => ({
  titel: 'Voorbeeldbericht',
  datum: '2025-05-10',
  samenvatting: 'Een fictieve samenvatting van het bericht.',
  afbeelding: undefined,
  aliassen: [],
  concept: false,
  slug: 'voorbeeldbericht',
  html: '<p>Fictieve inhoud van het bericht</p>',
  ...overrides,
});

export const makeTeamlid = (overrides: Partial<Teamlid> = {}): Teamlid => ({
  naam: 'Jan Voorbeeld',
  rol: 'Voorzitter',
  categorie: 'bestuur',
  volgorde: 1,
  foto: undefined,
  concept: false,
  slug: 'jan-voorbeeld',
  html: '',
  ...overrides,
});

export const makeFaq = (overrides: Partial<FaqItem> = {}): FaqItem => ({
  vraag: 'Een fictieve vraag?',
  volgorde: 1,
  concept: false,
  slug: 'een-fictieve-vraag',
  html: '<p>Een fictief antwoord.</p>',
  ...overrides,
});
