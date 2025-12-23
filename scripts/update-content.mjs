const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const PUBLIC_KEY = '3706422a8e454ceebe64acdc5a1475ba';

// Updated Over Ons page with correct info from Jo Vanheel
const overOnsPage = {
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
              title: 'De Talentenraad',
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
              subtitle: 'De Talentenraad engageert zich voor de school door verschillende activiteiten te organiseren. Met de opbrengst investeren we in onze kinderen: nieuwe boeken, speeltuigen, netten en ballen, stoelen en tafels, veiligheid, en we dragen bij aan schoolreizen en uitstapjes. Dit jaar hebben we een nieuw fietsparcours met materialen kunnen realiseren dankzij jullie steun!',
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
                {
                  name: 'Jo Vanheel',
                  role: 'Voorzitter',
                  description: 'Voorzitter sinds 2022. Papa van Julie en Feline. Beroepsmilitair en vrijwillig brandweerman/ambulancier bij Brandweerzone Oost-Limburg.',
                },
                {
                  name: 'Hanne Claesen',
                  role: 'Secretaris',
                  description: 'Zorgt voor verslaggeving en communicatie naar alle ouders.',
                },
                {
                  name: 'Sara Delsupehe',
                  role: 'Penningmeester',
                  description: 'Beheert de financiën en zorgt dat alles betaalbaar blijft.',
                },
              ],
            },
          },
        },
        {
          component: {
            name: 'Section',
            options: {
              title: 'Ons Team',
              subtitle: 'Naast het bestuur bestaat de Talentenraad uit een prachtig en sterk team van enthousiaste ouders die zich vrijwillig inzetten voor de schoolgemeenschap.',
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
              subtitle: 'Heb je interesse om de Talentenraad te komen ondersteunen? Geheel vrijblijvend, als lid of als helpende hand. Wij zijn er voor jullie, voor jullie kinderen maar ook voor de leerkrachten en de directeur!',
              buttonText: 'Neem contact op',
              buttonLink: '/contact',
              variant: 'accent',
            },
          },
        },
      ],
    },
  },
};

// Updated homepage with correct mission
const homePage = {
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
              subtitle: 'De ouderraad van Het Talentenhuis. Samen engageren we ons voor de school en investeren we in onze kinderen.',
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
                  title: 'Investeren in Kinderen',
                  description: 'Met de opbrengst investeren we in boeken, speeltuigen, veiligheid en schooluitstapjes.',
                },
                {
                  icon: 'users',
                  title: 'Verbinding',
                  description: 'Wij zijn er voor ouders, kinderen, leerkrachten én de directeur!',
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
              subtitle: 'Heb je ideeën, voorstellen of interesse om de Talentenraad te ondersteunen? Geheel vrijblijvend!',
              buttonText: 'Neem contact op',
              buttonLink: '/contact',
              variant: 'default',
            },
          },
        },
      ],
    },
  },
};

async function updatePage(name, pageData) {
  try {
    const response = await fetch(`https://builder.io/api/v1/write/page/${pageData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify(pageData.content),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    console.log(`✓ ${name} updated`);
  } catch (error) {
    console.log(`✗ ${name} failed: ${error.message}`);
  }
}

async function main() {
  console.log('📝 Updating pages with correct content...\n');

  await updatePage('Homepage', homePage);
  await updatePage('Over Ons', overOnsPage);

  console.log('\n✅ Done!');
}

main();
