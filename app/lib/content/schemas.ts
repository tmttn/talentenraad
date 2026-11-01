import {z} from 'zod';

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

export const activiteitSchema = z.strictObject({
  titel: verplicht('Vul een titel in.'),
  datum: datumSchema,
  tijd: z.string().optional(),
  locatie: z.string().optional(),
  categorie: z.enum(['feest', 'kalender', 'activiteit'], {error: 'Kies een geldige categorie.'}),
  samenvatting: verplicht('Vul een samenvatting in.'),
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
const infokaart = z.object({titel: z.string()});

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
    lijst: titelOndertitel,
    archief: titelOndertitel,
  }),
  nieuws: z.object(basisPagina),
  contact: z.object({
    ...basisPagina,
    formulier: titelTekst,
    infokaart,
  }),
  'over-ons': z.object({
    ...basisPagina,
    infokaart,
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
export type NieuwsFrontmatter = z.infer<typeof nieuwsSchema>;
export type TeamlidFrontmatter = z.infer<typeof teamlidSchema>;
export type FaqFrontmatter = z.infer<typeof faqSchema>;
export type TekstFrontmatter = z.infer<typeof tekstSchema>;
export type Site = z.infer<typeof siteSchema>;
