const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';

// Add news item about the chairman
const nieuwsItem = {
  titel: 'Kennismaking met de Talentenraad',
  datum: new Date().toISOString().split('T')[0], // Today's date
  samenvatting: 'Maak kennis met Jo Vanheel, voorzitter van de Talentenraad sinds 2022, en ontdek wat wij doen voor de schoolgemeenschap.',
};

async function addNieuwsItem() {
  console.log('📰 Adding news item about the chairman...\n');

  const response = await fetch('https://builder.io/api/v1/write/nieuws', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      name: nieuwsItem.titel,
      published: 'published',
      data: nieuwsItem,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`✗ Failed: ${error}`);
    return;
  }

  console.log(`✓ Added: "${nieuwsItem.titel}"`);
}

addNieuwsItem();
