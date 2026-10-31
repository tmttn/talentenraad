import {z} from 'zod';

const concept = z.boolean().default(false);
const aliassen = z.array(z.string()).default([]);

export const datumSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Verwacht formaat JJJJ-MM-DD')
  .refine(value => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }, 'Ongeldige datum');

const linkSchema = z.object({tekst: z.string(), link: z.string()});

export const activiteitSchema = z.object({
  titel: z.string(),
  datum: datumSchema,
  tijd: z.string().optional(),
  locatie: z.string().optional(),
  categorie: z.enum(['feest', 'kalender', 'activiteit']),
  samenvatting: z.string(),
  afbeelding: z.string().optional(),
  aliassen,
  concept,
});

export const nieuwsSchema = z.object({
  titel: z.string(),
  datum: datumSchema,
  samenvatting: z.string(),
  afbeelding: z.string().optional(),
  aliassen,
  concept,
});

export const teamlidSchema = z.object({
  naam: z.string(),
  rol: z.string(),
  categorie: z.enum(['bestuur', 'lid']),
  volgorde: z.number().default(99),
  foto: z.string().optional(),
  concept,
});

export const faqSchema = z.object({
  vraag: z.string(),
  volgorde: z.number().default(99),
  concept,
});

export const tekstSchema = z.object({
  titel: z.string(),
  beschrijving: z.string(),
  concept,
});

export const siteSchema = z.object({
  navigatie: z.array(linkSchema),
  footer: z.object({
    tagline: z.string(),
    adres: z.object({straat: z.string(), gemeente: z.string()}),
    email: z.string(),
    groepen: z.array(z.object({titel: z.string(), links: z.array(linkSchema)})),
    sociaal: z.array(z.object({platform: z.string(), link: z.string()})),
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
  aankondiging: z.object({
    actief: z.boolean(),
    tekst: z.string(),
    type: z.enum(['info', 'waarschuwing', 'belangrijk']),
    link: z.string().optional(),
    linkTekst: z.string().optional(),
  }),
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
    dashboardTitel: z.string(),
    infokaart,
    faqTitel: z.string(),
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
    bestuur: titelTekst,
    leden: titelTekst,
  }),
  sponsors: z.object({
    ...basisPagina,
    sponsors: z.array(z.object({
      naam: z.string(),
      niveau: z.enum(sponsorNiveaus),
      link: z.string().optional(),
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
