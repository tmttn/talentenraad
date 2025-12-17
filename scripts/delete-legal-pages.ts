/* eslint-disable n/prefer-global/process */
import 'dotenv/config';

const WRITE_BASE_URL = 'https://builder.io/api/v1/write';
const builderPrivateKey = process.env.BUILDER_PRIVATE_KEY ?? '';

const pageIds = [
	'e61943c13c8c47fab834df89e82e473b', // Privacybeleid
	'72c297aa0eeb49cb99f32c4bf63cea68', // Cookiebeleid
	'5c61c39ccaff40a9b10d111a34f343d1', // Algemene Voorwaarden
];

async function deletePage(id: string): Promise<void> {
	const url = `${WRITE_BASE_URL}/page/${id}`;

	const response = await fetch(url, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${builderPrivateKey}`,
		},
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to delete page ${id}: ${error}`);
	}

	console.log(`✓ Deleted page: ${id}`);
}

async function main(): Promise<void> {
	if (!builderPrivateKey) {
		console.error('Error: BUILDER_PRIVATE_KEY is not set');
		process.exit(1);
	}

	console.log('Deleting existing legal pages from Builder.io...\n');

	for (const id of pageIds) {
		try {
			await deletePage(id);
		} catch (error) {
			console.error(`Error deleting ${id}:`, error);
		}
	}

	console.log('\n✓ Done!');
}

main();
