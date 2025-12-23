const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const PUBLIC_KEY = '3706422a8e454ceebe64acdc5a1475ba';
const MODEL_NAME = 'activiteit';

// First, delete old activities and add new ones with future dates
const newActiviteiten = [
  {
    name: 'Nieuwjaarsdrink',
    data: {
      titel: 'Nieuwjaarsdrink',
      datum: '2026-01-25',
      tijd: '11:00 - 13:00',
      locatie: 'Het Talentenhuis',
      beschrijving: 'Start het nieuwe jaar gezellig met de Talentenraad! Iedereen is welkom voor een drankje en hapje.',
      categorie: 'feest',
    },
    published: 'published',
  },
  {
    name: 'Valentijnsactie',
    data: {
      titel: 'Valentijnsactie',
      datum: '2026-02-14',
      tijd: 'Hele dag',
      locatie: 'Het Talentenhuis',
      beschrijving: 'Verras je valentijn met een lief berichtje! De Talentenraad bezorgt alle kaartjes.',
      categorie: 'activiteit',
    },
    published: 'published',
  },
  {
    name: 'Pannenkoekendag',
    data: {
      titel: 'Pannenkoekendag',
      datum: '2026-03-08',
      tijd: '10:00 - 14:00',
      locatie: 'Refter',
      beschrijving: 'Onbeperkt pannenkoeken eten! Met diverse toppings van suiker tot ijs.',
      categorie: 'activiteit',
    },
    published: 'published',
  },
  {
    name: 'Paasontbijt',
    data: {
      titel: 'Paasontbijt',
      datum: '2026-04-12',
      tijd: '09:00 - 11:30',
      locatie: 'Schooleetzaal',
      beschrijving: 'Gezellig paasontbijt voor het hele gezin. Inclusief paaseieren zoeken voor de kinderen!',
      categorie: 'feest',
    },
    published: 'published',
  },
  {
    name: 'Moederdag Ontbijt',
    data: {
      titel: 'Moederdag Ontbijt',
      datum: '2026-05-11',
      tijd: '09:00 - 12:00',
      locatie: 'Het Talentenhuis',
      beschrijving: 'Een heerlijk ontbijt voor alle mamas en omas. De kinderen verwennen hun mama met zelfgemaakte cadeautjes en lekkernijen.',
      categorie: 'feest',
    },
    published: 'published',
  },
  {
    name: 'Vaderdag BBQ',
    data: {
      titel: 'Vaderdag BBQ',
      datum: '2026-06-14',
      tijd: '11:00 - 15:00',
      locatie: 'Schoolplein',
      beschrijving: 'Gezellige barbecue voor alle papas en opas. Met spelletjes, muziek en natuurlijk heerlijk eten van de grill.',
      categorie: 'feest',
    },
    published: 'published',
  },
  {
    name: 'Schoolfeest',
    data: {
      titel: 'Schoolfeest',
      datum: '2026-09-20',
      tijd: '14:00 - 22:00',
      locatie: 'Het Talentenhuis',
      beschrijving: 'Het jaarlijkse schoolfeest met optredens, spelletjes, eten en drinken. Een feest voor jong en oud!',
      categorie: 'feest',
    },
    published: 'published',
  },
  {
    name: 'Sint op School',
    data: {
      titel: 'Sint op School',
      datum: '2026-12-04',
      tijd: '13:30 - 16:00',
      locatie: 'Het Talentenhuis',
      beschrijving: 'De Sint bezoekt alle klassen en deelt snoepgoed uit. Een magisch moment voor alle kinderen!',
      categorie: 'feest',
    },
    published: 'published',
  },
  {
    name: 'Kerstmarkt',
    data: {
      titel: 'Kerstmarkt',
      datum: '2026-12-18',
      tijd: '16:00 - 20:00',
      locatie: 'Schoolplein',
      beschrijving: 'Gezellige kerstmarkt met kraampjes, gluhwein, warme chocomelk en kerstmuziek.',
      categorie: 'feest',
    },
    published: 'published',
  },
  {
    name: 'Vergadering Talentenraad',
    data: {
      titel: 'Vergadering Talentenraad',
      datum: '2026-01-20',
      tijd: '19:30 - 21:00',
      locatie: 'Vergaderzaal school',
      beschrijving: 'Maandelijkse vergadering van de Talentenraad. Nieuwe ouders welkom!',
      categorie: 'kalender',
    },
    published: 'published',
  },
];

async function deleteOldActivities() {
  console.log('Fetching existing activities...');

  const response = await fetch(`https://cdn.builder.io/api/v3/content/${MODEL_NAME}?apiKey=${PUBLIC_KEY}&limit=100`);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    console.log(`Found ${data.results.length} existing activities. Deleting...`);

    for (const item of data.results) {
      try {
        const deleteResponse = await fetch(
          `https://builder.io/api/v1/write/${MODEL_NAME}/${item.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${PRIVATE_KEY}`,
            },
          },
        );

        if (deleteResponse.ok) {
          console.log(`  ✓ Deleted: ${item.data?.titel || item.id}`);
        } else {
          console.log(`  ✗ Failed to delete: ${item.id}`);
        }
      } catch (error) {
        console.error(`  ✗ Error deleting ${item.id}:`, error.message);
      }
    }
  } else {
    console.log('No existing activities found.');
  }
}

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

    return await response.json();
  } catch (error) {
    console.error(`Error adding ${activiteit.name}:`, error.message);
    return null;
  }
}

async function main() {
  // First delete old activities
  await deleteOldActivities();

  console.log('\nAdding new activities with future dates...\n');

  for (const activiteit of newActiviteiten) {
    console.log(`Adding: ${activiteit.name}`);
    const result = await addActiviteit(activiteit);
    if (result) {
      console.log(`  ✓ Created with ID: ${result.id}`);
    } else {
      console.log('  ✗ Failed to create');
    }
  }

  console.log('\nDone! Activities updated with future dates.');
}

main();
