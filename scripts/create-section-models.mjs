import {config} from 'dotenv';

config();

const PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;

if (!PRIVATE_KEY) {
	console.error('Error: BUILDER_PRIVATE_KEY not found in .env');
	process.exit(1);
}

async function createSectionModel(modelConfig) {
	console.log(`Creating section model: ${modelConfig.name}...`);

	const query = `
		mutation addModel($body: JSONObject!) {
			addModel(body: $body) {
				id
				name
			}
		}
	`;

	const body = {
		name: modelConfig.name,
		kind: 'component',
		publicReadable: true,
		showTargeting: true,
		allowBuiltInComponents: true,
		helperText: modelConfig.helperText || '',
		fields: [
			{
				'@type': '@builder.io/core:Field',
				'type': 'uiBlocks',
				'name': 'blocks',
				'required': true,
			},
		],
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
				console.log(`  ✓ Model ${modelConfig.name} already exists`);
				return null;
			}

			console.error(`  ✗ Failed: ${modelConfig.name} - ${errorMsg}`);
			return null;
		}

		console.log(`  ✓ Created: ${modelConfig.name} (ID: ${result.data?.addModel?.id})`);
		return result.data?.addModel;
	} catch (error) {
		console.error(`  ✗ Failed: ${modelConfig.name} - ${error.message}`);
		return null;
	}
}

async function main() {
	console.log('Creating Builder.io Section models...\n');

	const sectionModels = [
		{
			name: 'footer-cta',
			helperText: 'CTA sectie die boven de footer verschijnt op alle paginas',
		},
		{
			name: 'announcement-bar',
			helperText: 'Aankondigingsbalk die bovenaan de website verschijnt',
		},
		{
			name: 'hero-section',
			helperText: 'Hero sectie voor paginas',
		},
		{
			name: 'cta-section',
			helperText: 'Call-to-action sectie',
		},
		{
			name: 'faq-section',
			helperText: 'Veelgestelde vragen sectie',
		},
	];

	for (const model of sectionModels) {
		await createSectionModel(model);
	}

	console.log('\n✅ Klaar!');
	console.log('\nVolgende stappen in Builder.io:');
	console.log('1. Ga naar Content in de sidebar');
	console.log('2. Klik op + New Entry');
	console.log('3. Selecteer een section model (bijv. footer-cta)');
	console.log('4. Ontwerp de sectie visueel met de drag-and-drop editor');
	console.log('5. Publiceer de sectie');
	console.log('\nDe secties worden automatisch server-side geladen op de website!');
}

main().catch(console.error);
