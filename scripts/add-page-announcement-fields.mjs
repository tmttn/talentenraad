const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';

async function updateModel(modelName, newFields) {
	console.log(`Updating model: ${modelName}...`);

	// First get the existing model
	const getQuery = `
    query GetModel($name: String!) {
      models(query: { name: $name }) {
        id
        name
        fields
      }
    }
  `;

	const getResponse = await fetch('https://builder.io/api/v1/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${PRIVATE_KEY}`,
		},
		body: JSON.stringify({
			query: getQuery,
			variables: {name: modelName},
		}),
	});

	const getData = await getResponse.json();

	if (getData.errors) {
		console.error(`Failed to get ${modelName}:`, getData.errors[0].message);
		return null;
	}

	const model = getData.data?.models?.[0];
	if (!model) {
		console.log(`Model ${modelName} not found`);
		return null;
	}

	// Merge existing fields with new fields
	const existingFields = model.fields || [];
	const existingFieldNames = existingFields.map(f => f.name);
	const fieldsToAdd = newFields.filter(f => !existingFieldNames.includes(f.name));

	if (fieldsToAdd.length === 0) {
		console.log(`  ✓ Model ${modelName} already has all fields`);
		return model;
	}

	const updatedFields = [...existingFields, ...fieldsToAdd];

	// Update the model
	const updateQuery = `
    mutation UpdateModel($id: ID!, $body: JSONObject!) {
      updateModel(id: $id, body: $body) {
        id
        name
      }
    }
  `;

	const updateResponse = await fetch('https://builder.io/api/v1/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${PRIVATE_KEY}`,
		},
		body: JSON.stringify({
			query: updateQuery,
			variables: {
				id: model.id,
				body: {
					fields: updatedFields,
				},
			},
		}),
	});

	const updateData = await updateResponse.json();

	if (updateData.errors) {
		console.error(`Failed to update ${modelName}:`, updateData.errors[0].message);
		return null;
	}

	console.log(`  ✓ Added fields to ${modelName}: ${fieldsToAdd.map(f => f.name).join(', ')}`);
	return updateData.data?.updateModel;
}

async function main() {
	console.log('Adding page announcement fields to page model...\n');

	const announcementFields = [
		{
			'@type': '@builder.io/core:Field',
			name: 'paginaAankondiging',
			type: 'object',
			helperText: 'Optionele aankondiging die alleen op deze pagina verschijnt',
			subFields: [
				{
					'@type': '@builder.io/core:Field',
					name: 'actief',
					type: 'boolean',
					defaultValue: false,
					helperText: 'Aankondiging tonen op deze pagina',
				},
				{
					'@type': '@builder.io/core:Field',
					name: 'tekst',
					type: 'text',
					helperText: 'De tekst van de aankondiging',
				},
				{
					'@type': '@builder.io/core:Field',
					name: 'type',
					type: 'text',
					enum: ['info', 'waarschuwing', 'belangrijk'],
					defaultValue: 'info',
					helperText: 'Type aankondiging: info (blauw), waarschuwing (oranje), belangrijk (paars)',
				},
				{
					'@type': '@builder.io/core:Field',
					name: 'link',
					type: 'url',
					helperText: 'Optionele link URL',
				},
				{
					'@type': '@builder.io/core:Field',
					name: 'linkTekst',
					type: 'text',
					helperText: 'Tekst voor de link (bijv. "Meer info")',
				},
			],
		},
	];

	await updateModel('page', announcementFields);

	console.log('\n✅ Done! Je kunt nu in Builder.io:');
	console.log('- Pagina-specifieke aankondigingen toevoegen via het "paginaAankondiging" veld');
	console.log('- Kies een type: info (blauw), waarschuwing (oranje), of belangrijk (paars)');
	console.log('- Vul de tekst in en optioneel een link');
}

main().catch(console.error);
