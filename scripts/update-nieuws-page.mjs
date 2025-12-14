const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';

async function getPageId(url) {
  const response = await fetch(
    `https://cdn.builder.io/api/v3/content/page?apiKey=3706422a8e454ceebe64acdc5a1475ba&query.data.url=${url}`
  );
  const data = await response.json();
  return data.results?.[0]?.id;
}

const nieuwsPage = {
  content: {
    data: {
      title: 'Nieuws - Talentenraad',
      url: '/nieuws',
      blocks: [
        {
          component: {
            name: 'Hero',
            options: {
              title: 'Nieuws',
              subtitle: 'Blijf op de hoogte van al onze activiteiten en nieuwtjes',
              variant: 'centered',
              size: 'small',
            },
          },
        },
        {
          component: {
            name: 'NieuwsList',
            options: {
              title: 'Laatste nieuws en updates',
              subtitle: 'Hier vind je het laatste nieuws van de Talentenraad',
              limit: 10,
            },
          },
        },
        {
          component: {
            name: 'CTABanner',
            options: {
              title: 'Idee voor een nieuwsbericht?',
              subtitle: 'Heb je nieuws dat je wilt delen met de schoolgemeenschap? Neem contact met ons op!',
              buttonText: 'Contacteer ons',
              buttonLink: '/contact',
              variant: 'default',
            },
          },
        },
      ],
    },
  },
};

async function main() {
  console.log('📰 Updating Nieuws page...\n');

  const pageId = await getPageId('/nieuws');
  if (!pageId) {
    console.log('✗ Nieuws page not found');
    return;
  }

  const response = await fetch(`https://builder.io/api/v1/write/page/${pageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify(nieuwsPage.content),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`✗ Failed: ${error}`);
    return;
  }

  console.log('✓ Nieuws page updated with NieuwsList component');
}

main();
