const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const PUBLIC_KEY = '3706422a8e454ceebe64acdc5a1475ba';

async function getAllPages() {
  const response = await fetch(
    `https://cdn.builder.io/api/v3/content/page?apiKey=${PUBLIC_KEY}&limit=20&includeUnpublished=true`
  );
  const data = await response.json();
  return data.results || [];
}

async function archivePage(id, name) {
  const response = await fetch(`https://builder.io/api/v1/write/page/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      published: 'archived',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`  ✗ Failed to archive "${name}": ${error}`);
    return false;
  }

  console.log(`  ✓ Archived "${name}"`);
  return true;
}

async function updateKalenderPage(id) {
  const response = await fetch(`https://builder.io/api/v1/write/page/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      data: {
        title: 'Kalender - Talentenraad Het Talentenhuis',
        url: '/kalender',
        blocks: [
          // Hero section
          {
            component: {
              name: 'Hero',
              options: {
                title: 'Kalender',
                subtitle: 'Alle activiteiten van de Talentenraad op een rijtje',
                backgroundImage: '',
                showButton: false,
              },
            },
          },
          // Full activities list with all details
          {
            component: {
              name: 'ActiviteitenList',
              options: {
                title: 'Komende Activiteiten',
                subtitle: 'Plan je agenda en mis geen enkele activiteit',
                limit: 20,
                showViewAll: false,
                showLocation: true,
                showDescription: true,
              },
            },
          },
          // CTA Banner
          {
            component: {
              name: 'CTABanner',
              options: {
                title: 'Activiteit gemist?',
                description: 'Bekijk foto\'s en verslagen van eerdere activiteiten op onze nieuwspagina.',
                buttonText: 'Bekijk nieuws',
                buttonLink: '/nieuws',
                variant: 'default',
              },
            },
          },
        ],
      },
      published: 'published',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`  ✗ Failed to update Kalender: ${error}`);
    return false;
  }

  console.log(`  ✓ Updated Kalender page`);
  return true;
}

async function main() {
  console.log('📄 Fetching all pages...\n');

  const pages = await getAllPages();

  console.log('Found pages:');
  pages.forEach(page => {
    console.log(`  - ${page.data?.url || 'no url'}: ${page.name}`);
  });

  // Find activiteiten page to archive
  const activiteitenPage = pages.find(p => p.data?.url === '/activiteiten');
  if (activiteitenPage) {
    console.log('\nArchiving /activiteiten page...');
    await archivePage(activiteitenPage.id, activiteitenPage.name);
  } else {
    console.log('\nNo /activiteiten page found.');
  }

  // Find and update kalender page
  const kalenderPage = pages.find(p => p.data?.url === '/kalender');
  if (kalenderPage) {
    console.log('\nUpdating /kalender page...');
    await updateKalenderPage(kalenderPage.id);
  } else {
    console.log('\nNo /kalender page found.');
  }

  console.log('\n✅ Done! Now the website has a single Kalender page.');
  console.log('Note: Update navigation links to point to /kalender instead of /activiteiten');
}

main().catch(console.error);
