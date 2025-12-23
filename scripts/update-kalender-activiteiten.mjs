const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';

const pages = [
  {
    id: '6ca6df27f75e45809a476809bcd8250f',
    name: 'Kalender',
    url: '/kalender',
    content: {
      data: {
        title: 'Kalender - Talentenraad',
        url: '/kalender',
        blocks: [
          {
            component: {
              name: 'Hero',
              options: {
                title: 'Kalender',
                subtitle: 'Alle komende activiteiten en evenementen van de Talentenraad',
                showButton: false,
              },
            },
          },
          {
            component: {
              name: 'ActiviteitenList',
              options: {
                title: 'Komende Activiteiten',
                subtitle: 'Hieronder vind je alle geplande activiteiten. Je kan activiteiten beheren in Builder.io.',
                limit: 20,
                showViewAll: false,
                showLocation: true,
                showDescription: true,
              },
            },
          },
          {
            component: {
              name: 'InfoCard',
              options: {
                title: 'Schoolkalender',
                description: 'Bekijk ook de volledige schoolkalender van Het Talentenhuis voor alle vakanties en vrije dagen.',
                icon: 'calendar',
                variant: 'default',
              },
            },
          },
          {
            component: {
              name: 'CTABanner',
              options: {
                title: 'Activiteit toevoegen?',
                subtitle: 'Ben je lid van de Talentenraad en wil je een activiteit toevoegen? Ga naar Builder.io om nieuwe activiteiten aan te maken.',
                buttonText: 'Naar Builder.io',
                buttonLink: 'https://builder.io/content?model=activiteit',
                variant: 'green',
              },
            },
          },
        ],
      },
    },
  },
  {
    id: '80c94d0f1ee248eb9efa09d741825858',
    name: 'Activiteiten',
    url: '/activiteiten',
    content: {
      data: {
        title: 'Activiteiten - Talentenraad',
        url: '/activiteiten',
        blocks: [
          {
            component: {
              name: 'Hero',
              options: {
                title: 'Onze Activiteiten',
                subtitle: 'Ontdek wat de Talentenraad allemaal organiseert voor de schoolgemeenschap',
                showButton: false,
              },
            },
          },
          {
            component: {
              name: 'InfoCard',
              options: {
                title: 'Wat doen wij?',
                description: 'De Talentenraad organiseert doorheen het schooljaar verschillende activiteiten voor kinderen en ouders. Van feestelijke evenementen tot gezellige samenzijn - er is voor elk wat wils!',
                icon: 'heart',
                variant: 'pink',
              },
            },
          },
          {
            component: {
              name: 'ActiviteitenList',
              options: {
                title: 'Komende Activiteiten',
                subtitle: 'Dit zijn de eerstvolgende evenementen op de planning',
                limit: 10,
                showViewAll: false,
                showLocation: true,
                showDescription: true,
              },
            },
          },
          {
            component: {
              name: 'InfoCard',
              options: {
                title: 'Jaarlijkse Hoogtepunten',
                description: 'Elk jaar organiseren we terugkerende evenementen zoals het schoolfeest, de Talentenfuif, carnaval, nieuwjaarsreceptie, en nog veel meer. Hou de kalender in de gaten!',
                icon: 'star',
                variant: 'orange',
              },
            },
          },
          {
            component: {
              name: 'CTABanner',
              options: {
                title: 'Ideeën voor activiteiten?',
                subtitle: 'Heb je suggesties voor leuke activiteiten? We horen graag van je!',
                buttonText: 'Contacteer ons',
                buttonLink: '/contact',
                variant: 'green',
              },
            },
          },
        ],
      },
    },
  },
];

async function updatePage(page) {
  try {
    console.log(`Updating ${page.name} page...`);

    const response = await fetch(`https://builder.io/api/v1/write/page/${page.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify(page.content),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    console.log(`  ✓ ${page.name} updated successfully!`);
  } catch (error) {
    console.error(`  ✗ Error updating ${page.name}:`, error.message);
  }
}

async function main() {
  console.log('Updating pages to use ActiviteitenList component...\n');

  for (const page of pages) {
    await updatePage(page);
  }

  console.log('\nDone! The pages now fetch activiteiten from the activiteit model.');
}

main();
