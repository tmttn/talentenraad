import path from 'node:path';
import {type ContentReader, createContentReader} from './reader';

const rootDir = path.join(process.cwd(), 'content');
const isDevelopment = process.env.NODE_ENV === 'development';
const options = {includeConcepts: isDevelopment, cache: !isDevelopment};

const shared = createContentReader(rootDir, options);

// In development a new reader per call, so edits to content/ show up without a restart.
const reader = (): ContentReader => isDevelopment ? createContentReader(rootDir, options) : shared;

export const content: ContentReader = {
  getSite: () => reader().getSite(),
  getPagina: naam => reader().getPagina(naam),
  listTeksten: () => reader().listTeksten(),
  getTekst: slug => reader().getTekst(slug),
  getActiviteiten: () => reader().getActiviteiten(),
  getActiviteit: slug => reader().getActiviteit(slug),
  getNieuws: () => reader().getNieuws(),
  getNieuwsItem: slug => reader().getNieuwsItem(slug),
  getTeam: () => reader().getTeam(),
  getFaq: () => reader().getFaq(),
};

export type {
  Activiteit,
  ContentReader,
  FaqItem,
  NieuwsItem,
  Pagina,
  Teamlid,
  Tekst,
} from './reader';
export type {ContentImage} from './files';
export type {PaginaNaam, Site} from './schemas';
