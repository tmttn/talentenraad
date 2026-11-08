import {z} from 'zod';
import {formatIban, isGeldigeIban} from './iban';

const afbeeldingPad = (name: string) => z.literal(`./${name}`, {error: `Gebruik ./${name}.`});

const concept = z.boolean().default(false);
const aliassen = z.array(z.string()).default([]);
const verplicht = (message: string) => z.string({error: message}).trim().min(1, message);
const volgorde = z.number({error: 'Vul een getal in.'}).default(99);

export const linkMelding = 'Gebruik een link die begint met /, https:// of mailto:.';
export const linkWaarde = z.string().trim().refine(
  value => /^(?:\/(?![/\\])|https:\/\/(?=[^/\s])|mailto:(?=\S))[^\s\\\u0000-\u001F]*$/.test(value),
  linkMelding,
);

export const datumSchema = z.string({error: 'Kies een geldige datum.'})
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Kies een geldige datum.')
  .refine(value => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }, 'Kies een geldige datum.');

const linkSchema = z.object({tekst: z.string(), link: linkWaarde});

export const programmaPuntSchema = z.strictObject({
  uur: verplicht('Vul bij elk programmapunt een uur in.'),
  titel: verplicht('Vul bij elk programmapunt een titel in.'),
  info: z.string().trim().optional(),
});

export const activiteitSchema = z.strictObject({
  titel: verplicht('Vul een titel in.'),
  datum: datumSchema,
  tijd: z.string().optional(),
  locatie: z.string().optional(),
  categorie: z.enum(['feest', 'kalender', 'activiteit'], {error: 'Kies een geldige categorie.'}),
  samenvatting: verplicht('Vul een samenvatting in.'),
  /** Optional time table on the activity page: one row per moment. */
  programma: z.array(programmaPuntSchema).default([]),
  afbeelding: afbeeldingPad('afbeelding.jpg').optional(),
  aliassen,
  concept,
});

export const nieuwsSchema = z.strictObject({
  titel: verplicht('Vul een titel in.'),
  datum: datumSchema,
  samenvatting: verplicht('Vul een samenvatting in.'),
  afbeelding: afbeeldingPad('afbeelding.jpg').optional(),
  aliassen,
  concept,
});

export const teamlidSchema = z.strictObject({
  naam: verplicht('Vul een naam in.'),
  rol: verplicht('Vul een rol in.'),
  categorie: z.enum(['bestuur', 'lid'], {error: 'Kies een geldige categorie.'}),
  volgorde,
  foto: afbeeldingPad('foto.jpg').optional(),
  concept,
});

export const faqSchema = z.strictObject({
  vraag: verplicht('Vul een vraag in.'),
  volgorde,
  concept,
});

const codeSchema = (message: string) => z.string({error: message}).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, message);
const centSchema = (message: string) => z.number({error: message}).int(message).min(0, message);

/** No product may offer more combinations than this, so the order form stays usable. */
export const maxVarianten = 12;

const keuzeSchema = z.strictObject({
  naam: verplicht('Vul bij elke keuze een naam in.'),
  meerprijs: centSchema('Vul een geldige meerprijs in, bv. 2,00.').default(0),
});

const optieSchema = z.strictObject({
  id: codeSchema('Elke optie heeft een geldige code nodig.'),
  naam: verplicht('Geef elke optie een naam, bv. Brood.'),
  keuzes: z.array(keuzeSchema).min(1, 'Voeg bij elke optie minstens één keuze toe.'),
});

