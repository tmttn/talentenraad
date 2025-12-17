import {
	listContent,
	getContent,
	createContent,
	updateContent,
	deleteContent,
	publishContent,
	unpublishContent,
} from '../../app/lib/builder-admin';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('builder-admin', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('listContent', () => {
		it('fetches content list from CDN', async () => {
			const mockResults = [
				{id: '1', data: {titel: 'Test 1'}},
				{id: '2', data: {titel: 'Test 2'}},
			];
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({results: mockResults}),
			});

			const result = await listContent('activiteit');

			expect(result).toEqual(mockResults);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('cdn.builder.io/api/v3/content/activiteit'),
				{cache: 'no-store'},
			);
		});

		it('includes sort parameter for activities', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({results: []}),
			});

			await listContent('activiteit');

			const url = mockFetch.mock.calls[0][0] as string;
			expect(url).toContain('sort.data.datum=-1');
		});

		it('includes sort parameter for news', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({results: []}),
			});

			await listContent('nieuws');

			const url = mockFetch.mock.calls[0][0] as string;
			expect(url).toContain('sort.data.datum=-1');
		});

		it('throws error when fetch fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				statusText: 'Internal Server Error',
			});

			await expect(listContent('activiteit')).rejects.toThrow('Failed to fetch activiteit');
		});
	});

	describe('getContent', () => {
		it('fetches single content by ID', async () => {
			const mockContent = {id: '123', data: {titel: 'Test'}};
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockContent,
			});

			const result = await getContent('activiteit', '123');

			expect(result).toEqual(mockContent);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('activiteit/123'),
				{cache: 'no-store'},
			);
		});

		it('returns null for 404 response', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
			});

			const result = await getContent('activiteit', 'not-found');

			expect(result).toBeNull();
		});

		it('throws error for non-404 failures', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: 'Server Error',
			});

			await expect(getContent('activiteit', '123')).rejects.toThrow('Failed to fetch activiteit/123');
		});
	});

	describe('createContent', () => {
		it('creates new content with POST request', async () => {
			const mockResponse = {id: 'new-123'};
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await createContent('activiteit', {titel: 'New Activity'});

			expect(result).toEqual(mockResponse);
			expect(mockFetch).toHaveBeenCalledWith(
				'https://builder.io/api/v1/write/activiteit',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
						Authorization: expect.stringContaining('Bearer'),
					}),
				}),
			);
		});

		it('sets published status when publish option is true', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({}),
			});

			await createContent('activiteit', {titel: 'Test'}, {publish: true});

			const callArgs = mockFetch.mock.calls[0][1] as {body: string};
			const body = JSON.parse(callArgs.body);
			expect(body.published).toBe('published');
		});

		it('sets draft status when publish option is false', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({}),
			});

			await createContent('activiteit', {titel: 'Test'}, {publish: false});

			const callArgs = mockFetch.mock.calls[0][1] as {body: string};
			const body = JSON.parse(callArgs.body);
			expect(body.published).toBe('draft');
		});

		it('uses custom name when provided', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({}),
			});

			await createContent('activiteit', {titel: 'Test'}, {name: 'Custom Name'});

			const callArgs = mockFetch.mock.calls[0][1] as {body: string};
			const body = JSON.parse(callArgs.body);
			expect(body.name).toBe('Custom Name');
		});

		it('throws error when create fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				text: async () => 'Validation error',
			});

			await expect(createContent('activiteit', {})).rejects.toThrow('Failed to create activiteit: Validation error');
		});
	});

	describe('updateContent', () => {
		it('updates content with PUT request', async () => {
			const mockResponse = {id: '123'};
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await updateContent('activiteit', '123', {titel: 'Updated'});

			expect(result).toEqual(mockResponse);
			expect(mockFetch).toHaveBeenCalledWith(
				'https://builder.io/api/v1/write/activiteit/123',
				expect.objectContaining({method: 'PUT'}),
			);
		});

		it('includes publish status in update when provided', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({}),
			});

			await updateContent('activiteit', '123', {}, {publish: true});

			const callArgs = mockFetch.mock.calls[0][1] as {body: string};
			const body = JSON.parse(callArgs.body);
			expect(body.published).toBe('published');
		});

		it('includes name in update when provided', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({}),
			});

			await updateContent('activiteit', '123', {}, {name: 'New Name'});

			const callArgs = mockFetch.mock.calls[0][1] as {body: string};
			const body = JSON.parse(callArgs.body);
			expect(body.name).toBe('New Name');
		});

		it('throws error when update fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				text: async () => 'Not found',
			});

			await expect(updateContent('activiteit', '123', {})).rejects.toThrow('Failed to update activiteit/123');
		});
	});

	describe('deleteContent', () => {
		it('deletes content with DELETE request', async () => {
			mockFetch.mockResolvedValueOnce({ok: true});

			await deleteContent('activiteit', '123');

			expect(mockFetch).toHaveBeenCalledWith(
				'https://builder.io/api/v1/write/activiteit/123',
				expect.objectContaining({
					method: 'DELETE',
					headers: expect.objectContaining({
						Authorization: expect.stringContaining('Bearer'),
					}),
				}),
			);
		});

		it('throws error when delete fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				text: async () => 'Permission denied',
			});

			await expect(deleteContent('activiteit', '123')).rejects.toThrow('Failed to delete activiteit/123: Permission denied');
		});
	});

	describe('publishContent', () => {
		it('calls updateContent with publish: true', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({}),
			});

			await publishContent('activiteit', '123');

			const callArgs = mockFetch.mock.calls[0][1] as {body: string};
			const body = JSON.parse(callArgs.body);
			expect(body.published).toBe('published');
		});
	});

	describe('unpublishContent', () => {
		it('calls updateContent with publish: false', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({}),
			});

			await unpublishContent('activiteit', '123');

			const callArgs = mockFetch.mock.calls[0][1] as {body: string};
			const body = JSON.parse(callArgs.body);
			expect(body.published).toBe('draft');
		});
	});
});
