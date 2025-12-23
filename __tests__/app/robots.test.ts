import robots from '../../app/robots';
import {siteConfig} from '../../app/lib/seo';

describe('robots', () => {
	it('returns correct robots configuration', () => {
		const result = robots();

		expect(result).toEqual({
			rules: {
				userAgent: '*',
				allow: '/',
			},
			sitemap: `${siteConfig.url}/sitemap.xml`,
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

		expect(result.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
	});
});
