// Add team members to the teamlid data model
const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';

const teamleden = [
  // Bestuur
  {
    naam: 'Jo Vanheel',
    rol: 'Voorzitter',
    beschrijving: 'Als voorzitter coördineer ik de activiteiten van de Talentenraad en fungeer als aanspreekpunt voor ouders en school.',
    categorie: 'bestuur',
    volgorde: 1,
    actief: true,
  },
  {
    naam: 'Hanne Claesen',
    rol: 'Secretaris',
    beschrijving: 'Ik zorg voor de verslaggeving van onze vergaderingen en de communicatie naar alle ouders.',
    categorie: 'bestuur',
    volgorde: 2,
    actief: true,
  },
  {
    naam: 'Sara Delsupehe',
    rol: 'Penningmeester',
    beschrijving: 'Als penningmeester beheer ik de financiën en zorg ik dat alle activiteiten betaalbaar blijven.',
    categorie: 'bestuur',
    volgorde: 3,
    actief: true,
  },
  // Leden
  {
    naam: 'Josje Bazelmans',
    rol: 'Lid',
    beschrijving: '',
    categorie: 'lid',
    volgorde: 10,
    actief: true,
  },
  {
    naam: 'Hannelore Boslak',
    rol: 'Lid',
    beschrijving: '',
    categorie: 'lid',
    volgorde: 11,
    actief: true,
  },
  {
    naam: 'Vanessa Dolce',
    rol: 'Lid',
    beschrijving: '',
    categorie: 'lid',
    volgorde: 12,
    actief: true,
  },
  {
    naam: 'Uschi Poesmans',
    rol: 'Lid',
    beschrijving: '',
    categorie: 'lid',
    volgorde: 13,
    actief: true,
  },
  {
    naam: 'Nele Ceyssens',
    rol: 'Lid',
    beschrijving: '',
    categorie: 'lid',
    volgorde: 14,
    actief: true,
  },
  {
    naam: 'Caroline Loos',
    rol: 'Lid',
    beschrijving: '',
    categorie: 'lid',
    volgorde: 15,
    actief: true,
  },
  {
    naam: 'Lore Bollen',
    rol: 'Lid',
    beschrijving: '',
    categorie: 'lid',
    volgorde: 16,
    actief: true,
  },
  {
    naam: 'Mina Chahouri',
    rol: 'Lid',
    beschrijving: '',
    categorie: 'lid',
    volgorde: 17,
    actief: true,
  },
  {
    naam: 'Tanja Gentier',
    rol: 'Lid',
    beschrijving: '',
    categorie: 'lid',
    volgorde: 18,
    actief: true,
  },
  // Helpers
  {
    naam: 'Danielle Cesari',
    rol: 'Helper',
    beschrijving: 'Helpt achter de schermen bij activiteiten',
    categorie: 'helper',
    volgorde: 20,
    actief: true,
  },
  {
    naam: 'Romina Ruggiero',
    rol: 'Helper',
    beschrijving: 'Helpt achter de schermen bij activiteiten',
    categorie: 'helper',
    volgorde: 21,
    actief: true,
  },
];

async function addTeamlid(teamlid) {
  const content = {
    data: teamlid,
    published: 'published',
    name: teamlid.naam,
  };

  try {
    const response = await fetch('https://builder.io/api/v1/write/teamlid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`  ✗ Failed to add ${teamlid.naam}: ${error.slice(0, 100)}`);
      return false;
    }

    console.log(`  ✓ Added ${teamlid.naam} (${teamlid.rol})`);
    return true;
  } catch (error) {
    console.log(`  ✗ Error adding ${teamlid.naam}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Adding team members to Builder.io teamlid model...\n');

  let added = 0;
  for (const teamlid of teamleden) {
    const success = await addTeamlid(teamlid);
    if (success) added++;
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Added ${added}/${teamleden.length} team members to Builder.io`);
  console.log('\nJe kunt nu teamleden beheren in Builder.io:');
  console.log('1. Ga naar https://builder.io/content?model=teamlid');
  console.log('2. Bewerk, voeg toe, of verwijder teamleden');
  console.log('3. De TeamGrid component haalt automatisch de data op');
}

main().catch(console.error);
