import sitemap from '../../app/sitemap';

describe('sitemap', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2024-01-15'));
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('returns array with home page entry', () => {
		const result = sitemap();

		expect(result).toHaveLength(1);
		expect(result[0].url).toBe('https://talentenraad.vercel.app');
	});

	it('sets correct priority for home page', () => {
		const result = sitemap();

		expect(result[0].priority).toBe(1);
	});

	it('sets weekly change frequency', () => {
		const result = sitemap();

		expect(result[0].changeFrequency).toBe('weekly');
	});

	it('includes lastModified date', () => {
		const result = sitemap();

		expect(result[0].lastModified).toBeInstanceOf(Date);
	});
});
