// Create teamlid data model for team members
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
  name: 'teamlid',
  kind: 'data',
  publicReadable: true,
  showTargeting: false,
  allowHeatmap: false,
  showMetrics: false,
  bigData: false,
  strictPrivateWrite: false,
  helperText: 'Teamleden van de Talentenraad (bestuur en leden)',
  fields: [
    {
      '@type': '@builder.io/core:Field',
      name: 'naam',
      type: 'text',
      required: true,
      helperText: 'Volledige naam van het teamlid',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'rol',
      type: 'text',
      required: true,
      helperText: 'Rol in de Talentenraad (bijv. Voorzitter, Secretaris, Lid)',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'beschrijving',
      type: 'longText',
      required: false,
      helperText: 'Korte beschrijving of bio',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'afbeelding',
      type: 'file',
      required: false,
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
      helperText: 'Profielfoto (optioneel)',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'categorie',
      type: 'text',
      required: true,
      enum: ['bestuur', 'lid', 'helper'],
      defaultValue: 'lid',
      helperText: 'Type teamlid: bestuur, lid, of helper',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'volgorde',
      type: 'number',
      required: false,
      defaultValue: 99,
      helperText: 'Volgorde van weergave (lager = eerder)',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'actief',
      type: 'boolean',
      required: true,
      defaultValue: true,
      helperText: 'Is dit teamlid actief?',
    },
  ],
};

async function createModel() {
  try {
    console.log('Creating teamlid data model via GraphQL...');

    const response = await fetch('https://builder.io/api/v2/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRIVATE_KEY}`,
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
      if (result.errors[0]?.message?.includes('already exists')) {
        console.log('Model teamlid already exists!');
        return;
      }
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
