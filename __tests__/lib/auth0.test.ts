// Mock Auth0Client before importing the module
jest.mock('@auth0/nextjs-auth0/server', () => ({
	Auth0Client: jest.fn(),
}));

import {isAdminEmail} from '../../app/lib/auth0';

describe('isAdminEmail', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = {...originalEnv};
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it('returns false for null email', () => {
		process.env.ADMIN_EMAILS = 'admin@test.com';
		expect(isAdminEmail(null)).toBe(false);
	});

	it('returns false for undefined email', () => {
		process.env.ADMIN_EMAILS = 'admin@test.com';
		expect(isAdminEmail(undefined)).toBe(false);
	});

	it('returns false for empty string email', () => {
		process.env.ADMIN_EMAILS = 'admin@test.com';
		expect(isAdminEmail('')).toBe(false);
	});

	it('returns true when email is in ADMIN_EMAILS', () => {
		process.env.ADMIN_EMAILS = 'admin@test.com';
		expect(isAdminEmail('admin@test.com')).toBe(true);
	});

	it('returns true when email matches case-insensitively', () => {
		process.env.ADMIN_EMAILS = 'admin@test.com';
		expect(isAdminEmail('ADMIN@TEST.COM')).toBe(true);
	});

	it('returns true when email is in comma-separated list', () => {
		process.env.ADMIN_EMAILS = 'admin@test.com, other@test.com, third@test.com';
		expect(isAdminEmail('other@test.com')).toBe(true);
	});

	it('returns false when email is not in ADMIN_EMAILS', () => {
		process.env.ADMIN_EMAILS = 'admin@test.com';
		expect(isAdminEmail('notadmin@test.com')).toBe(false);
	});

	it('returns false when ADMIN_EMAILS is not set', () => {
		delete process.env.ADMIN_EMAILS;
		expect(isAdminEmail('admin@test.com')).toBe(false);
	});

	it('handles whitespace in ADMIN_EMAILS correctly', () => {
		process.env.ADMIN_EMAILS = '  admin@test.com  ,  other@test.com  ';
		expect(isAdminEmail('admin@test.com')).toBe(true);
		expect(isAdminEmail('other@test.com')).toBe(true);
	});

	it('filters out empty entries from ADMIN_EMAILS', () => {
		process.env.ADMIN_EMAILS = 'admin@test.com,,,other@test.com';
		expect(isAdminEmail('admin@test.com')).toBe(true);
		expect(isAdminEmail('other@test.com')).toBe(true);
		expect(isAdminEmail('')).toBe(false);
	});
});
