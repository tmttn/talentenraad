const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const PAGE_ID = 'bd8e0243ed6a4fd19c3b54e93a82e493';

// Real team members from talentenhuis.be/praktische-info/ouderraad/
const teamMembers = [
  {
    component: {
      name: 'TeamMember',
      options: {
        name: 'Jo Vanheel',
        role: 'Voorzitter',
        description: 'Als voorzitter coördineer ik de activiteiten van de Talentenraad en fungeer als aanspreekpunt voor ouders en school.',
      },
    },
  },
  {
    component: {
      name: 'TeamMember',
      options: {
        name: 'Hanne Claesen',
        role: 'Secretaris',
        description: 'Ik zorg voor de verslaggeving van onze vergaderingen en de communicatie naar alle ouders.',
      },
    },
  },
  {
    component: {
      name: 'TeamMember',
      options: {
        name: 'Sara Delsupehe',
        role: 'Penningmeester',
        description: 'Als penningmeester beheer ik de financiën en zorg ik dat alle activiteiten betaalbaar blijven.',
      },
    },
  },
];

const otherMembers = [
  'Josje Bazelmans',
  'Hannelore Boslak',
  'Vanessa Dolce',
  'Uschi Poesmans',
  'Nele Ceyssens',
  'Caroline Loos',
  'Lore Bollen',
  'Mina Chahouri',
  'Tanja Gentier',
];

const behindTheScenes = [
  'Danielle Cesari',
  'Romina Ruggiero',
];

const pageContent = {
  data: {
    title: 'Over Ons - Talentenraad',
    url: '/over-ons',
    blocks: [
      // Hero section
      {
        component: {
          name: 'Hero',
          options: {
            title: 'De Talentenraad',
            subtitle: 'Samen met jullie op zoek gaan naar nog meer kansen voor onze kinderen',
            showButton: false,
          },
        },
      },
      // Mission section
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Core:Section',
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            tagName: 'div',
            properties: {
              className: 'max-w-4xl mx-auto px-6 py-16',
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                tagName: 'h2',
                properties: {
                  className: 'text-3xl font-bold text-gray-800 mb-6 text-center',
                },
                component: {
                  name: 'Text',
                  options: {
                    text: 'Onze Missie',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                tagName: 'p',
                properties: {
                  className: 'text-gray-600 text-lg text-center mb-8',
                },
                component: {
                  name: 'Text',
                  options: {
                    text: 'De Talentenraad vormt de brug tussen ouders en school. We organiseren activiteiten die de schoolgemeenschap samenbrengen en ondersteunen projecten die alle kinderen ten goede komen. Via evenementen, sponsors en acties willen we samen school maken en ouders samenbrengen.',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                tagName: 'p',
                properties: {
                  className: 'text-[#ea247b] font-semibold text-xl text-center',
                },
                component: {
                  name: 'Text',
                  options: {
                    text: '"Samen Talentenhuis, samen Talentenraad!"',
                  },
                },
              },
            ],
          },
        ],
      },
      // Core team - Board members
      {
        component: {
          name: 'InfoCard',
          options: {
            title: 'Het Bestuur',
            description: 'Het dagelijks bestuur van de Talentenraad bestaat uit de voorzitter, secretaris en penningmeester.',
            icon: 'team',
            variant: 'pink',
          },
        },
      },
      // Team members grid
      ...teamMembers,
      // Other members section
      {
        component: {
          name: 'InfoCard',
          options: {
            title: 'Onze Leden',
            description: `Naast het bestuur bestaat de Talentenraad uit een enthousiaste groep actieve ouders:\n\n${otherMembers.join(', ')}`,
            icon: 'heart',
            variant: 'green',
          },
        },
      },
      // Behind the scenes
      {
        component: {
          name: 'InfoCard',
          options: {
            title: 'Achter de Schermen',
            description: `Ook achter de schermen krijgen we hulp van: ${behindTheScenes.join(' en ')}`,
            icon: 'star',
            variant: 'orange',
          },
        },
      },
      // Contact CTA
      {
        component: {
          name: 'CTABanner',
          options: {
            title: 'Wil je meehelpen?',
            subtitle: 'Nieuwe ouders zijn altijd welkom bij de Talentenraad. Neem gerust contact met ons op!',
            buttonText: 'Neem contact op',
            buttonLink: '/contact',
            variant: 'pink',
          },
        },
      },
      // Contact info
      {
        component: {
          name: 'InfoCard',
          options: {
            title: 'Contact',
            description: 'Je kan ons bereiken via e-mail:\nvoorzitterouderraad@talentenhuis.be\n\nOf spreek ons gerust aan op school!',
            icon: 'email',
            variant: 'default',
          },
        },
      },
    ],
  },
};

async function updatePage() {
  try {
    console.log('Updating Over Ons page with real team data...');

    const response = await fetch(`https://builder.io/api/v1/write/page/${PAGE_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify(pageContent),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('Page updated successfully!');
    console.log('Updated page ID:', result.id);
  } catch (error) {
    console.error('Error updating page:', error.message);
  }
}

updatePage();
