/**
 * The sale (actie) form in the editor: rows as the browser edits them (prices as euro text) and the
 * conversion to and from frontmatter. Client-safe, so the form component can share the row types.
 */
import {euroInvoer, parseEuro} from '../bestellingen/geld';
import {weekdag} from '../bestellingen/acties';
import {slugify} from '../content/slugify';

export type KeuzeRij = {naam: string; meerprijs: string};
export type OptieRij = {id: string; naam: string; keuzes: KeuzeRij[]};
export type ProductRij = {
  id: string;
  naam: string;
  info: string;
  prijs: string;
  voorraad: string;
  maxPerBestelling: string;
  opties: OptieRij[];
};
export type AfhaalRij = {id: string; datum: string; uur: string; plaats: string};

/** Form fields of an actie besides titel, samenvatting, afbeelding, inhoud and concept. */
export const actieVelden = ['bestellenVan', 'bestellenTot', 'binnenDagen', 'betaalwijzen', 'rekeningIban', 'rekeningBegunstigde', 'vraagKind', 'afhalen', 'producten'] as const;

/** Who the account of a new sale is in the name of, until the editor changes it. */
export const standaardBegunstigde = 'Talentenraad Het Talentenhuis';

type Raw = Record<string, unknown>;

const record = (value: unknown): Raw => (value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Raw : {});
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const text = (value: unknown) => (typeof value === 'string' ? value : (typeof value === 'number' ? String(value) : ''));
const cents = (value: unknown) => (typeof value === 'number' && Number.isInteger(value) ? euroInvoer(value) : text(value));

export const legeProductRij = (): ProductRij => ({id: '', naam: '', info: '', prijs: '', voorraad: '', maxPerBestelling: '', opties: []});
export const legeAfhaalRij = (): AfhaalRij => ({id: '', datum: '', uur: '', plaats: ''});

function productRij(value: unknown): ProductRij {
  const product = record(value);
  return {
    id: text(product.id),
    naam: text(product.naam),
    info: text(product.info),
    prijs: cents(product.prijs),
    voorraad: text(product.voorraad),
    maxPerBestelling: text(product.maxPerBestelling),
    opties: list(product.opties).map(item => {
      const optie = record(item);
      return {
        id: text(optie.id),
        naam: text(optie.naam),
        keuzes: list(optie.keuzes).map(entry => {
          const keuze = record(entry);
          return {naam: text(keuze.naam), meerprijs: keuze.meerprijs === undefined || keuze.meerprijs === 0 ? '' : cents(keuze.meerprijs)};
        }),
      };
    }),
  };
}

function afhaalRij(value: unknown): AfhaalRij {
  const moment = record(value);
  return {id: text(moment.id), datum: text(moment.datum), uur: text(moment.uur), plaats: text(moment.plaats)};
}

const parseJson = (json: string | undefined): unknown[] => {
  try {
    return list(JSON.parse(json ?? '[]'));
  } catch {
    return [];
  }
};

export const leesProductRijen = (json: string | undefined): ProductRij[] => parseJson(json).map(productRij);
export const leesAfhaalRijen = (json: string | undefined): AfhaalRij[] => parseJson(json).map(afhaalRij);

/** Frontmatter (as read from GitHub, not yet validated) → the string values of the form. */
export function actieFormWaarden(data: Raw): Record<string, string> {
  const bestellen = record(data.bestellen);
  const betalen = record(data.betalen);
  const wijzen = list(betalen.wijzen);
  const rekening = record(betalen.rekening);
  return {
    bestellenVan: text(bestellen.van),
    bestellenTot: text(bestellen.tot),
    binnenDagen: betalen.binnenDagen === undefined ? '5' : text(betalen.binnenDagen),
    wijzeOverschrijving: wijzen.includes('overschrijving') ? 'on' : '',
    wijzeCash: wijzen.includes('cash') ? 'on' : '',
    rekeningIban: text(rekening.iban),
    rekeningBegunstigde: text(rekening.begunstigde),
    vraagKind: record(data.vraag).kind === true ? 'on' : '',
    afhalen: JSON.stringify(list(data.afhalen).map(afhaalRij)),
    producten: JSON.stringify(list(data.producten).map(productRij)),
  };
}

/** A code from a name, unique among `used` (`margherita`, `margherita-2`); marks it used. */
function uniekeCode(naam: string, used: Set<string>, fallback: string): string {
  const base = slugify(naam) || fallback;
  let code = base;
  for (let n = 2; used.has(code); n++) {
    code = `${base}-${n}`;
  }

  used.add(code);
  return code;
}

