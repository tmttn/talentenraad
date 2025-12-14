import { createAdminApiClient } from '@builder.io/admin-sdk';

const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';

const adminSDK = createAdminApiClient(PRIVATE_KEY);

async function createActiviteitModel() {
  try {
    console.log('Creating activiteit data model...');

    const result = await adminSDK.chain.mutation.addModel({
      body: {
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
      },
    }).get({ id: true, name: true });

    console.log('Model created successfully!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error creating model:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
  }
}

createActiviteitModel();
