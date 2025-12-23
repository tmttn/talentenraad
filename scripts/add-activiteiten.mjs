const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const MODEL_NAME = 'activiteit';

// Sample activities - these should be replaced with real events from Facebook
const activiteiten = [
  {
    name: 'Talentenfuif',
    data: {
      titel: 'Talentenfuif',
      datum: '2025-03-29',
      tijd: '21:00 - 03:00',
      locatie: 'Het Talentenhuis',
      beschrijving: 'De jaarlijkse Talentenfuif voor ouders en leerkrachten. Een gezellige avond om elkaar beter te leren kennen!',
      categorie: 'feest',
    },
    published: 'published',
  },
  {
    name: 'Nieuwjaarsreceptie',
    data: {
      titel: 'Nieuwjaarsreceptie',
      datum: '2025-01-10',
      tijd: '18:00 - 20:00',
      locatie: 'Polyvalente zaal',
      beschrijving: 'Start het nieuwe jaar samen met de Talentenraad! Hapjes en drankjes voorzien.',
      categorie: 'activiteit',
    },
    published: 'published',
  },
  {
    name: 'Carnaval op school',
    data: {
      titel: 'Carnaval op school',
      datum: '2025-02-28',
      tijd: '09:00 - 12:00',
      locatie: 'Het Talentenhuis',
      beschrijving: 'Carnavalsfeest met verkleedpartij voor alle kinderen. Verkleed komen mag!',
      categorie: 'feest',
    },
    published: 'published',
  },
  {
    name: 'Paasontbijt',
    data: {
      titel: 'Paasontbijt',
      datum: '2025-04-18',
      tijd: '08:30 - 10:00',
      locatie: 'Schooleetzaal',
      beschrijving: 'Gezellig paasontbijt georganiseerd door de Talentenraad voor alle gezinnen.',
      categorie: 'activiteit',
    },
    published: 'published',
  },
  {
    name: 'Schoolfeest',
    data: {
      titel: 'Schoolfeest',
      datum: '2025-06-21',
      tijd: '14:00 - 22:00',
      locatie: 'Schooldomein',
      beschrijving: 'Het grote jaarlijkse schoolfeest met optredens, eten, drinken en veel gezelligheid!',
      categorie: 'feest',
    },
    published: 'published',
  },
  {
    name: 'Ouderraad vergadering',
    data: {
      titel: 'Vergadering Talentenraad',
      datum: '2025-01-15',
      tijd: '19:30 - 21:00',
      locatie: 'Vergaderzaal school',
      beschrijving: 'Maandelijkse vergadering van de Talentenraad. Nieuwe ouders welkom!',
      categorie: 'kalender',
    },
    published: 'published',
  },
];

async function addActiviteit(activiteit) {
  try {
    const response = await fetch(`https://builder.io/api/v1/write/${MODEL_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify(activiteit),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error adding ${activiteit.name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Adding activiteiten to Builder.io...\n');

  for (const activiteit of activiteiten) {
    console.log(`Adding: ${activiteit.name}`);
    const result = await addActiviteit(activiteit);
    if (result) {
      console.log(`  ✓ Created with ID: ${result.id}`);
    } else {
      console.log('  ✗ Failed to create');
    }
  }

  console.log('\nDone! You can now view and edit these items in Builder.io');
  console.log('Go to: https://builder.io/content?model=activiteit');
}

main();
