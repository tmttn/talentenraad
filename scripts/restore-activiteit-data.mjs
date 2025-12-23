// Script to restore activity data that was accidentally overwritten
// This script will restore the original data and properly add samenvatting/inhoud
// Run with: node scripts/restore-activiteit-data.mjs

const privateKey = process.env.BUILDER_PRIVATE_KEY ?? 'bpk-4537158022f148049234c9ffbe759373';

// Original activity data (reconstructed from what we know)
const activitiesToRestore = [
  {
    id: 'd1dda782c47d4cf4a9a11c6099d9564b',
    data: {
      titel: 'Kerstoptreden & Kerstinstuif 2024',
      datum: '2024-12-20',
      tijd: '18:00 - 20:00',
      locatie: 'Beversheem',
      categorie: 'feest',
      samenvatting: 'Na het kerstoptreden van de lagere school organiseert de Talentenraad een gezellige Kerstinstuif met hapjes en drankjes in een gezellig decor. Iedereen is welkom!',
      inhoud: '<p>Na het kerstoptreden van de lagere school organiseert de Talentenraad een gezellige Kerstinstuif met hapjes en drankjes in een gezellig decor.</p><p>Iedereen is welkom!</p>',
    },
  },
  {
    id: '94f48b9e3c8b4924a5f19b8e2f0b4a67',
    data: {
      titel: 'Talentenfuif 2025',
      datum: '2025-02-07',
      tijd: '19:00 - 23:00',
      locatie: 'Beversheem',
      categorie: 'feest',
      samenvatting: 'De Talentenraad organiseert de Talentenfuif! **Datum:** vrijdag 7 februari 2025. Meer info volgt binnenkort!',
      inhoud: '<p>De Talentenraad organiseert de Talentenfuif!</p><p><strong>Datum:</strong> vrijdag 7 februari 2025</p><p>Meer info volgt binnenkort!</p>',
    },
  },
  {
    id: '17bec35730f54206a0998609703cf187',
    data: {
      titel: 'Moederdag Ontbijtmanden 2025',
      datum: '2025-05-11',
      categorie: 'activiteit',
      samenvatting: 'Verras jij graag je mama, oma, meter,... om haar Moederdag extra speciaal te maken? Bestel dan een ontbijtmand bij de Talentenraad!',
      inhoud: '<p>Verras jij graag je mama, oma, meter,... om haar Moederdag extra speciaal te maken? Bestel dan een ontbijtmand bij de Talentenraad!</p>',
    },
  },
  {
    id: '244390a0495c4ea1893bf737fa0886b0',
    data: {
      titel: 'Kerstspel en Kerstinstuif 2025',
      datum: '2025-12-19',
      tijd: '18:00 - 21:00',
      locatie: 'Beversheem',
      categorie: 'feest',
      samenvatting: 'Op 19 december zetten we het Beversheem op stelten met een fantastisch Kerstspel, gevolgd door een gezellige Kerstinstuif!',
      inhoud: '<p>Op 19 december zetten we het Beversheem op stelten met een fantastisch Kerstspel, gevolgd door een gezellige Kerstinstuif!</p>',
    },
  },
];

async function restoreActivity(activity) {
  console.log(`Restoring: ${activity.data.titel}`);

  const response = await fetch(`https://builder.io/api/v1/write/activiteit/${activity.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${privateKey}`,
    },
    body: JSON.stringify({
      data: activity.data,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to restore activity ${activity.id}: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function main() {
  console.log('Restoring activity data...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const activity of activitiesToRestore) {
    try {
      await restoreActivity(activity);
      console.log(`  ✓ Restored: ${activity.data.titel}\n`);
      successCount++;
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('\n--- Restore Complete ---');
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errorCount}`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
