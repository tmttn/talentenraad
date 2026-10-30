import path from 'node:path';
import {createContentReader} from './reader';

export const content = createContentReader(path.join(process.cwd(), 'content'), {
  includeConcepts: process.env.NODE_ENV === 'development',
});

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
