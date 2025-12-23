// Script to migrate beschrijving data to samenvatting and inhoud fields
// Run with: node scripts/migrate-activiteit-beschrijving.mjs

const publicApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? '3706422a8e454ceebe64acdc5a1475ba';
const privateKey = process.env.BUILDER_PRIVATE_KEY ?? 'bpk-4537158022f148049234c9ffbe759373';

async function fetchAllActivities() {
  console.log('Fetching all activities...');

  const url = new URL('https://cdn.builder.io/api/v3/content/activiteit');
  url.searchParams.set('apiKey', publicApiKey);
  url.searchParams.set('limit', '100');
  url.searchParams.set('includeUnpublished', 'true');

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!data.results) {
    throw new Error('No results returned from API');
  }

  console.log(`Found ${data.results.length} activities`);
  return data.results;
}

function truncateForSeo(text, maxLength = 200) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  // Find the last space before maxLength to avoid cutting words
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength - 50) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

function stripHtml(html) {
  // Simple HTML tag removal for samenvatting
  return html
    .replaceAll(/<[^>]*>/g, '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

async function updateActivity(id, samenvatting, inhoud) {
  const response = await fetch(`https://builder.io/api/v1/write/activiteit/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${privateKey}`,
    },
    body: JSON.stringify({
      data: {
        samenvatting,
        inhoud,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update activity ${id}: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function main() {
  try {
    const activities = await fetchAllActivities();

    // Find activities with beschrijving that need migration
    const toMigrate = activities.filter(a => a.data.beschrijving && !a.data.samenvatting && !a.data.inhoud);

    if (toMigrate.length === 0) {
      console.log('\nNo activities need migration.');
      console.log('Either there are no activities with beschrijving, or they already have samenvatting/inhoud.');

      // Show current state
      const withBeschrijving = activities.filter(a => a.data.beschrijving);
      const withSamenvatting = activities.filter(a => a.data.samenvatting);
      const withInhoud = activities.filter(a => a.data.inhoud);

      console.log('\nCurrent state:');
      console.log(`  - Activities with beschrijving: ${withBeschrijving.length}`);
      console.log(`  - Activities with samenvatting: ${withSamenvatting.length}`);
      console.log(`  - Activities with inhoud: ${withInhoud.length}`);

      return;
    }

    console.log(`\nFound ${toMigrate.length} activities to migrate:`);
    for (const activity of toMigrate) {
      console.log(`  - ${activity.data.titel} (${activity.id})`);
    }

    console.log('\nStarting migration...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const activity of toMigrate) {
      const {beschrijving} = activity.data;

      // Create samenvatting: plain text, truncated for SEO
      const plainText = stripHtml(beschrijving);
      const samenvatting = truncateForSeo(plainText);

      // Create inhoud: wrap in paragraph tags if not already HTML
      const isHtml = /<[^>]+>/.test(beschrijving);
      const inhoud = isHtml ? beschrijving : `<p>${beschrijving.replaceAll('\n\n', '</p><p>').replaceAll('\n', '<br>')}</p>`;

      try {
        console.log(`Migrating: ${activity.data.titel}`);
        console.log(`  samenvatting: "${samenvatting.slice(0, 50)}..."`);

        await updateActivity(activity.id, samenvatting, inhoud);
        console.log('  ✓ Success\n');
        successCount++;
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('\n--- Migration Complete ---');
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errorCount}`);

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

main();
