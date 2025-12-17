/* eslint-disable n/prefer-global/process */
import 'dotenv/config';

const WRITE_BASE_URL = 'https://builder.io/api/v1/write';
const builderPrivateKey = process.env.BUILDER_PRIVATE_KEY ?? '';

const pageIds = [
	'01fffa31cab24a269c57b02130f51caf', // Privacybeleid
	'3baea1df01ee4b07bd63e9be5c53dea8', // Cookiebeleid
	'3965830aa043403d962f6c548c53727c', // Algemene Voorwaarden
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
