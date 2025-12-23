import {config} from 'dotenv';

config();

const PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('Error: BUILDER_PRIVATE_KEY not found in .env');
  process.exit(1);
}

async function deleteModel(modelName) {
  console.log(`Deleting model: ${modelName}...`);

  // First, get the model ID
  const getQuery = `
		query {
			models {
				id
				name
			}
		}
	`;

  try {
    const getResponse = await fetch('https://builder.io/api/v2/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify({query: getQuery}),
    });

    const getResult = await getResponse.json();
    const model = getResult.data?.models?.find(m => m.name === modelName);

    if (!model) {
      console.log(`  Model "${modelName}" not found - nothing to delete`);
      return;
    }

    // Delete the model
    const deleteQuery = `
			mutation DeleteModel($id: String!) {
				deleteModel(id: $id) {
					id
					name
				}
			}
		`;

    const deleteResponse = await fetch('https://builder.io/api/v2/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        query: deleteQuery,
        variables: {id: model.id},
      }),
    });

    const deleteResult = await deleteResponse.json();

    if (deleteResult.errors) {
      console.error(`  ✗ Failed to delete: ${deleteResult.errors[0]?.message}`);
      return;
    }

    console.log(`  ✓ Deleted model: ${modelName}`);
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
  }
}

async function main() {
  console.log('Removing faq-section model from Builder.io...\n');
  await deleteModel('faq-section');
  console.log('\n✅ Done!');
  console.log('\nThe FAQ should use the "faq" data model instead.');
  console.log('Run "node scripts/create-models.mjs" to ensure the faq data model exists.');
}

main().catch(console.error);
