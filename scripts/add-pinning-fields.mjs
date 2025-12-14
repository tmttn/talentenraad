const PRIVATE_KEY = 'bpk-4537158022f148049234c9ffbe759373';

async function updateModel(modelName, newFields) {
  console.log(`Updating model: ${modelName}...`);

  // First get the existing model
  const getQuery = `
    query GetModel($name: String!) {
      models(query: { name: $name }) {
        id
        name
        fields
      }
    }
  `;

  const getResponse = await fetch('https://builder.io/api/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      query: getQuery,
      variables: { name: modelName },
    }),
  });

  const getData = await getResponse.json();

  if (getData.errors) {
    console.error(`Failed to get ${modelName}:`, getData.errors[0].message);
    return null;
  }

  const model = getData.data?.models?.[0];
  if (!model) {
    console.log(`Model ${modelName} not found`);
    return null;
  }

  // Merge existing fields with new fields
  const existingFields = model.fields || [];
  const existingFieldNames = existingFields.map(f => f.name);
  const fieldsToAdd = newFields.filter(f => !existingFieldNames.includes(f.name));

  if (fieldsToAdd.length === 0) {
    console.log(`  ✓ Model ${modelName} already has all fields`);
    return model;
  }

  const updatedFields = [...existingFields, ...fieldsToAdd];

  // Update the model
  const updateQuery = `
    mutation UpdateModel($id: ID!, $body: JSONObject!) {
      updateModel(id: $id, body: $body) {
        id
        name
      }
    }
  `;

  const updateResponse = await fetch('https://builder.io/api/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      query: updateQuery,
      variables: {
        id: model.id,
        body: {
          fields: updatedFields,
        },
      },
    }),
  });

  const updateData = await updateResponse.json();

  if (updateData.errors) {
    console.error(`Failed to update ${modelName}:`, updateData.errors[0].message);
    return null;
  }

  console.log(`  ✓ Added fields to ${modelName}: ${fieldsToAdd.map(f => f.name).join(', ')}`);
  return updateData.data?.updateModel;
}

async function main() {
  console.log('Adding pinning and ordering fields to models...\n');

  const pinningFields = [
    {
      name: 'vastgepind',
      type: 'boolean',
      defaultValue: false,
      helperText: 'Vastgepinde items worden altijd bovenaan getoond',
    },
    {
      name: 'volgorde',
      type: 'number',
      defaultValue: 0,
      helperText: 'Volgorde van weergave (lager = eerder)',
    },
  ];

  // Update activiteit model
  await updateModel('activiteit', pinningFields);

  // Update nieuws model
  await updateModel('nieuws', pinningFields);

  console.log('\n✅ Done! Je kunt nu in Builder.io:');
  console.log('- Items vastpinnen (vastgepind = true)');
  console.log('- De volgorde aanpassen via het volgorde veld');
}

main().catch(console.error);
