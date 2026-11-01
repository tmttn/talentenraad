/** Shared (client-safe) description of the editable content types: labels, form fields and file layout. */
export type EntryType = 'activiteiten' | 'nieuws' | 'team' | 'faq';

export type FieldConfig = {
  name: string;
  label: string;
  kind: 'text' | 'date' | 'number' | 'select';
  required?: boolean;
  hint?: string;
  options?: Array<{value: string; label: string}>;
};

export type EntryTypeConfig = {
  label: string;
  singular: string;
  addLabel: string;
  fields: FieldConfig[];
  bodyField: string;
  bodyLabel: string;
  /** Name of the frontmatter field that points to the image (`./afbeelding.jpg`), if the type has one. */
  imageField?: 'afbeelding' | 'foto';
  imageFile?: 'afbeelding.jpg' | 'foto.jpg';
  /** faq items are a single file; the others are a folder with index.md. */
  singleFile: boolean;
};

export const entryTypes: Record<EntryType, EntryTypeConfig> = {
  activiteiten: {
    label: 'Activiteiten',
    singular: 'activiteit',
    addLabel: 'Activiteit toevoegen',
    fields: [
      {name: 'titel', label: 'Titel', kind: 'text', required: true},
      {name: 'datum', label: 'Datum', kind: 'date', required: true},
      {name: 'tijd', label: 'Tijd', kind: 'text', hint: 'Bijvoorbeeld 14:00 - 17:00.'},
      {name: 'locatie', label: 'Locatie', kind: 'text'},
      {
        name: 'categorie',
        label: 'Categorie',
        kind: 'select',
        required: true,
        options: [
          {value: 'activiteit', label: 'Activiteit'},
          {value: 'feest', label: 'Feest'},
          {value: 'kalender', label: 'Kalender'},
        ],
      },
      {name: 'samenvatting', label: 'Samenvatting', kind: 'text', required: true, hint: 'Een korte zin voor in de lijst.'},
    ],
    bodyField: 'inhoud',
    bodyLabel: 'Inhoud',
    imageField: 'afbeelding',
    imageFile: 'afbeelding.jpg',
    singleFile: false,
  },
  nieuws: {
    label: 'Nieuws',
    singular: 'nieuwsbericht',
    addLabel: 'Nieuwsbericht toevoegen',
    fields: [
      {name: 'titel', label: 'Titel', kind: 'text', required: true},
      {name: 'datum', label: 'Datum', kind: 'date', required: true},
      {name: 'samenvatting', label: 'Samenvatting', kind: 'text', required: true, hint: 'Een korte zin voor in de lijst.'},
    ],
    bodyField: 'inhoud',
    bodyLabel: 'Inhoud',
    imageField: 'afbeelding',
    imageFile: 'afbeelding.jpg',
    singleFile: false,
  },
  team: {
    label: 'Team',
    singular: 'teamlid',
    addLabel: 'Teamlid toevoegen',
    fields: [
      {name: 'naam', label: 'Naam', kind: 'text', required: true},
      {name: 'rol', label: 'Rol', kind: 'text', required: true},
      {
        name: 'categorie',
        label: 'Categorie',
        kind: 'select',
        required: true,
        options: [
          {value: 'bestuur', label: 'Bestuur'},
          {value: 'lid', label: 'Lid'},
        ],
      },
      {name: 'volgorde', label: 'Volgorde', kind: 'number', hint: 'Lagere nummers komen eerst. Leeg laten betekent helemaal achteraan.'},
    ],
    bodyField: 'beschrijving',
    bodyLabel: 'Beschrijving',
    imageField: 'foto',
    imageFile: 'foto.jpg',
    singleFile: false,
  },
  faq: {
    label: 'Veelgestelde vragen',
    singular: 'vraag',
    addLabel: 'Vraag toevoegen',
    fields: [
      {name: 'vraag', label: 'Vraag', kind: 'text', required: true},
      {name: 'volgorde', label: 'Volgorde', kind: 'number', hint: 'Lagere nummers komen eerst. Leeg laten betekent helemaal achteraan.'},
    ],
    bodyField: 'antwoord',
    bodyLabel: 'Antwoord',
    singleFile: true,
  },
};

export const entryTypeNames = Object.keys(entryTypes) as EntryType[];

export const isEntryType = (value: string): value is EntryType => Object.hasOwn(entryTypes, value);

export const announcementTypes = [
  {value: 'info', label: 'Info'},
  {value: 'waarschuwing', label: 'Waarschuwing'},
  {value: 'belangrijk', label: 'Belangrijk'},
];

export const deployLabels = {
  bezig: 'Bezig met online zetten…',
  klaar: 'Online',
  mislukt: 'Online zetten mislukt — de beheerder krijgt dit te zien in GitHub.',
  onbekend: 'Status van het online zetten is onbekend.',
} as const;

export const savedMessage = 'Opgeslagen. Je wijziging staat over ongeveer 3 minuten online.';
export const notConfiguredMessage = 'Bewerken is nog niet ingesteld. Vraag de beheerder om de GitHub-koppeling in te stellen.';
