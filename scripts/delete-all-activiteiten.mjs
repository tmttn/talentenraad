const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const PUBLIC_KEY = '3706422a8e454ceebe64acdc5a1475ba';

async function getAllActiviteiten() {
  const response = await fetch(`https://cdn.builder.io/api/v3/content/activiteit?apiKey=${PUBLIC_KEY}&limit=100`);
  const data = await response.json();
  return data.results || [];
}

async function deleteActiviteit(id, titel) {
  const response = await fetch(`https://builder.io/api/v1/write/activiteit/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${PRIVATE_KEY}`,
    },
  });

  if (!response.ok) {
    console.log(`  ✗ Failed to delete "${titel}"`);
    return false;
  }

  console.log(`  ✓ Deleted "${titel}"`);
  return true;
}

async function main() {
  console.log('🗑️  Fetching all activiteiten...\n');

  const activiteiten = await getAllActiviteiten();

  if (activiteiten.length === 0) {
    console.log('No activiteiten found.');
    return;
  }

  console.log(`Found ${activiteiten.length} activiteiten. Deleting...\n`);

  for (const item of activiteiten) {
    await deleteActiviteit(item.id, item.data?.titel || item.name);
  }

  console.log('\n✅ All activiteiten deleted!');
}

main();
