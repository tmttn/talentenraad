/* eslint-disable n/prefer-global/process */
import 'dotenv/config';

const ADMIN_BASE_URL = 'https://builder.io/api/v2/admin';
const WRITE_BASE_URL = 'https://builder.io/api/v1/write';
const builderPrivateKey = process.env.BUILDER_PRIVATE_KEY ?? '';

type BuilderBlock = {
	'@type': string;
	component?: {
		name: string;
		options: Record<string, unknown>;
	};
	responsiveStyles?: Record<string, Record<string, string>>;
	children?: BuilderBlock[];
};

type PageData = {
	url: string;
	title: string;
	blocks: BuilderBlock[];
};

// Create the sponsor model in Builder.io
async function createSponsorModel(): Promise<void> {
	const url = `${ADMIN_BASE_URL}/models`;

	const model = {
		name: 'sponsor',
		kind: 'data',
		helperText: 'Sponsors en partners van de Talentenraad',
		fields: [
			{
				'@type': '@builder.io/core:Field',
				name: 'naam',
				type: 'string',
				required: true,
				helperText: 'Naam van de sponsor',
			},
			{
				'@type': '@builder.io/core:Field',
				name: 'logo',
				type: 'file',
				allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp', 'svg'],
				required: true,
				helperText: 'Logo van de sponsor',
			},
			{
				'@type': '@builder.io/core:Field',
				name: 'website',
				type: 'url',
				helperText: 'Website URL van de sponsor (optioneel)',
			},
			{
				'@type': '@builder.io/core:Field',
				name: 'beschrijving',
				type: 'longText',
				helperText: 'Korte beschrijving van de sponsor (optioneel)',
			},
			{
				'@type': '@builder.io/core:Field',
				name: 'tier',
				type: 'string',
				enum: ['gold', 'silver', 'bronze', 'partner'],
				required: true,
				defaultValue: 'partner',
				helperText: 'Sponsorniveau: gold (goud), silver (zilver), bronze (brons), partner',
			},
			{
				'@type': '@builder.io/core:Field',
				name: 'actief',
				type: 'boolean',
				required: true,
				defaultValue: true,
				helperText: 'Is deze sponsor actief?',
			},
			{
				'@type': '@builder.io/core:Field',
				name: 'volgorde',
				type: 'number',
				helperText: 'Volgorde binnen het sponsorniveau (lager nummer = eerder)',
			},
		],
	};

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${builderPrivateKey}`,
		},
		body: JSON.stringify(model),
	});

	if (!response.ok) {
		const error = await response.text();
		// Check if model already exists
		if (error.includes('already exists') || error.includes('duplicate')) {
			console.log('Sponsor model already exists, skipping creation');
			return;
		}

		throw new Error(`Failed to create sponsor model: ${error}`);
	}

	const result = await response.json();
	console.log(`Created sponsor model (ID: ${result.id})`);
}

// Verify the model was created
async function verifyModel(): Promise<boolean> {
	const url = `${ADMIN_BASE_URL}/models`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${builderPrivateKey}`,
		},
	});

	if (!response.ok) {
		throw new Error('Failed to list models');
	}

	const models = await response.json();
	const sponsorModel = models.find((m: {name: string}) => m.name === 'sponsor');

	if (sponsorModel) {
		console.log('Sponsor model verified');
		return true;
	}

	return false;
}

