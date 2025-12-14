const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const PAGE_ID = '49d6e26af47240288d6c73048a055a57';

const pageContent = {
  data: {
    title: 'Home - Talentenraad Het Talentenhuis',
    url: '/',
    blocks: [
      // Hero section
      {
        component: {
          name: 'Hero',
          options: {
            title: 'Welkom bij de Talentenraad',
            subtitle: 'De ouderraad van Het Talentenhuis - School met een hart voor ieder kind',
            backgroundImage: '',
            buttonText: 'Ontdek meer',
            buttonLink: '/over-ons',
            showButton: true,
          },
        },
      },
      // Introduction section with info cards
      {
        component: {
          name: 'InfoCard',
          options: {
            title: 'Samen Talentenhuis, Samen Talentenraad!',
            description: 'Via evenementen, sponsors en acties willen we samen school maken en ouders samenbrengen. Zo zamelen we geld in om schoolse activiteiten en projecten te ondersteunen en alle activiteiten toegankelijk te maken voor alle kinderen.',
            icon: 'heart',
            variant: 'pink',
          },
        },
      },
      // Dynamic activities from Builder.io
      {
        component: {
          name: 'ActiviteitenList',
          options: {
            title: 'Komende Activiteiten',
            subtitle: 'Mis geen enkele activiteit van de Talentenraad',
            limit: 4,
            showViewAll: true,
            viewAllLink: '/kalender',
            showLocation: false,
            showDescription: false,
          },
        },
      },
      // Dynamic news from Builder.io
      {
        component: {
          name: 'NieuwsList',
          options: {
            title: 'Laatste Nieuws',
            subtitle: 'Blijf op de hoogte van de Talentenraad',
            limit: 3,
          },
        },
      },
      // FAQ section
      {
        component: {
          name: 'FAQ',
          options: {
            title: 'Veelgestelde Vragen',
            subtitle: 'Vind snel antwoord op je vraag',
            showAskQuestion: true,
          },
        },
      },
      // CTA Banner
      {
        component: {
          name: 'CTABanner',
          options: {
            title: 'Wil je meehelpen?',
            description: 'De Talentenraad zoekt altijd enthousiaste ouders om mee te helpen bij activiteiten.',
            buttonText: 'Neem contact op',
            buttonLink: '/contact',
            variant: 'gradient',
          },
        },
      },
    ],
  },
};

async function updateHomepage() {
  try {
    console.log('Updating homepage with activities, news, and FAQ...');

    const response = await fetch(`https://builder.io/api/v1/write/page/${PAGE_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify(pageContent),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    console.log('\n✅ Homepage updated successfully!');
    console.log('\nDe homepage toont nu:');
    console.log('- Hero sectie');
    console.log('- Intro card');
    console.log('- Komende activiteiten');
    console.log('- Laatste nieuws');
    console.log('- Veelgestelde vragen');
    console.log('- CTA Banner');
  } catch (error) {
    console.error('Error updating homepage:', error.message);
  }
}

updateHomepage();
