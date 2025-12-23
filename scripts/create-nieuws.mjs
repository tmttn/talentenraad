const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const PUBLIC_KEY = '3706422a8e454ceebe64acdc5a1475ba';

// Create nieuws model
const createModelMutation = `
  mutation AddModel($body: JSONObject!) {
    addModel(body: $body) {
      id
      name
    }
  }
`;

const nieuwsModel = {
  name: 'nieuws',
  kind: 'data',
  publicReadable: true,
  showTargeting: false,
  allowHeatmap: false,
  showMetrics: false,
  bigData: false,
  strictPrivateWrite: false,
  helperText: 'Nieuwsberichten voor de Talentenraad website',
  fields: [
    {
      '@type': '@builder.io/core:Field',
      name: 'titel',
      type: 'text',
      required: true,
      helperText: 'Titel van het nieuwsbericht',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'datum',
      type: 'date',
      required: true,
      helperText: 'Publicatiedatum',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'samenvatting',
      type: 'longText',
      required: true,
      helperText: 'Korte samenvatting (max 200 tekens)',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'inhoud',
      type: 'richText',
      required: false,
      helperText: 'Volledige inhoud van het nieuwsbericht',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'afbeelding',
      type: 'file',
      required: false,
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
      helperText: 'Afbeelding bij het nieuwsbericht',
    },
  ],
};

// Sample nieuws items
const nieuwsItems = [
  {
    titel: 'Succesvolle Kerstmarkt 2024',
    datum: '2024-12-22',
    samenvatting: 'De kerstmarkt was weer een groot succes! Dankzij jullie steun hebben we 1.500 euro opgehaald voor nieuwe speeltoestellen.',
  },
  {
    titel: 'Nieuwjaarsdrink 25 januari',
    datum: '2025-01-10',
    samenvatting: 'Start het nieuwe jaar gezellig met de Talentenraad! Iedereen is welkom voor een drankje en hapje.',
  },
  {
    titel: 'Nieuwe speeltoestellen geplaatst',
    datum: '2025-01-05',
    samenvatting: 'Dankzij de opbrengst van onze acties konden we nieuwe klimtoestellen laten plaatsen op de speelplaats.',
  },
  {
    titel: 'Terugblik Sint op School',
    datum: '2024-12-08',
    samenvatting: 'De Sint en zijn Pieten bezochten alle klassen. De kinderen genoten volop van de snoepjes en cadeautjes!',
  },
  {
    titel: 'Wafelbakactie - Bestel nu!',
    datum: '2024-12-01',
    samenvatting: 'Onze jaarlijkse wafelbakactie is gestart. Bestel heerlijke verse wafels en steun de school!',
  },
  {
    titel: 'Nieuwe leden gezocht',
    datum: '2024-11-15',
    samenvatting: 'De Talentenraad zoekt versterking! Ben jij een enthousiaste ouder die wil meehelpen?',
  },
];

async function createModel() {
  console.log('📰 Creating nieuws model...');

  const response = await fetch('https://builder.io/api/v2/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      query: createModelMutation,
      variables: {body: nieuwsModel},
    }),
  });

  const result = await response.json();

  if (result.errors) {
    // Model might already exist
    if (result.errors[0].message.includes('already exists')) {
      console.log('  ℹ️  Model already exists, continuing...');
      return true;
    }

    console.error('  ✗ Error creating model:', result.errors[0].message);
    return false;
  }

  console.log('  ✓ Model created successfully');
  return true;
}

async function addNieuwsItem(item) {
  const response = await fetch('https://builder.io/api/v1/write/nieuws', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      name: item.titel,
      published: 'published',
      data: item,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`  ✗ Failed to add "${item.titel}": ${error}`);
    return false;
  }

  console.log(`  ✓ Added "${item.titel}"`);
  return true;
}

async function main() {
  // Create model first
  const modelCreated = await createModel();
  if (!modelCreated) {
    console.log('❌ Could not create model, stopping...');
    return;
  }

  // Add nieuws items
  console.log('\n📝 Adding nieuws items...\n');

  for (const item of nieuwsItems) {
    await addNieuwsItem(item);
  }

  console.log('\n✅ Done! Nieuws items added to Builder.io');
}

main();