const geheelGetal = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (trimmed === '') {
    return undefined;
  }

  return /^\d{1,6}$/.test(trimmed) ? Number(trimmed) : Number.NaN;
};

const euro = (value: string) => parseEuro(value) ?? Number.NaN;
const isGeldigeDatum = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).getTime());

/** Product rows → schema input. Empty rows are dropped; existing codes stay, new ones come from the name. */
export function productenInvoer(rijen: ProductRij[]): unknown[] {
  const gevuld = rijen
    .map(rij => ({
      ...rij,
      opties: rij.opties
        .map(optie => ({...optie, keuzes: optie.keuzes.filter(keuze => keuze.naam.trim() !== '' || keuze.meerprijs.trim() !== '')}))
        .filter(optie => optie.naam.trim() !== '' || optie.keuzes.length > 0),
    }))
    .filter(rij => rij.naam.trim() !== '' || rij.prijs.trim() !== '' || rij.info.trim() !== '' || rij.opties.length > 0);
  const used = new Set(gevuld.map(rij => rij.id).filter(Boolean));

  return gevuld.map(rij => {
    const optieCodes = new Set(rij.opties.map(optie => optie.id).filter(Boolean));
    const voorraad = geheelGetal(rij.voorraad);
    const max = geheelGetal(rij.maxPerBestelling);
    const info = rij.info.trim();
    return {
      id: rij.id || uniekeCode(rij.naam, used, 'product'),
      naam: rij.naam.trim(),
      ...(info === '' ? {} : {info}),
      prijs: euro(rij.prijs),
      ...(voorraad === undefined ? {} : {voorraad}),
      ...(max === undefined ? {} : {maxPerBestelling: max}),
      opties: rij.opties.map(optie => ({
        id: optie.id || uniekeCode(optie.naam, optieCodes, 'optie'),
        naam: optie.naam.trim(),
        keuzes: optie.keuzes.map(keuze => ({
          naam: keuze.naam.trim(),
          meerprijs: keuze.meerprijs.trim() === '' ? 0 : euro(keuze.meerprijs),
        })),
      })),
    };
  });
}

/** Pickup rows → schema input. A new moment gets its weekday as code (`vrijdag`, `vrijdag-2`). */
export function afhalenInvoer(rijen: AfhaalRij[]): unknown[] {
  const gevuld = rijen.filter(rij => [rij.datum, rij.uur, rij.plaats].some(value => value.trim() !== ''));
  const used = new Set(gevuld.map(rij => rij.id).filter(Boolean));
  return gevuld.map(rij => ({
    id: rij.id || uniekeCode(isGeldigeDatum(rij.datum) ? weekdag(rij.datum) : '', used, 'moment'),
    datum: rij.datum.trim(),
    uur: rij.uur.trim(),
    plaats: rij.plaats.trim(),
  }));
}

/** Where a schema issue belongs in the form, with the row number for list fields. */
export function actieFoutVeld(path: ReadonlyArray<PropertyKey>, message: string): [string, string] {
  const [first, second, third] = path;
  if (first === 'bestellen') {
    return [second === 'van' ? 'bestellenVan' : 'bestellenTot', message];
  }

  if (first === 'betalen') {
    if (second === 'rekening') {
      return [third === 'begunstigde' ? 'rekeningBegunstigde' : 'rekeningIban', message];
    }

    return [second === 'binnenDagen' ? 'binnenDagen' : 'betaalwijzen', message];
  }

  if (first === 'producten' || first === 'afhalen') {
    const label = first === 'producten' ? 'Product' : 'Afhaalmoment';
    return [first, typeof second === 'number' && third !== 'id' ? `${label} ${second + 1}: ${message}` : message];
  }

  return [String(first ?? 'form'), message];
}

/** Drops defaults and empty values, so the YAML stays as short as a hand-written file. */
export function compactActie(data: Raw): Raw {
  const vraag = record(data.vraag);
  return {
    ...data,
    vraag: vraag.kind === true ? {kind: true} : undefined,
    producten: list(data.producten).map(item => {
      const {maxPerBestelling, opties, ...product} = record(item);
      return {
        ...product,
        ...(maxPerBestelling === 10 || maxPerBestelling === undefined ? {} : {maxPerBestelling}),
        ...(list(opties).length === 0 ? {} : {
          opties: list(opties).map(entry => {
            const optie = record(entry);
            return {
              ...optie,
              keuzes: list(optie.keuzes).map(keuze => {
                const {meerprijs, ...rest} = record(keuze);
                return meerprijs === 0 || meerprijs === undefined ? rest : {...rest, meerprijs};
              }),
            };
          }),
        }),
      };
    }),
  };
}
