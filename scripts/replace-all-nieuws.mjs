const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';
const PUBLIC_KEY = '3706422a8e454ceebe64acdc5a1475ba';

// The new nieuws item to add
const nieuwsItem = {
  titel: 'Kennismaking met de Talentenraad',
  datum: new Date().toISOString().split('T')[0], // Today's date
  samenvatting: 'Maak kennis met Jo Vanheel, voorzitter van de Talentenraad sinds 2022, en het team dat zich inzet voor onze schoolgemeenschap.',
  vastgepind: true,
  volgorde: 1,
  inhoud: `
<p>Beste Ouders,</p>

<p>Mijn naam is <strong>Vanheel Jo</strong>, ik ben sinds 2022 voorzitter van de "Talentenraad" (Ouderraad), samen met een prachtig en sterk team van 8 dames en 1 heer! <strong>Hanne Claesen</strong> is onze secretaris en <strong>Sara Delsuphe</strong> is onze penningmeester.</p>

<p>Ik ben trotse papa van Julie (3de lj.) en Feline (1ste lj.) en gelukkig getrouwd met Antje Tomsin. In het dagelijkse leven ben ik beroepsmilitair te Leopoldsburg en vrijwillige brandweerman/ambulancier bij Brandweerzone Oost-Limburg (Hoeselt en Bilzen).</p>

<h3>Wat doen wij?</h3>

<p>Wij proberen ons te engageren voor de school door o.a. verschillende activiteiten te organiseren om dan, met de opbrengst, te investeren in onze kinderen. Dit kan bv. zijn:</p>
<ul>
  <li>Nieuwe boeken</li>
  <li>Speeltuigen</li>
  <li>Netten en ballen</li>
  <li>Stoelen en tafels</li>
  <li>Veiligheid</li>
</ul>
<p>...of we proberen mee bij te dragen in kosten van bepaalde schoolreizen/uitstapjes.</p>

<p><strong>Dit jaar hebben we een nieuw fietsparcours met materialen kunnen realiseren dankzij jullie!</strong></p>

<h3>Contact</h3>

<p>Heb je ideeën of voorstellen, zit je met iets of heb je een probleem met iets of iemand, aarzel zeker niet om ons aan te spreken of een mail te sturen naar: <a href="mailto:voorzitterouderraad@talentenhuis.be">voorzitterouderraad@talentenhuis.be</a></p>

<p>Heb je interesse om de Talentenraad te komen ondersteunen, geheel vrijblijvend, als lid of als helpende hand, mag je steeds contact met mij opnemen.</p>

<p><strong>Wij zijn er voor jullie, voor jullie kinderen maar ook voor de leerkrachten en de directeur!</strong></p>

<p>Mvg,<br>
Team Talentenraad</p>
`.trim(),
};

async function getAllNieuws() {
  console.log('Fetching all existing nieuws items...\n');

  const url = new URL('https://cdn.builder.io/api/v3/content/nieuws');
  url.searchParams.set('apiKey', PUBLIC_KEY);
  url.searchParams.set('limit', '100');

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.results || [];
}

async function deleteNieuwsItem(id, title) {
  const response = await fetch(`https://builder.io/api/v1/write/nieuws/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${PRIVATE_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`  X Failed to delete "${title}": ${error}`);
    return false;
  }

  console.log(`  Deleted: "${title}"`);
  return true;
}

async function addNieuwsItem(item) {
  const response = await fetch('https://builder.io/api/v1/write/nieuws', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      name: item.titel,
      published: 'published',
      data: item,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`  X Failed to add "${item.titel}": ${error}`);
    return false;
  }

  console.log(`  Added: "${item.titel}"`);
  return true;
}

async function main() {
  // Step 1: Get all existing nieuws
  const existingNieuws = await getAllNieuws();
  console.log(`Found ${existingNieuws.length} existing nieuws items.\n`);

  // Step 2: Delete all existing nieuws
  if (existingNieuws.length > 0) {
    console.log('Deleting all existing nieuws items...\n');
    for (const item of existingNieuws) {
      await deleteNieuwsItem(item.id, item.data?.titel || item.name);
    }
    console.log('');
  }

  // Step 3: Add the new nieuws item
  console.log('Adding new nieuws item...\n');
  await addNieuwsItem(nieuwsItem);

  console.log('\nDone! All nieuws replaced with the new Talentenraad introduction.');
}

main();
