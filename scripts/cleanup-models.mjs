const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';

// List all models
const listModelsQuery = `
  query {
    models {
      id
      name
      kind
      lastUpdateBy
    }
  }
`;

// Delete a model
const deleteModelMutation = `
  mutation DeleteModel($id: String!) {
    deleteModel(id: $id) {
      id
      name
    }
  }
`;

async function listModels() {
  console.log('📋 Fetching all Builder.io models...\n');

  const response = await fetch('https://builder.io/api/v2/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({query: listModelsQuery}),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('Error fetching models:', result.errors);
    return [];
  }

  return result.data?.models || [];
}

async function deleteModel(id, name) {
  const response = await fetch('https://builder.io/api/v2/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      query: deleteModelMutation,
      variables: {id},
    }),
  });

  const result = await response.json();

  if (result.errors) {
    console.log(`  ✗ Failed to delete "${name}": ${result.errors[0].message}`);
    return false;
  }

  console.log(`  ✓ Deleted "${name}"`);
  return true;
}

async function main() {
  const models = await listModels();

  if (models.length === 0) {
    console.log('No models found.');
    return;
  }

  console.log('Found models:');
  console.log('─'.repeat(50));

  // Models we want to KEEP
  const keepModels = ['page', 'activiteit'];

  const toDelete = [];

  for (const model of models) {
    const keep = keepModels.includes(model.name);
    const status = keep ? '✓ KEEP' : '✗ DELETE';
    console.log(`${status.padEnd(10)} ${model.name.padEnd(20)} (${model.kind})`);

    if (!keep) {
      toDelete.push(model);
    }
  }

  console.log('─'.repeat(50));
  console.log(`\nTotal: ${models.length} models`);
  console.log(`Keep: ${keepModels.length}`);
  console.log(`Delete: ${toDelete.length}`);

  if (toDelete.length > 0) {
    console.log('\n🗑️  Deleting unused models...\n');

    for (const model of toDelete) {
      await deleteModel(model.id, model.name);
    }

    console.log('\n✅ Cleanup complete!');
  } else {
    console.log('\n✅ No models to delete.');
  }
}

main();
