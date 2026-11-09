import type {EntryType} from './entry-types';

type Verb = 'toevoegen' | 'bijwerken' | 'verwijderen';
type Subject = EntryType | 'aankondiging';

// commitlint (commitlint.config.js) allows a subject of at most 100 characters. The longest
// prefix, `verwijderen activiteiten "`, takes 26 of them, so 60 for the title leaves room.
export const maxTitleLength = 60;

const oneLine = (value: string) => {
  const flat = value.replaceAll(/\s+/g, ' ').replaceAll('"', '\'').trim();
  return flat.length > maxTitleLength ? `${flat.slice(0, maxTitleLength - 1).trimEnd()}…` : flat;
};

// No editor name or e-mail in the message: the repo is public. The audit log links each commit to the user.
// The `content` type must stay in commitlint's type-enum: CI lints every push to main, these commits included.
export const commitMessage = (verb: Verb, subject: Subject, title: string) =>
  `content: ${verb} ${subject} "${oneLine(title)}"`;
