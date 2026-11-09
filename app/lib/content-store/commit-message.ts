// Longest title in a commit message: with the longest verb and subject the header stays
// under the 100 characters commitlint allows for a subject (commitlint.config.js).
export const commitTitelMax = 60;

const oneLine = (value: string, max: number) => value.replaceAll(/\s+/g, ' ').replaceAll('"', '\'').trim().slice(0, max).trim();

// No editor name or e-mail in the message: the repo is public. The audit log links each commit to the user.
export const commitMessage = (verb: 'toevoegen' | 'bijwerken' | 'verwijderen', subject: string, title: string) =>
  `content: ${verb} ${subject} "${oneLine(title, commitTitelMax)}"`;
