import {config} from 'dotenv';

config();

const PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;

if (!PRIVATE_KEY) {
	console.error('Error: BUILDER_PRIVATE_KEY not found in .env');
	process.exit(1);
}

async function createModel(modelInput) {
	console.log(`Creating model: ${modelInput.name}...`);

	const query = `
		mutation addModel($body: JSONObject!) {
			addModel(body: $body) {
				id
				name
			}
		}
	`;

	const body = {
		name: modelInput.name,
		kind: modelInput.kind,
		publicReadable: true,
		helperText: modelInput.helperText || '',
		fields: modelInput.fields.map(field => ({
			'@type': '@builder.io/core:Field',
			...field,
		})),
	};

	try {
		const response = await fetch('https://builder.io/api/v2/admin', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${PRIVATE_KEY}`,
			},
			body: JSON.stringify({query, variables: {body}}),
		});

		const result = await response.json();

		if (result.errors) {
			const errorMsg = result.errors[0]?.message || 'Unknown error';
			if (errorMsg.includes('already exists')) {
				console.log(`  ✓ Model ${modelInput.name} already exists`);
				return null;
			}

			console.error(`  ✗ Failed: ${modelInput.name} - ${errorMsg}`);
			return null;
		}

		console.log(`  ✓ Created: ${modelInput.name} (ID: ${result.data?.addModel?.id})`);
		return result.data?.addModel;
	} catch (error) {
		console.error(`  ✗ Failed: ${modelInput.name} - ${error.message}`);
		return null;
	}
}

async function main() {
	console.log('Creating Builder.io data models...\n');

	const dataModels = [
		{
			name: 'faq',
			kind: 'data',
			helperText: 'Veelgestelde vragen - beheer hier de FAQ items die op de website worden getoond',
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
		},
	];

	for (const model of dataModels) {
		await createModel(model);
	}

	console.log('\n✅ Klaar!');
	console.log('\nData models zijn beschikbaar in Builder.io:');
	console.log('- Content > faq: Veelgestelde vragen');
}

main().catch(console.error);
