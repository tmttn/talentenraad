const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';

const mutation = `
  mutation AddModel($body: JSONObject!) {
    addModel(body: $body) {
      id
      name
    }
  }
`;

const modelBody = {
  name: 'activiteit',
  kind: 'data',
  publicReadable: true,
  showTargeting: false,
  allowHeatmap: false,
  showMetrics: false,
  bigData: false,
  strictPrivateWrite: false,
  helperText: 'Kalender en activiteiten items voor de Talentenraad',
  fields: [
    {
      '@type': '@builder.io/core:Field',
      name: 'titel',
      type: 'text',
      required: true,
      helperText: 'Titel van de activiteit',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'datum',
      type: 'date',
      required: true,
      helperText: 'Datum van de activiteit',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'tijd',
      type: 'text',
      required: false,
      helperText: 'Tijd (bijv. 14:00 - 17:00)',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'locatie',
      type: 'text',
      required: false,
      helperText: 'Locatie van de activiteit',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'beschrijving',
      type: 'longText',
      required: false,
      helperText: 'Beschrijving van de activiteit',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'categorie',
      type: 'text',
      required: true,
      enum: ['kalender', 'activiteit', 'nieuws', 'feest'],
      helperText: 'Type activiteit',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'afbeelding',
      type: 'file',
      required: false,
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
      helperText: 'Optionele afbeelding',
    },
  ],
};

async function createModel() {
  try {
    console.log('Creating activiteit data model via GraphQL...');

    const response = await fetch('https://builder.io/api/v2/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          body: modelBody,
        },
      }),
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
    } else if (result.data?.addModel) {
      console.log('Model created successfully!');
      console.log('Model ID:', result.data.addModel.id);
      console.log('Model Name:', result.data.addModel.name);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createModel();