// Create the sponsors page in Builder.io
async function createSponsorsPage(): Promise<void> {
	const url = `${WRITE_BASE_URL}/page`;

	const blocks: BuilderBlock[] = [
		{
			'@type': '@builder.io/sdk:Element',
			component: {
				name: 'Hero',
				options: {
					size: 'small',
				},
			},
			children: [
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: '<h1 style="font-size: 2.5rem; font-weight: bold; color: white; text-align: center;">Onze Sponsors</h1>',
						},
					},
				},
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: '<p style="font-size: 1.125rem; color: rgba(255,255,255,0.9); text-align: center; max-width: 600px; margin: 0 auto;">Met dank aan onze sponsors en partners die de Talentenraad ondersteunen.</p>',
						},
					},
				},
			],
		},
		{
			'@type': '@builder.io/sdk:Element',
			component: {
				name: 'Section',
				options: {
					background: 'white',
					size: 'large',
				},
			},
			children: [
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: '<h2 style="font-size: 1.75rem; font-weight: 600; color: #1f2937; text-align: center; margin-bottom: 1rem;">Gouden Sponsors</h2>',
						},
					},
				},
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: '<p style="color: #6b7280; text-align: center;">Nog geen gouden sponsors. Interesse? Neem contact met ons op!</p>',
						},
					},
				},
			],
		},
		{
			'@type': '@builder.io/sdk:Element',
			component: {
				name: 'Section',
				options: {
					background: 'light',
					size: 'large',
				},
			},
			children: [
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: '<h2 style="font-size: 1.75rem; font-weight: 600; color: #1f2937; text-align: center; margin-bottom: 1rem;">Zilveren Sponsors</h2>',
						},
					},
				},
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: '<p style="color: #6b7280; text-align: center;">Nog geen zilveren sponsors. Interesse? Neem contact met ons op!</p>',
						},
					},
				},
			],
		},
		{
			'@type': '@builder.io/sdk:Element',
			component: {
				name: 'Section',
				options: {
					background: 'white',
					size: 'large',
				},
			},
			children: [
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: '<h2 style="font-size: 1.75rem; font-weight: 600; color: #1f2937; text-align: center; margin-bottom: 1rem;">Bronzen Sponsors</h2>',
						},
					},
				},
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: '<p style="color: #6b7280; text-align: center;">Nog geen bronzen sponsors. Interesse? Neem contact met ons op!</p>',
						},
					},
				},
			],
		},
		{
			'@type': '@builder.io/sdk:Element',
			component: {
				name: 'Section',
				options: {
					background: 'light',
					size: 'large',
				},
			},
			children: [
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: '<h2 style="font-size: 1.75rem; font-weight: 600; color: #1f2937; text-align: center; margin-bottom: 1rem;">Partners</h2>',
						},
					},
				},
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: '<p style="color: #6b7280; text-align: center;">Nog geen partners. Interesse? Neem contact met ons op!</p>',
						},
					},
				},
			],
		},
		{
			'@type': '@builder.io/sdk:Element',
			component: {
				name: 'UnifiedCta',
				options: {
					variant: 'full',
					title: 'Word sponsor!',
					description: 'Wilt u de Talentenraad ondersteunen en zichtbaarheid krijgen bij onze schoolgemeenschap? Neem contact met ons op om de mogelijkheden te bespreken.',
					buttonText: 'Neem contact op',
					buttonLink: '/contact',
				},
			},
		},
	];

	const data: PageData = {
		url: '/sponsors',
		title: 'Onze Sponsors - Talentenraad',
		blocks,
	};

	const body = {
		name: 'Sponsors',
		published: 'published',
		data,
	};

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${builderPrivateKey}`,
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to create sponsors page: ${error}`);
	}

	const result = await response.json();
	console.log(`Created sponsors page (ID: ${result.id})`);
}

async function main(): Promise<void> {
	if (!builderPrivateKey) {
		console.error('Error: BUILDER_PRIVATE_KEY is not set');
		process.exit(1);
	}

	console.log('Setting up sponsors in Builder.io...\n');

	try {
		// Note about model creation
		console.log('1. Sponsor model setup:');
		console.log('   Please create the "sponsor" model manually in Builder.io with these fields:');
		console.log('   - naam (string, required): Naam van de sponsor');
		console.log('   - logo (file, required): Logo van de sponsor');
		console.log('   - website (url): Website URL van de sponsor');
		console.log('   - beschrijving (longText): Korte beschrijving');
		console.log('   - tier (enum: gold/silver/bronze/partner, required): Sponsorniveau');
		console.log('   - actief (boolean, required, default: true): Is sponsor actief');
		console.log('   - volgorde (number): Sorteervolgorde\n');

		// Create the page
		console.log('2. Creating sponsors page...');
		await createSponsorsPage();

		console.log('\nSetup complete!');
		console.log('\nNext steps:');
		console.log('1. Create the "sponsor" model in Builder.io (if not already done)');
		console.log('2. Add sponsors to the "sponsor" model');
		console.log('3. Use the SponsorBanner component on pages to display rotating sponsors');
		console.log('4. View analytics at /api/sponsors/track?sponsorId=<id>');
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

main();
