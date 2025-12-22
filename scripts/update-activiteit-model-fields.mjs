// Script to update the activiteit model in Builder.io
// Adds samenvatting and inhoud fields, removes beschrijving
// Run with: node scripts/update-activiteit-model-fields.mjs

const privateKey = process.env.BUILDER_PRIVATE_KEY ?? 'bpk-4537158022f148049234c9ffbe759373';

const mutation = `
  mutation UpdateModel($id: ID!, $body: JSONObject!) {
    updateModel(id: $id, body: $body) {
      id
      name
    }
  }
`;

// Updated fields - replace beschrijving with samenvatting and inhoud
const updatedFields = [
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
		name: 'samenvatting',
		type: 'longText',
		required: false,
		helperText: 'Korte samenvatting (max 200 tekens) - gebruikt voor SEO en lijstweergave',
	},
	{
		'@type': '@builder.io/core:Field',
		name: 'inhoud',
		type: 'richText',
		required: false,
		helperText: 'Volledige inhoud van de activiteit (HTML toegestaan)',
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
	{
		'@type': '@builder.io/core:Field',
		name: 'vastgepind',
		type: 'boolean',
		required: false,
		helperText: 'Toon bovenaan de lijst',
	},
	{
		'@type': '@builder.io/core:Field',
		name: 'volgorde',
		type: 'number',
		required: false,
		helperText: 'Lagere nummers worden eerst getoond',
	},
];

async function getModelId() {
	console.log('Fetching activiteit model ID...');

	const query = `
    query {
      models {
        id
        name
      }
    }
  `;

	const response = await fetch('https://builder.io/api/v2/admin', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${privateKey}`,
		},
		body: JSON.stringify({query}),
	});

	const result = await response.json();

	if (result.errors) {
		throw new Error(`Failed to fetch models: ${JSON.stringify(result.errors)}`);
	}

	const activiteitModel = result.data.models.find(m => m.name === 'activiteit');
	if (!activiteitModel) {
		throw new Error('Activiteit model not found');
	}

	console.log(`Found activiteit model with ID: ${activiteitModel.id}`);
	return activiteitModel.id;
}

async function updateModel(modelId) {
	console.log('Updating activiteit model fields...');

	const response = await fetch('https://builder.io/api/v2/admin', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${privateKey}`,
		},
		body: JSON.stringify({
			query: mutation,
			variables: {
				id: modelId,
				body: {
					fields: updatedFields,
				},
			},
		}),
	});

	const result = await response.json();
	console.log('Response:', JSON.stringify(result, null, 2));

	if (result.errors) {
		console.error('GraphQL errors:', result.errors);
		throw new Error('Failed to update model');
	}

	if (result.data?.updateModel) {
		console.log('Model updated successfully!');
		console.log('Model ID:', result.data.updateModel.id);
		console.log('Model Name:', result.data.updateModel.name);
	}
}

async function main() {
	try {
		const modelId = await getModelId();
		await updateModel(modelId);
		console.log('\nDone! The activiteit model now has samenvatting and inhoud fields instead of beschrijving.');
		console.log('\nNote: Existing activities with beschrijving data will need to be migrated manually.');
	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
}

main();
