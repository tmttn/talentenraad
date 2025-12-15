import {extractPageAnnouncement} from '../../app/lib/builder-utils';

describe('extractPageAnnouncement', () => {
	it('returns undefined when content is undefined', () => {
		expect(extractPageAnnouncement(undefined)).toBeUndefined();
	});

	it('returns undefined when content.data is missing', () => {
		const content = {} as Parameters<typeof extractPageAnnouncement>[0];
		expect(extractPageAnnouncement(content)).toBeUndefined();
	});

	it('returns undefined when paginaAankondiging is missing', () => {
		const content = {data: {}} as Parameters<typeof extractPageAnnouncement>[0];
		expect(extractPageAnnouncement(content)).toBeUndefined();
	});

	it('returns undefined when actief is false', () => {
		const content = {
			data: {
				paginaAankondiging: {
					actief: false,
					tekst: 'Test',
					type: 'info',
				},
			},
		} as Parameters<typeof extractPageAnnouncement>[0];

		expect(extractPageAnnouncement(content)).toBeUndefined();
	});

	it('returns undefined when tekst is empty', () => {
		const content = {
			data: {
				paginaAankondiging: {
					actief: true,
					tekst: '',
					type: 'info',
				},
			},
		} as Parameters<typeof extractPageAnnouncement>[0];

		expect(extractPageAnnouncement(content)).toBeUndefined();
	});

	it('returns announcement data when actief is true and tekst is provided', () => {
		const content = {
			data: {
				paginaAankondiging: {
					actief: true,
					tekst: 'Test announcement',
					type: 'waarschuwing',
				},
			},
		} as Parameters<typeof extractPageAnnouncement>[0];

		const result = extractPageAnnouncement(content);

		expect(result).toEqual({
			tekst: 'Test announcement',
			type: 'waarschuwing',
			link: undefined,
			linkTekst: undefined,
		});
	});

	it('includes link and linkTekst when provided', () => {
		const content = {
			data: {
				paginaAankondiging: {
					actief: true,
					tekst: 'Test announcement',
					type: 'belangrijk',
					link: '/more-info',
					linkTekst: 'Learn more',
				},
			},
		} as Parameters<typeof extractPageAnnouncement>[0];

		const result = extractPageAnnouncement(content);

		expect(result).toEqual({
			tekst: 'Test announcement',
			type: 'belangrijk',
			link: '/more-info',
			linkTekst: 'Learn more',
		});
	});

	it('defaults type to info when not provided', () => {
		const content = {
			data: {
				paginaAankondiging: {
					actief: true,
					tekst: 'Test announcement',
				},
			},
		} as Parameters<typeof extractPageAnnouncement>[0];

		const result = extractPageAnnouncement(content);

		expect(result?.type).toBe('info');
	});
});
