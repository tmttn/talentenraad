import matter from 'gray-matter';
import {CORE_SCHEMA, dump, load} from 'js-yaml';
import type {z} from 'zod';
import {
  aankondigingSchema,
  activiteitSchema,
  faqSchema,
  nieuwsSchema,
  siteSchema,
  teamlidSchema,
} from '../content/schemas';

export type EntryType = 'activiteiten' | 'nieuws' | 'team' | 'faq';
export type Aankondiging = z.infer<typeof aankondigingSchema>;

type FormValues = FormData | Record<string, string | File | undefined>;

const fieldOrder: Record<EntryType, string[]> = {
  activiteiten: ['titel', 'datum', 'tijd', 'locatie', 'categorie', 'samenvatting', 'afbeelding', 'aliassen', 'concept'],
  nieuws: ['titel', 'datum', 'samenvatting', 'afbeelding', 'aliassen', 'concept'],
  team: ['naam', 'rol', 'categorie', 'volgorde', 'foto', 'concept'],
  faq: ['vraag', 'volgorde', 'concept'],
};

const schemas = {
  activiteiten: activiteitSchema,
  nieuws: nieuwsSchema,
  team: teamlidSchema,
  faq: faqSchema,
};

const bodyField: Record<EntryType, string> = {
  activiteiten: 'inhoud',
  nieuws: 'inhoud',
  team: 'beschrijving',
  faq: 'antwoord',
};

const slugField: Record<EntryType, string> = {
  activiteiten: 'titel',
  nieuws: 'titel',
  team: 'naam',
  faq: 'vraag',
};

// The default dump schema quotes strings that look like dates ('2025-02-07'); loading uses CORE_SCHEMA.
const toYaml = (value: unknown) => dump(value, {lineWidth: 80, noRefs: true});

const isEmpty = (value: unknown) =>
  value === undefined
  || value === null
  || value === ''
  || (Array.isArray(value) && value.length === 0);

const engines = {
  yaml: {
    parse: (source: string) => load(source, {schema: CORE_SCHEMA}) as object,
    stringify: (data: object) => toYaml(data),
  },
};

export function serializeEntry(type: EntryType, frontmatter: Record<string, unknown>, body: string): string {
  const data: Record<string, unknown> = {};
  for (const key of fieldOrder[type]) {
    const value = frontmatter[key];
    if (isEmpty(value)) {
      continue;
    }

    if (key === 'concept' && value !== true) {
      continue;
    }

    data[key] = typeof value === 'string' ? value.trim() : value;
  }

  const trimmed = body.trim();
  if (trimmed === '') {
    return `---\n${toYaml(data)}---\n`;
  }

  return matter.stringify(`\n${trimmed}\n`, data, {engines}).replace(/\n+$/, '\n');
}

export const formLinkMelding = 'Begin de link met https:// (of met / voor een pagina op deze site).';

/** Form-layer helper: trims, upgrades http:// and www. to https://. The schema still has the final say. */
export function normalizeLink(value: string): string {
  const trimmed = value.trim();
  if (/^http:\/\//i.test(trimmed)) {
    return `https://${trimmed.slice(7)}`;
  }

  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

const cleanOptional = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === '' ? undefined : trimmed;
};

const cleanAnnouncement = (input: Record<string, unknown>) => {
  const link = cleanOptional(input.link as string | undefined);
  return {
    ...input,
    tekst: typeof input.tekst === 'string' ? input.tekst.trim() : input.tekst,
    link: link === undefined ? undefined : normalizeLink(link),
    linkTekst: cleanOptional(input.linkTekst as string | undefined),
  };
};

