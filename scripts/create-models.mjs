const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';

async function createModel(modelInput) {
  console.log(`Creating model: ${modelInput.name}...`);

  const query = `
    mutation CreateModel($body: JSONObject!) {
      addModel(body: $body) {
        id
        name
      }
    }
  `;

  const response = await fetch('https://builder.io/api/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      query,
      variables: {
        body: modelInput,
      },
    }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error(`Failed to create ${modelInput.name}:`, result.errors[0].message);
    return null;
  }

  console.log(`✓ Created model: ${modelInput.name}`);
  return result.data?.addModel;
}

async function main() {
  // Aankondiging model for announcement banners
  const aankondigingModel = {
    name: 'aankondiging',
    kind: 'data',
    fields: [
      {
        name: 'tekst',
        type: 'text',
        required: true,
        helperText: 'De aankondigingstekst',
      },
      {
        name: 'link',
        type: 'url',
        helperText: 'Optionele link voor meer info',
      },
      {
        name: 'linkTekst',
        type: 'text',
        helperText: 'Tekst voor de link (bijv. "Meer info")',
      },
      {
        name: 'type',
        type: 'text',
        required: true,
        enum: ['info', 'waarschuwing', 'belangrijk'],
        defaultValue: 'info',
        helperText: 'Type bepaalt de kleur: info (blauw), waarschuwing (oranje), belangrijk (roze)',
      },
      {
        name: 'actief',
        type: 'boolean',
        required: true,
        defaultValue: true,
        helperText: 'Alleen actieve aankondigingen worden getoond',
      },
    ],
  };

  // FAQ model for frequently asked questions
  const faqModel = {
    name: 'faq',
    kind: 'data',
    fields: [
      {
        name: 'vraag',
        type: 'text',
        required: true,
        helperText: 'De vraag',
      },
      {
        name: 'antwoord',
        type: 'longText',
        required: true,
        helperText: 'Het antwoord op de vraag',
      },
      {
        name: 'volgorde',
        type: 'number',
        defaultValue: 0,
        helperText: 'Volgorde van weergave (lager = eerder)',
      },
    ],
  };

  console.log('Creating Builder.io models...\n');

  await createModel(aankondigingModel);
  await createModel(faqModel);

  console.log('\n✅ All models created!');
  console.log('\nNu kun je in Builder.io content toevoegen voor:');
  console.log('- Aankondigingen (aankondiging model)');
  console.log('- Veelgestelde vragen (faq model)');
}

main();