const productSchema = z.strictObject({
  id: codeSchema('Elk product heeft een geldige code nodig.'),
  naam: verplicht('Vul bij elk product een naam in.'),
  info: z.string().trim().optional(),
  /** Price in cents. */
  prijs: centSchema('Vul bij elk product een geldige prijs in, bv. 12,50.'),
  /** Optional stock, counted over all orders that are not cancelled. */
  voorraad: z.number({error: 'Vul een geldige voorraad in, of laat het leeg.'}).int('Vul een geldige voorraad in, of laat het leeg.').min(0, 'Vul een geldige voorraad in, of laat het leeg.').optional(),
  maxPerBestelling: z.number({error: 'Vul een maximum per bestelling in tussen 1 en 100.'}).int('Vul een maximum per bestelling in tussen 1 en 100.').min(1, 'Vul een maximum per bestelling in tussen 1 en 100.').max(100, 'Vul een maximum per bestelling in tussen 1 en 100.').default(10),
  opties: z.array(optieSchema).default([]),
}).superRefine((product, context) => {
  const optieIds = new Set<string>();
  for (const [index, optie] of product.opties.entries()) {
    if (optieIds.has(optie.id)) {
      context.addIssue({code: 'custom', message: 'Twee opties hebben dezelfde naam.', path: ['opties', index]});
    }

    optieIds.add(optie.id);
    const namen = optie.keuzes.map(keuze => keuze.naam.toLowerCase());
    if (new Set(namen).size !== namen.length) {
      context.addIssue({code: 'custom', message: `Twee keuzes bij ${optie.naam} hebben dezelfde naam.`, path: ['opties', index]});
    }
  }

  const varianten = product.opties.reduce((total, optie) => total * optie.keuzes.length, 1);
  if (varianten > maxVarianten) {
    context.addIssue({code: 'custom', message: `Te veel combinaties van keuzes (${varianten}, hoogstens ${maxVarianten}).`, path: ['opties']});
  }
});

const afhaalmomentSchema = z.strictObject({
  id: codeSchema('Elk afhaalmoment heeft een geldige code nodig.'),
  datum: datumSchema,
  uur: verplicht('Vul bij elk afhaalmoment een uur in, bv. 17:00 - 19:00.'),
  plaats: verplicht('Vul bij elk afhaalmoment een plaats in.'),
});

const uniekeIds = (items: Array<{id: string}>, message: string, context: z.RefinementCtx, path: string) => {
  const seen = new Set<string>();
  for (const [index, item] of items.entries()) {
    if (seen.has(item.id)) {
      context.addIssue({code: 'custom', message, path: [path, index, 'id']});
    }

    seen.add(item.id);
  }
};

export const betaalwijzen = ['overschrijving', 'cash'] as const;

/** A sale (pizzas, breakfast baskets, party tickets): products, ordering period and pickup moments. */
export const actieSchema = z.strictObject({
  titel: verplicht('Vul een titel in.'),
  samenvatting: verplicht('Vul een samenvatting in.'),
  afbeelding: afbeeldingPad('afbeelding.jpg').optional(),
  /** Ordering is open from `van` up to and including `tot`. */
  bestellen: z.strictObject({van: datumSchema, tot: datumSchema})
    .refine(periode => periode.tot >= periode.van, {message: 'De laatste besteldag ligt vóór de eerste.', path: ['tot']}),
  betalen: z.strictObject({
    wijzen: z.array(z.enum(betaalwijzen, {error: 'Kies een geldige manier om te betalen.'}))
      .min(1, 'Kies minstens één manier om te betalen.')
      .refine(wijzen => new Set(wijzen).size === wijzen.length, 'Kies elke manier om te betalen maar één keer.'),
    /** Payment deadline: this many days after ordering. */
    binnenDagen: z.number({error: 'Vul een aantal dagen in tussen 0 en 60.'}).int('Vul een aantal dagen in tussen 0 en 60.').min(0, 'Vul een aantal dagen in tussen 0 en 60.').max(60, 'Vul een aantal dagen in tussen 0 en 60.').default(5),
    /** The account parents of this sale pay into. With the example number the sale never opens in production. */
    rekening: z.strictObject({
      iban: verplicht('Vul het rekeningnummer in.').refine(isGeldigeIban, 'Vul een geldig rekeningnummer (IBAN) in.').transform(formatIban),
      begunstigde: verplicht('Vul in op wiens naam de rekening staat.'),
    }, {error: 'Vul het rekeningnummer in.'}),
  }),
  /** Ask the name and class of a child (for delivery in class, later). */
  vraag: z.strictObject({kind: z.boolean().default(false)}).default({kind: false}),
  afhalen: z.array(afhaalmomentSchema).min(1, 'Voeg minstens één afhaalmoment toe.'),
  producten: z.array(productSchema).min(1, 'Voeg minstens één product toe.'),
  aliassen,
  concept,
}).superRefine((actie, context) => {
  uniekeIds(actie.producten, 'Twee producten hebben dezelfde code.', context, 'producten');
  uniekeIds(actie.afhalen, 'Twee afhaalmomenten hebben dezelfde code.', context, 'afhalen');
});