export function parseAnnouncementForm(values: FormValues):
{ok: true; aankondiging: Aankondiging} | {ok: false; errors: Record<string, string>} {
  const result = aankondigingSchema.safeParse(cleanAnnouncement({
    actief: checked(getValue(values, 'actief')),
    tekst: getValue(values, 'tekst') ?? '',
    type: getValue(values, 'type'),
    link: getValue(values, 'link'),
    linkTekst: getValue(values, 'linkTekst'),
  }));
  if (result.success) {
    return {ok: true, aankondiging: result.data};
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    errors[key] ??= key === 'link' ? formLinkMelding : issue.message;
  }

  return {ok: false, errors};
}

export function updateAnnouncement(siteYamlText: string, aankondiging: Aankondiging, validate = true): string {
  const parsed = aankondigingSchema.parse(cleanAnnouncement(aankondiging));
  const block = toYaml({
    aankondiging: {
      actief: parsed.actief,
      tekst: parsed.tekst,
      type: parsed.type,
      ...(isEmpty(parsed.link) ? {} : {link: parsed.link}),
      ...(isEmpty(parsed.linkTekst) ? {} : {linkTekst: parsed.linkTekst}),
    },
  });

  const lines = siteYamlText.split('\n');
  const start = lines.findIndex(line => /^aankondiging:/.test(line));
  let next: string;
  if (start === -1) {
    next = `${siteYamlText.replace(/\n*$/, '\n')}${block}`;
  } else {
    // The block runs until the next top-level key; comments directly before it belong to that key.
    let end = lines.findIndex((line, index) => index > start && /^[^\s]/.test(line));
    if (end === -1) {
      end = lines.length;
    }

    let blockEnd = end;
    while (blockEnd > start + 1 && (lines[blockEnd - 1] === '' || lines[blockEnd - 1].startsWith('#')) && end !== lines.length) {
      blockEnd--;
    }

    if (end === lines.length) {
      while (blockEnd > start + 1 && lines[blockEnd - 1] === '') {
        blockEnd--;
      }
    }

    const before = lines.slice(0, start);
    const after = lines.slice(blockEnd);
    next = [...before, ...block.replace(/\n$/, '').split('\n'), ...after].join('\n');
    if (!next.endsWith('\n')) {
      next += '\n';
    }
  }

  if (validate) {
    siteSchema.parse(load(next, {schema: CORE_SCHEMA}));
  }

  return next;
}

const getValue = (values: FormValues, key: string): string | undefined => {
  const raw = values instanceof FormData ? values.get(key) : values[key];
  if (typeof raw !== 'string') {
    return undefined;
  }

  const trimmed = raw.trim();
  return trimmed === '' ? undefined : trimmed;
};

const checked = (value: string | undefined) => value !== undefined && ['on', 'true', '1', 'ja'].includes(value.toLowerCase());

export type ParsedEntryForm =
  | {ok: true; frontmatter: Record<string, unknown>; body: string; slugSource: string}
  | {ok: false; errors: Record<string, string>};

export function parseEntryForm(type: EntryType, values: FormValues): ParsedEntryForm {
  const input: Record<string, unknown> = {};
  for (const key of fieldOrder[type]) {
    const value = getValue(values, key);
    if (value === undefined) {
      continue;
    }

    if (key === 'concept') {
      input[key] = checked(value);
    } else if (key === 'volgorde') {
      input[key] = /^-?\d+$/.test(value) ? Number(value) : Number.NaN;
    } else if (key === 'aliassen') {
      input[key] = value.split(/[\n,]/).map(item => item.trim()).filter(Boolean);
    } else {
      input[key] = value;
    }
  }

  const body = (getValue(values, bodyField[type]) ?? '');
  const result = schemas[type].safeParse(input);
  const errors: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      errors[key] ??= issue.message;
    }
  }

  if (type === 'faq' && body === '') {
    errors.antwoord = 'Vul een antwoord in.';
  }

  if (!result.success || Object.keys(errors).length > 0) {
    return {ok: false, errors};
  }

  const frontmatter = result.data as Record<string, unknown>;
  return {ok: true, frontmatter, body, slugSource: String(frontmatter[slugField[type]])};
}
