import {config} from 'dotenv';

config();

const PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;

async function listModels() {
  const query = `
    query {
      models {
        id
        name
        kind
        fields {
          name
          type
        }
      }
    }
  `;

  const response = await fetch('https://builder.io/api/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.errors) {
    console.error('Error:', data.errors[0].message);
    return;
  }

  if (!data.data?.models) {
    console.log('No models found in response');
    return;
  }

  console.log('Available models:\n');
  for (const model of data.data.models) {
    console.log(`${model.name} (${model.kind}):`);
    console.log(`  ID: ${model.id}`);
    if (model.fields?.length > 0) {
      console.log('  Fields:');
      for (const field of model.fields) {
        console.log(`    - ${field.name}: ${field.type}`);
      }
    }
    console.log();
  }
}

listModels().catch(console.error);
