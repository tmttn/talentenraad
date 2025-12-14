const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const PUBLIC_KEY = '3706422a8e454ceebe64acdc5a1475ba';

// Professional redesign of all pages
const pages = {
  // Homepage - clean, welcoming design
  home: {
    id: '49d6e26af47240288d6c73048a055a57',
    content: {
      data: {
        title: 'Home - Talentenraad Het Talentenhuis',
        url: '/',
        blocks: [
          {
            component: {
              name: 'Hero',
              options: {
                title: 'Welkom bij de Talentenraad',
                subtitle: 'De ouderraad van Het Talentenhuis. Samen maken we het schoolleven van onze kinderen nog mooier.',
                ctaText: 'Ontdek onze activiteiten',
                ctaLink: '/activiteiten',
                secondaryCtaText: 'Over ons',
                secondaryCtaLink: '/over-ons',
                variant: 'centered',
                size: 'large',
              },
            },
          },
          {
            component: {
              name: 'FeatureGrid',
              options: {
                title: 'Wat doen wij?',
                subtitle: 'Ontdek hoe de Talentenraad het verschil maakt voor onze schoolgemeenschap',
                columns: 3,
                features: [
                  {
                    icon: 'calendar',
                    title: 'Activiteiten',
                    description: 'Van schoolfeesten tot quiz-avonden: we organiseren leuke evenementen voor het hele gezin.',
                    link: '/activiteiten',
                  },
                  {
                    icon: 'money',
                    title: 'Fondsenwerving',
                    description: 'Door acties en sponsoring zamelen we geld in voor extra materiaal en schooluitstappen.',
                  },
                  {
                    icon: 'users',
                    title: 'Verbinding',
                    description: 'We bouwen bruggen tussen ouders, leerkrachten en de schooldirectie.',
                    link: '/over-ons',
                  },
                ],
              },
            },
          },
          {
            component: {
              name: 'ActiviteitenList',
              options: {
                title: 'Komende activiteiten',
                subtitle: 'Mis geen enkele activiteit van de Talentenraad',
                limit: 4,
                showViewAll: true,
                viewAllLink: '/kalender',
                showLocation: false,
                showDescription: false,
              },
            },
          },
          {
            component: {
              name: 'CTABanner',
              options: {
                title: 'Wil je meehelpen?',
                subtitle: 'Nieuwe ouders zijn altijd welkom bij de Talentenraad. Elk handje helpt!',
                buttonText: 'Neem contact op',
                buttonLink: '/contact',
                variant: 'default',
              },
            },
          },
        ],
      },
    },
  },

  // Activiteiten page
  activiteiten: {
    id: '80c94d0f1ee248eb9efa09d741825858',
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
                subtitle: 'Ontdek alle leuke evenementen die we organiseren voor de schoolgemeenschap',
                ctaText: 'Bekijk kalender',
                ctaLink: '/kalender',
                variant: 'centered',
                size: 'small',
              },
            },
          },
          {
            component: {
              name: 'ActiviteitenList',
              options: {
                title: 'Komende evenementen',
                subtitle: 'Hier vind je alle geplande activiteiten',
                limit: 10,
                showViewAll: false,
                showLocation: true,
                showDescription: true,
              },
            },
          },
          {
            component: {
              name: 'CTABanner',
              options: {
                title: 'Idee voor een activiteit?',
                subtitle: 'We staan altijd open voor leuke suggesties van ouders.',
                buttonText: 'Contacteer ons',
                buttonLink: '/contact',
                variant: 'light',
              },
            },
          },
        ],
      },
    },
  },

  // Kalender page
  kalender: {
    id: '6ca6df27f75e45809a476809bcd8250f',
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
                subtitle: 'Alle komende activiteiten en evenementen op een rij',
                variant: 'centered',
                size: 'small',
              },
            },
          },
          {
            component: {
              name: 'ActiviteitenList',
              options: {
                title: 'Volledige kalender',
                subtitle: 'Bekijk alle geplande activiteiten van de Talentenraad',
                limit: 20,
                showViewAll: false,
                showLocation: true,
                showDescription: true,
              },
            },
          },
        ],
      },
    },
  },

  // Over Ons page - clean team presentation
  overOns: {
    id: 'bd8e0243ed6a4fd19c3b54e93a82e493',
    content: {
      data: {
        title: 'Over Ons - Talentenraad',
        url: '/over-ons',
        blocks: [
          {
            component: {
              name: 'Hero',
              options: {
                title: 'Over de Talentenraad',
                subtitle: 'Samen met jullie op zoek naar nog meer kansen voor onze kinderen',
                variant: 'centered',
                size: 'small',
              },
            },
          },
          {
            component: {
              name: 'Section',
              options: {
                title: 'Onze Missie',
                subtitle: 'De Talentenraad vormt de brug tussen ouders en school. We organiseren activiteiten die de schoolgemeenschap samenbrengen en ondersteunen projecten die alle kinderen ten goede komen.',
                background: 'white',
                align: 'center',
                size: 'medium',
              },
            },
          },
          {
            component: {
              name: 'TeamGrid',
              options: {
                title: 'Het Bestuur',
                subtitle: 'Maak kennis met de mensen achter de Talentenraad',
                columns: 3,
                showDescription: true,
                members: [
                  {name: 'Jo Vanheel', role: 'Voorzitter', description: 'Coördineert de activiteiten en is aanspreekpunt voor ouders en school'},
                  {name: 'Hanne Claesen', role: 'Secretaris', description: 'Zorgt voor verslaggeving en communicatie naar alle ouders'},
                  {name: 'Sara Delsupehe', role: 'Penningmeester', description: 'Beheert de financiën en houdt alles betaalbaar'},
                ],
              },
            },
          },
          {
            component: {
              name: 'Section',
              options: {
                title: 'Onze Leden',
                subtitle: 'Naast het bestuur bestaat de Talentenraad uit een enthousiaste groep actieve ouders: Josje Bazelmans, Hannelore Boslak, Vanessa Dolce, Uschi Poesmans, Nele Ceyssens, Caroline Loos, Lore Bollen, Mina Chahouri en Tanja Gentier.',
                background: 'light',
                align: 'center',
                size: 'small',
              },
            },
          },
          {
            component: {
              name: 'CTABanner',
              options: {
                title: 'Word lid van de Talentenraad!',
                subtitle: 'Ben je ouder van een leerling? Je bent altijd welkom om mee te helpen.',
                buttonText: 'Neem contact op',
                buttonLink: '/contact',
                variant: 'accent',
              },
            },
          },
        ],
      },
    },
  },

  // Contact page
  contact: {
    id: null, // Will fetch ID
    content: {
      data: {
        title: 'Contact - Talentenraad',
        url: '/contact',
        blocks: [
          {
            component: {
              name: 'Hero',
              options: {
                title: 'Contact',
                subtitle: 'Heb je een vraag of wil je meehelpen? We horen graag van je!',
                variant: 'centered',
                size: 'small',
              },
            },
          },
          {
            component: {
              name: 'ContactForm',
              options: {},
            },
          },
        ],
      },
    },
  },

  // Nieuws page
  nieuws: {
    id: null, // Will fetch ID
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
              name: 'Section',
              options: {
                title: 'Laatste updates',
                subtitle: 'Hier vind je het laatste nieuws van de Talentenraad. Binnenkort meer!',
                background: 'light',
                align: 'center',
                size: 'large',
              },
            },
          },
          {
            component: {
              name: 'CTABanner',
              options: {
                title: 'Volg ons op sociale media',
                subtitle: 'Blijf op de hoogte via Facebook en Instagram',
                buttonText: 'Bekijk activiteiten',
                buttonLink: '/activiteiten',
                variant: 'default',
              },
            },
          },
        ],
      },
    },
  },
};

async function getPageId(url) {
  const response = await fetch(
    `https://cdn.builder.io/api/v3/content/page?apiKey=${PUBLIC_KEY}&query.data.url=${url}`
  );
  const data = await response.json();
  return data.results?.[0]?.id;
}

async function updatePage(pageKey, pageData) {
  let pageId = pageData.id;

  // Fetch page ID if not provided
  if (!pageId) {
    pageId = await getPageId(pageData.content.data.url);
    if (!pageId) {
      console.log(`  ✗ Page not found for ${pageData.content.data.url}`);
      return;
    }
  }

  try {
    const response = await fetch(`https://builder.io/api/v1/write/page/${pageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify(pageData.content),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    console.log(`  ✓ ${pageKey} updated`);
  } catch (error) {
    console.log(`  ✗ ${pageKey} failed: ${error.message}`);
  }
}

async function main() {
  console.log('🎨 Redesigning all pages with professional layout...\n');

  for (const [pageKey, pageData] of Object.entries(pages)) {
    console.log(`Updating ${pageKey}...`);
    await updatePage(pageKey, pageData);
  }

  console.log('\n✅ Done! Refresh the website to see the new design.');
}

main();
