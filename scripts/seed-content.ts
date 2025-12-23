/**
 * Builder.io Content Seed Script
 * Run with: npx ts-node scripts/seed-content.ts
 */

const BUILDER_PRIVATE_API_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const BUILDER_PUBLIC_API_KEY = '3706422a8e454ceebe64acdc5a1475ba';

interface BuilderBlock {
  '@type': string;
  component?: {
    name: string;
    options: Record<string, unknown>;
  };
  responsiveStyles?: Record<string, Record<string, string>>;
  children?: BuilderBlock[];
}

interface PageContent {
  name: string;
  data: {
    title: string;
    url: string;
    blocks: BuilderBlock[];
  };
  published: 'published' | 'draft';
}

async function createPage(page: PageContent): Promise<void> {
  const response = await fetch('https://builder.io/api/v1/write/page', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BUILDER_PRIVATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(page),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create page ${page.name}: ${error}`);
  }

  console.log(`✅ Created page: ${page.name}`);
}

// Homepage Content
const homepage: PageContent = {
  name: 'Home',
  data: {
    title: 'Talentenraad - Ouderraad Het Talentenhuis',
    url: '/',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Hero',
          options: {
            title: 'Welkom bij de Talentenraad',
            subtitle: 'De ouderraad van Het Talentenhuis - School met een hart voor ieder kind',
            ctaText: 'Ontdek onze activiteiten',
            ctaLink: '/activiteiten',
            overlay: true,
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            paddingTop: '80px',
            paddingBottom: '80px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#ffffff',
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                textAlign: 'center',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'Text',
                  options: {
                    text: '<h2 style="font-size: 2.5rem; font-weight: bold; color: #1f2937; margin-bottom: 1rem;">Onze Missie</h2>',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'Text',
                  options: {
                    text: '<p style="font-size: 1.25rem; color: #4b5563; max-width: 800px; margin: 0 auto 3rem;">Samen met de school werken we aan een leuke, uitdagende en veilige leeromgeving voor alle kinderen. We organiseren activiteiten, ondersteunen schoolprojecten en zorgen voor verbinding tussen ouders, leerkrachten en kinderen.</p>',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            paddingTop: '40px',
            paddingBottom: '80px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#f9fafb',
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'InfoCard',
                  options: {
                    title: 'Activiteiten',
                    description: 'Van schoolfeesten tot quiz-avonden: we organiseren leuke evenementen voor het hele gezin.',
                    icon: 'calendar',
                    link: '/activiteiten',
                    linkText: 'Bekijk activiteiten',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'InfoCard',
                  options: {
                    title: 'Fondsenwerving',
                    description: 'Door acties en sponsoring zamelen we geld in voor extra materiaal en uitstappen.',
                    icon: 'money',
                    link: '/acties',
                    linkText: 'Onze acties',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'InfoCard',
                  options: {
                    title: 'Verbinding',
                    description: 'We bouwen bruggen tussen ouders, leerkrachten en de schooldirectie.',
                    icon: 'users',
                    link: '/over-ons',
                    linkText: 'Leer ons kennen',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'CalendarSection',
          options: {
            title: 'Komende Activiteiten',
            subtitle: 'Mis geen enkele activiteit van de Talentenraad',
            events: [
              {date: '2025-01-25', title: 'Nieuwjaarsdrink', time: '11:00 - 13:00'},
              {date: '2025-02-14', title: 'Valentijnsactie', time: 'Hele dag'},
              {date: '2025-03-08', title: 'Pannenkoekendag', time: '10:00 - 14:00'},
              {date: '2025-04-12', title: 'Paasontbijt', time: '09:00 - 11:30'},
              {date: '2025-05-11', title: 'Moederdag Ontbijt', time: '09:00 - 12:00'},
            ],
            showViewAll: true,
            viewAllLink: '/kalender',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'CTABanner',
          options: {
            title: 'Word lid van de Talentenraad!',
            subtitle: 'Heb je zin om mee te helpen? Alle hulp is welkom, groot of klein. Samen maken we er iets moois van!',
            buttonText: 'Neem contact op',
            buttonLink: '/contact',
            variant: 'gradient',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            paddingTop: '80px',
            paddingBottom: '80px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#ffffff',
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                textAlign: 'center',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'Text',
                  options: {
                    text: '<h2 style="font-size: 2rem; font-weight: bold; color: #1f2937; margin-bottom: 1rem;">Over Het Talentenhuis</h2>',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'Text',
                  options: {
                    text: '<p style="font-size: 1.1rem; color: #4b5563; max-width: 700px; margin: 0 auto 1.5rem;">Het Talentenhuis is een basisschool in Bilzen-Hoeselt met een hart voor ieder kind. De school biedt een warme, uitdagende leeromgeving waar elk kind zijn talenten kan ontdekken en ontwikkelen.</p>',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'Text',
                  options: {
                    text: '<p style="color: #6b7280;"><strong>Adres:</strong> Zonhoevestraat 32, 3740 Bilzen-Hoeselt<br/><strong>Tel:</strong> 089/41 54 07<br/><strong>Website:</strong> <a href="https://talentenhuis.be" style="color: #ea247b;">talentenhuis.be</a></p>',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  published: 'published',
};

// Activiteiten Page
const activiteitenPage: PageContent = {
  name: 'Activiteiten',
  data: {
    title: 'Activiteiten - Talentenraad',
    url: '/activiteiten',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Hero',
          options: {
            title: 'Onze Activiteiten',
            subtitle: 'Ontdek alle leuke evenementen die we organiseren',
            ctaText: 'Bekijk kalender',
            ctaLink: '/kalender',
            overlay: true,
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            paddingTop: '60px',
            paddingBottom: '60px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#f9fafb',
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                textAlign: 'center',
                marginBottom: '3rem',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'Text',
                  options: {
                    text: '<h2 style="font-size: 2rem; font-weight: bold; color: #1f2937;">Jaarlijkse Hoogtepunten</h2><p style="color: #6b7280; margin-top: 0.5rem;">Deze activiteiten keren elk jaar terug</p>',
                  },
                },
              },
            ],
          },
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'EventCard',
                  options: {
                    title: 'Moederdag Ontbijt',
                    date: 'Mei',
                    time: '09:00 - 12:00',
                    location: 'Het Talentenhuis',
                    description: 'Een heerlijk ontbijt voor alle mama\'s en oma\'s. De kinderen verwennen hun mama met zelfgemaakte cadeautjes en lekkernijen.',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'EventCard',
                  options: {
                    title: 'Vaderdag BBQ',
                    date: 'Juni',
                    time: '11:00 - 15:00',
                    location: 'Schoolplein',
                    description: 'Gezellige barbecue voor alle papa\'s en opa\'s. Met spelletjes, muziek en natuurlijk heerlijk eten van de grill.',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'EventCard',
                  options: {
                    title: 'Schoolfeest',
                    date: 'September',
                    time: '14:00 - 22:00',
                    location: 'Het Talentenhuis',
                    description: 'Het jaarlijkse schoolfeest met optredens, spelletjes, eten en drinken. Een feest voor jong en oud!',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'EventCard',
                  options: {
                    title: 'Sint op School',
                    date: 'December',
                    time: '13:30 - 16:00',
                    location: 'Het Talentenhuis',
                    description: 'De Sint bezoekt alle klassen en deelt snoepgoed uit. Een magisch moment voor alle kinderen!',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'EventCard',
                  options: {
                    title: 'Kerstmarkt',
                    date: 'December',
                    time: '16:00 - 20:00',
                    location: 'Schoolplein',
                    description: 'Gezellige kerstmarkt met kraampjes, glühwein, warme chocomelk en kerstmuziek. Perfecte sfeer voor de feestdagen!',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'EventCard',
                  options: {
                    title: 'Pannenkoekendag',
                    date: 'Maart',
                    time: '10:00 - 14:00',
                    location: 'Refter',
                    description: 'Onbeperkt pannenkoeken eten! Met diverse toppings van suiker tot ijs. Een favoriet bij groot en klein.',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'CTABanner',
          options: {
            title: 'Wil je helpen bij een activiteit?',
            subtitle: 'We zijn altijd op zoek naar enthousiaste ouders die willen meehelpen. Elk handje helpt!',
            buttonText: 'Meld je aan',
            buttonLink: '/contact',
            variant: 'primary',
          },
        },
      },
    ],
  },
  published: 'published',
};

// Over Ons Page
const overOnsPage: PageContent = {
  name: 'Over Ons',
  data: {
    title: 'Over Ons - Talentenraad',
    url: '/over-ons',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Hero',
          options: {
            title: 'Over de Talentenraad',
            subtitle: 'Maak kennis met ons enthousiaste team',
            overlay: true,
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            paddingTop: '80px',
            paddingBottom: '40px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#ffffff',
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '800px',
                marginLeft: 'auto',
                marginRight: 'auto',
                textAlign: 'center',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'Text',
                  options: {
                    text: '<h2 style="font-size: 2rem; font-weight: bold; color: #1f2937; margin-bottom: 1.5rem;">Wie zijn wij?</h2><p style="font-size: 1.1rem; color: #4b5563; line-height: 1.8;">De Talentenraad is de ouderraad van basisschool Het Talentenhuis in Bilzen-Hoeselt. Wij zijn een groep enthousiaste ouders die zich vrijwillig inzetten om het schoolleven van onze kinderen nog leuker te maken.</p><p style="font-size: 1.1rem; color: #4b5563; line-height: 1.8; margin-top: 1rem;">Samen met de school organiseren we activiteiten, zamelen we fondsen in voor extra materiaal en uitstappen, en zorgen we voor een goede communicatie tussen ouders en school.</p>',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            paddingTop: '40px',
            paddingBottom: '80px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#ffffff',
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                textAlign: 'center',
                marginBottom: '3rem',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'Text',
                  options: {
                    text: '<h2 style="font-size: 2rem; font-weight: bold; color: #1f2937;">Ons Team</h2>',
                  },
                },
              },
            ],
          },
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '2rem',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'TeamMember',
                  options: {
                    name: 'Sarah Janssen',
                    role: 'Voorzitter',
                    description: 'Mama van Lotte (3e leerjaar) en Tim (1e leerjaar)',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'TeamMember',
                  options: {
                    name: 'Peter Willems',
                    role: 'Ondervoorzitter',
                    description: 'Papa van Emma (5e leerjaar)',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'TeamMember',
                  options: {
                    name: 'Linda Maes',
                    role: 'Secretaris',
                    description: 'Mama van Noah (2e kleuterklas)',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'TeamMember',
                  options: {
                    name: 'Kris Peeters',
                    role: 'Penningmeester',
                    description: 'Papa van Mila (4e leerjaar) en Lucas (1e kleuterklas)',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            paddingTop: '60px',
            paddingBottom: '60px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#f9fafb',
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                textAlign: 'center',
                marginBottom: '3rem',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'Text',
                  options: {
                    text: '<h2 style="font-size: 2rem; font-weight: bold; color: #1f2937;">Wat doen wij?</h2>',
                  },
                },
              },
            ],
          },
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'InfoCard',
                  options: {
                    title: 'Evenementen organiseren',
                    description: 'Van schoolfeesten tot quiz-avonden, van moederdag ontbijt tot kerstmarkten.',
                    icon: 'star',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'InfoCard',
                  options: {
                    title: 'Fondsen werven',
                    description: 'Door verkoop van wafels, kaarten en andere acties zamelen we geld in.',
                    icon: 'gift',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'InfoCard',
                  options: {
                    title: 'School ondersteunen',
                    description: 'We financieren extra materiaal, uitstappen en speciale projecten.',
                    icon: 'school',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'CTABanner',
          options: {
            title: 'Zin om mee te doen?',
            subtitle: 'De Talentenraad is altijd op zoek naar nieuwe leden. Je hoeft niet bij elke activiteit aanwezig te zijn - elke hulp is welkom!',
            buttonText: 'Word lid',
            buttonLink: '/contact',
            variant: 'secondary',
          },
        },
      },
    ],
  },
  published: 'published',
};

// Contact Page
const contactPage: PageContent = {
  name: 'Contact',
  data: {
    title: 'Contact - Talentenraad',
    url: '/contact',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Hero',
          options: {
            title: 'Contacteer Ons',
            subtitle: 'Heb je een vraag of wil je meehelpen? We horen graag van je!',
            overlay: true,
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            paddingTop: '60px',
            paddingBottom: '60px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#ffffff',
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                alignItems: 'start',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                children: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    component: {
                      name: 'Text',
                      options: {
                        text: '<h2 style="font-size: 1.75rem; font-weight: bold; color: #1f2937; margin-bottom: 1.5rem;">Neem contact op</h2><p style="color: #4b5563; line-height: 1.8; margin-bottom: 2rem;">Heb je vragen over onze activiteiten? Wil je lid worden van de ouderraad? Of heb je een leuk idee voor een evenement? Stuur ons gerust een berichtje!</p>',
                      },
                    },
                  },
                  {
                    '@type': '@builder.io/sdk:Element',
                    component: {
                      name: 'Text',
                      options: {
                        text: '<div style="background: #f9fafb; padding: 1.5rem; border-radius: 1rem; margin-bottom: 1rem;"><h3 style="font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">📍 Adres</h3><p style="color: #4b5563;">Het Talentenhuis<br/>Zonhoevestraat 32<br/>3740 Bilzen-Hoeselt</p></div>',
                      },
                    },
                  },
                  {
                    '@type': '@builder.io/sdk:Element',
                    component: {
                      name: 'Text',
                      options: {
                        text: '<div style="background: #f9fafb; padding: 1.5rem; border-radius: 1rem; margin-bottom: 1rem;"><h3 style="font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">📧 E-mail</h3><p style="color: #4b5563;">talentenraad@talentenhuis.be</p></div>',
                      },
                    },
                  },
                  {
                    '@type': '@builder.io/sdk:Element',
                    component: {
                      name: 'Text',
                      options: {
                        text: '<div style="background: #f9fafb; padding: 1.5rem; border-radius: 1rem;"><h3 style="font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">📱 Volg ons</h3><p style="color: #4b5563;">Facebook: @talentenhuis<br/>Instagram: @talentenhuis</p></div>',
                      },
                    },
                  },
                ],
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'ContactForm',
                  options: {
                    title: 'Stuur ons een bericht',
                    subtitle: '',
                    showPhone: true,
                    showSubject: true,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  published: 'published',
};

// Nieuws Page
const nieuwsPage: PageContent = {
  name: 'Nieuws',
  data: {
    title: 'Nieuws - Talentenraad',
    url: '/nieuws',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Hero',
          options: {
            title: 'Nieuws',
            subtitle: 'Blijf op de hoogte van al onze activiteiten en nieuwtjes',
            overlay: true,
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            paddingTop: '60px',
            paddingBottom: '60px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#f9fafb',
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            responsiveStyles: {
              large: {
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'NewsCard',
                  options: {
                    title: 'Succesvolle Kerstmarkt 2024',
                    date: '22 december 2024',
                    excerpt: 'De kerstmarkt was weer een groot succes! Dankzij jullie steun hebben we €1.500 opgehaald voor nieuwe speeltoestellen.',
                    category: 'Verslag',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'NewsCard',
                  options: {
                    title: 'Nieuwjaarsdrink 25 januari',
                    date: '10 januari 2025',
                    excerpt: 'Start het nieuwe jaar gezellig met de Talentenraad! Iedereen is welkom voor een drankje en hapje.',
                    category: 'Aankondiging',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'NewsCard',
                  options: {
                    title: 'Nieuwe speeltoestellen geplaatst',
                    date: '5 januari 2025',
                    excerpt: 'Dankzij de opbrengst van onze acties konden we nieuwe klimtoestellen laten plaatsen op de speelplaats.',
                    category: 'Nieuws',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'NewsCard',
                  options: {
                    title: 'Terugblik Sint op School',
                    date: '8 december 2024',
                    excerpt: 'De Sint en zijn Pieten bezochten alle klassen. De kinderen genoten volop van de snoepjes en cadeautjes!',
                    category: 'Verslag',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'NewsCard',
                  options: {
                    title: 'Wafelbakactie - Bestel nu!',
                    date: '1 december 2024',
                    excerpt: 'Onze jaarlijkse wafelbakactie is gestart. Bestel heerlijke verse wafels en steun de school!',
                    category: 'Activiteit',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'NewsCard',
                  options: {
                    title: 'Nieuwe leden gezocht',
                    date: '15 november 2024',
                    excerpt: 'De Talentenraad zoekt versterking! Ben jij een enthousiaste ouder die wil meehelpen?',
                    category: 'Aankondiging',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  published: 'published',
};

// Kalender Page
const kalenderPage: PageContent = {
  name: 'Kalender',
  data: {
    title: 'Kalender - Talentenraad',
    url: '/kalender',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Hero',
          options: {
            title: 'Kalender 2025',
            subtitle: 'Alle activiteiten en evenementen op een rij',
            overlay: true,
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'CalendarSection',
          options: {
            title: 'Komende Activiteiten',
            subtitle: 'Noteer deze data alvast in je agenda!',
            events: [
              {date: '2025-01-25', title: 'Nieuwjaarsdrink', time: '11:00 - 13:00'},
              {date: '2025-02-14', title: 'Valentijnsactie - Rozenverkoop', time: 'Hele dag'},
              {date: '2025-02-28', title: 'Carnavalsfeest', time: '13:30 - 16:00'},
              {date: '2025-03-08', title: 'Pannenkoekendag', time: '10:00 - 14:00'},
              {date: '2025-04-05', title: 'Paaseitjes zoeken', time: '10:00 - 12:00'},
              {date: '2025-04-12', title: 'Paasontbijt', time: '09:00 - 11:30'},
              {date: '2025-05-11', title: 'Moederdag Ontbijt', time: '09:00 - 12:00'},
              {date: '2025-06-08', title: 'Vaderdag BBQ', time: '11:00 - 15:00'},
              {date: '2025-06-28', title: 'Schoolfeest', time: '14:00 - 22:00'},
              {date: '2025-09-06', title: 'Startfeest nieuw schooljaar', time: '10:00 - 13:00'},
              {date: '2025-10-31', title: 'Halloween Party', time: '18:00 - 21:00'},
              {date: '2025-12-05', title: 'Sint op school', time: '13:30 - 16:00'},
              {date: '2025-12-20', title: 'Kerstmarkt', time: '16:00 - 20:00'},
            ],
            showViewAll: false,
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'CTABanner',
          options: {
            title: 'Wil je op de hoogte blijven?',
            subtitle: 'Volg ons op sociale media voor de laatste updates en foto\'s van onze activiteiten.',
            buttonText: 'Volg ons op Facebook',
            buttonLink: 'https://facebook.com/talentenhuis',
            variant: 'primary',
          },
        },
      },
    ],
  },
  published: 'published',
};

async function seedContent(): Promise<void> {
  console.log('🚀 Starting Builder.io content seed...\n');

  const pages = [
    homepage,
    activiteitenPage,
    overOnsPage,
    contactPage,
    nieuwsPage,
    kalenderPage,
  ];

  for (const page of pages) {
    try {
      await createPage(page);
    } catch (error) {
      console.error(`❌ Error creating ${page.name}:`, error);
    }
  }

  console.log('\n✨ Content seeding complete!');
  console.log('📝 Go to builder.io to review and publish your pages.');
}

seedContent();
