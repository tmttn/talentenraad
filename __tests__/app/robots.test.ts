import robots from '../../app/robots';

describe('robots', () => {
	it('returns correct robots configuration', () => {
		const result = robots();

		expect(result).toEqual({
			rules: {
				userAgent: '*',
				allow: '/',
			},
			sitemap: 'https://talentenraad.vercel.app/sitemap.xml',
		});
	});

	it('allows all user agents', () => {
		const result = robots();

		expect(result.rules.userAgent).toBe('*');
	});

	it('allows root path', () => {
		const result = robots();

		expect(result.rules.allow).toBe('/');
	});

	it('includes sitemap URL', () => {
		const result = robots();

		expect(result.sitemap).toBe('https://talentenraad.vercel.app/sitemap.xml');
	});
});
