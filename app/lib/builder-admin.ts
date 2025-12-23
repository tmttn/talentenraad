// Builder.io Admin API client for content management
// Uses the Write API for CRUD operations

import type {
  BuilderModel,
  BuilderListResponse,
  BuilderWriteResponse,
  Activity,
  NewsItem,
  Announcement,
  Sponsor,
  Page,
} from './builder-types';

const builderPublicKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? '';
const builderPrivateKey = process.env.BUILDER_PRIVATE_KEY ?? '';

const CDN_BASE_URL = 'https://cdn.builder.io/api/v3/content';
const WRITE_BASE_URL = 'https://builder.io/api/v1/write';

type ContentTypeMap = {
  activiteit: Activity;
  nieuws: NewsItem;
  aankondiging: Announcement;
  sponsor: Sponsor;
  page: Page;
};

/**
 * List all content entries for a model
 */
export async function listContent<T extends BuilderModel>(model: T): Promise<Array<ContentTypeMap[T]>> {
  const url = new URL(`${CDN_BASE_URL}/${model}`);
  url.searchParams.set('apiKey', builderPublicKey);
  url.searchParams.set('limit', '100');
  url.searchParams.set('includeUnpublished', 'true');
  url.searchParams.set('cachebust', 'true');

  // Sort by date descending for activities and news
  if (model === 'activiteit' || model === 'nieuws') {
    url.searchParams.set('sort.data.datum', '-1');
  }

  const response = await fetch(url.toString(), {cache: 'no-store'});

  if (!response.ok) {
    throw new Error(`Failed to fetch ${model}: ${response.statusText}`);
  }

  const data = await response.json() as BuilderListResponse<ContentTypeMap[T]>;
  return data.results;
}

/**
 * Get a single content entry by ID
 */
export async function getContent<T extends BuilderModel>(
  model: T,
  id: string,
): Promise<ContentTypeMap[T] | null> {
  const url = new URL(`${CDN_BASE_URL}/${model}/${id}`);
  url.searchParams.set('apiKey', builderPublicKey);
  url.searchParams.set('includeUnpublished', 'true');
  url.searchParams.set('cachebust', 'true');

  const response = await fetch(url.toString(), {cache: 'no-store'});

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`Failed to fetch ${model}/${id}: ${response.statusText}`);
  }

  return response.json() as Promise<ContentTypeMap[T]>;
}

/**
 * Create a new content entry
 */
export async function createContent(
  model: BuilderModel,
  data: Record<string, unknown>,
  options?: {publish?: boolean; name?: string},
): Promise<BuilderWriteResponse> {
  const url = `${WRITE_BASE_URL}/${model}`;

  const body = {
    name: options?.name ?? `${model}-${Date.now()}`,
    published: options?.publish ? 'published' : 'draft',
    data,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${builderPrivateKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ${model}: ${error}`);
  }

  return response.json() as Promise<BuilderWriteResponse>;
}

/**
 * Update an existing content entry
 */
export async function updateContent(
  model: BuilderModel,
  id: string,
  data: Record<string, unknown>,
  options?: {publish?: boolean; name?: string},
): Promise<BuilderWriteResponse> {
  const url = `${WRITE_BASE_URL}/${model}/${id}`;

  const body: Record<string, unknown> = {data};

  if (options?.publish !== undefined) {
    body.published = options.publish ? 'published' : 'draft';
  }

  if (options?.name) {
    body.name = options.name;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${builderPrivateKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update ${model}/${id}: ${error}`);
  }

  return response.json() as Promise<BuilderWriteResponse>;
}

/**
 * Delete a content entry
 */
export async function deleteContent(
  model: BuilderModel,
  id: string,
): Promise<void> {
  const url = `${WRITE_BASE_URL}/${model}/${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${builderPrivateKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete ${model}/${id}: ${error}`);
  }
}

/**
 * Publish a content entry
 */
export async function publishContent(
  model: BuilderModel,
  id: string,
): Promise<BuilderWriteResponse> {
  return updateContent(model, id, {}, {publish: true});
}

/**
 * Unpublish a content entry (set to draft)
 */
export async function unpublishContent(
  model: BuilderModel,
  id: string,
): Promise<BuilderWriteResponse> {
  return updateContent(model, id, {}, {publish: false});
}