export const tekstSchema = z.object({
  titel: z.string(),
  beschrijving: z.string(),
  concept,
});

export const aankondigingSchema = z.strictObject({
  actief: z.boolean(),
  tekst: z.string().trim(),
  type: z.enum(['info', 'waarschuwing', 'belangrijk'], {error: 'Kies een geldig type.'}),
  link: linkWaarde.optional(),
  linkTekst: z.string().optional(),
}).refine(value => !value.actief || value.tekst !== '', {message: 'Vul een tekst in.', path: ['tekst']});

export const siteSchema = z.object({
  navigatie: z.array(linkSchema),
  footer: z.object({
    tagline: z.string(),
    adres: z.object({straat: z.string(), gemeente: z.string()}),
    email: z.string(),
    groepen: z.array(z.object({titel: z.string(), links: z.array(linkSchema)})),
    sociaal: z.array(z.object({platform: z.string(), link: linkWaarde})),
    copyright: z.string(),
  }),
  cta: z.object({titel: z.string(), tekst: z.string(), knop: linkSchema}),
  decoraties: z.object({
    enabled: z.boolean(),
    season: z.enum(['christmas', 'easter', 'halloween', 'none']),
    decorations: z.object({
      christmasLights: z.boolean(),
      snowfall: z.boolean(),
      icicles: z.boolean(),
      gingerbreadMan: z.boolean(),
      christmasBalls: z.boolean(),
    }),
  }),
  aankondiging: aankondigingSchema,
});

const basisPagina = {
  titel: z.string(),
  beschrijving: z.string(),
  hero: z.object({titel: z.string(), ondertitel: z.string()}),
  cta: z.object({
    titel: z.string(),
    tekst: z.string(),
    knoppen: z.array(linkSchema).min(1).max(2),
  }).optional(),
  concept,
};

const titelTekst = z.object({titel: z.string(), tekst: z.string()});
const titelOndertitel = z.object({titel: z.string(), ondertitel: z.string()});

export const sponsorNiveaus = ['goud', 'zilver', 'brons', 'partner'] as const;

export const paginaSchemas = {
  home: z.object({
    ...basisPagina,
    hero: z.object({
      titel: z.string(),
      ondertitel: z.string(),
      knoppen: z.array(linkSchema).max(2).default([]),
    }),
    citaat: z.string(),
  }),
  kalender: z.object({
    ...basisPagina,
    archief: titelOndertitel,
  }),
  nieuws: z.object(basisPagina),
  contact: z.object({
    ...basisPagina,
    formulier: z.object({titel: z.string()}),
  }),
  'over-ons': z.object({
    ...basisPagina,
    faqTitel: z.string().default('Veelgestelde vragen'),
    bestuur: titelTekst,
    leden: titelTekst,
  }),
  sponsors: z.object({
    ...basisPagina,
    sponsors: z.array(z.object({
      naam: z.string(),
      niveau: z.enum(sponsorNiveaus),
      link: linkWaarde.optional(),
      logo: z.string().optional(),
    })).default([]),
    legeTekst: z.object({
      goud: z.string(),
      zilver: z.string(),
      brons: z.string(),
      partner: z.string(),
    }),
  }),
};

export type PaginaNaam = keyof typeof paginaSchemas;
export type PaginaFrontmatter<K extends PaginaNaam> = z.infer<(typeof paginaSchemas)[K]>;
export type ActiviteitFrontmatter = z.infer<typeof activiteitSchema>;
export type ProgrammaPunt = z.infer<typeof programmaPuntSchema>;
export type ActieFrontmatter = z.infer<typeof actieSchema>;
export type Product = ActieFrontmatter['producten'][number];
export type Afhaalmoment = ActieFrontmatter['afhalen'][number];
export type Betaalwijze = (typeof betaalwijzen)[number];
export type NieuwsFrontmatter = z.infer<typeof nieuwsSchema>;
export type TeamlidFrontmatter = z.infer<typeof teamlidSchema>;
export type FaqFrontmatter = z.infer<typeof faqSchema>;
export type TekstFrontmatter = z.infer<typeof tekstSchema>;
export type Site = z.infer<typeof siteSchema>;
