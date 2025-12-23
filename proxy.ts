import {type NextRequest, NextResponse} from 'next/server';
import {auth0} from '@lib/auth0';

/**
 * Proxy middleware that handles:
 * 1. Auth0 authentication
 * 2. 404 detection for dynamic content pages
 *
 * The 404 detection is needed because notFound() in Next.js App Router
 * has issues on Vercel where it returns 500 instead of 404 status codes.
 */

// Static paths that don't need content checking
const staticPaths = new Set([
	'/',
	'/robots.txt',
	'/sitemap.xml',
	'/manifest.webmanifest',
	'/component-preview',
]);

// Path prefixes for known routes (api, etc.) - these skip 404 checks
const knownPrefixes = [
	'/api',
	'/activiteiten/',
	'/nieuws/',
	'/sponsors/',
	'/sections/',
	'/component-preview/',
	'/_next',
	'/monitoring',
];

// Valid admin routes (exact paths and patterns)
const validAdminExactPaths = new Set([
	'/admin',
	'/admin/login',
	'/admin/nieuws',
	'/admin/nieuws/new',
	'/admin/activiteiten',
	'/admin/activiteiten/new',
	'/admin/submissions',
	'/admin/aankondigingen',
	'/admin/notificaties',
	'/admin/seo',
	'/admin/sponsors',
	'/admin/data',
	'/admin/gebruikers',
	'/admin/decoraties',
	'/admin/audit-logs',
	'/admin/not-found-page', // Target for 404 rewrites
]);

// Admin routes with dynamic segments (e.g., /admin/nieuws/[id])
const adminDynamicPatterns = [
	/^\/admin\/nieuws\/[\w-]+$/,
	/^\/admin\/activiteiten\/[\w-]+$/,
	/^\/admin\/submissions\/[\w-]+$/,
];

/**
 * Check if an admin path is valid
 */
function isValidAdminPath(pathname: string): boolean {
	// Check exact paths
	if (validAdminExactPaths.has(pathname)) {
		return true;
	}

	// Check dynamic patterns
	return adminDynamicPatterns.some(pattern => pattern.test(pathname));
}

// File extensions that should be passed through
const fileExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js', '.json', '.woff', '.woff2', '.ttf'];

/**
 * Check if content exists in Builder.io for the given path
 */
async function checkBuilderContent(pathname: string, request: NextRequest): Promise<boolean> {
	// eslint-disable-next-line n/prefer-global/process
	const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

	if (!builderApiKey) {
		return true; // Assume content exists if no API key
	}

	try {
		const url = new URL('https://cdn.builder.io/api/v3/content/page');
		url.searchParams.set('apiKey', builderApiKey);
		url.searchParams.set('userAttributes.urlPath', pathname);
		url.searchParams.set('limit', '1');
		url.searchParams.set('fields', 'id');

		const response = await fetch(url.toString(), {
			next: {revalidate: 60},
		});

		if (!response.ok) {
			return true; // If API fails, assume content exists
		}

		const data = (await response.json()) as {results?: Array<{id: string}>};

		// Check for preview mode
		const searchParameters = request.nextUrl.searchParams;
		const isPreview = searchParameters.has('builder.preview') || searchParameters.get('preview') === 'true';

		return Boolean(data.results?.length) || isPreview;
	} catch {
		return true; // If there's an error, assume content exists
	}
}

export async function proxy(request: NextRequest) {
	const {pathname} = request.nextUrl;

	// First, run Auth0 middleware
	const authResponse = await auth0.middleware(request);

	// If Auth0 returned a non-next response (redirect, etc.), return it
	if (authResponse.status !== 200 || authResponse.headers.get('x-middleware-rewrite')) {
		return authResponse;
	}

	// Skip 404 check for static paths
	if (staticPaths.has(pathname)) {
		return authResponse;
	}

	// Skip 404 check for known prefixes (non-admin)
	if (knownPrefixes.some(prefix => pathname.startsWith(prefix))) {
		return authResponse;
	}

	// Skip 404 check for file extensions
	if (fileExtensions.some(ext => pathname.endsWith(ext))) {
		return authResponse;
	}

	// Check admin routes for 404
	if (pathname.startsWith('/admin')) {
		if (!isValidAdminPath(pathname)) {
			// Rewrite to admin 404 page with 404 status
			const notFoundUrl = new URL('/admin/not-found-page', request.url);
			return NextResponse.rewrite(notFoundUrl, {status: 404});
		}

		return authResponse;
	}

	// Check if content exists in Builder.io (for non-admin routes)
	const contentExists = await checkBuilderContent(pathname, request);

	if (!contentExists) {
		// Rewrite to 404 page with 404 status
		const notFoundUrl = new URL('/404', request.url);
		return NextResponse.rewrite(notFoundUrl, {status: 404});
	}

	return authResponse;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
	],
};
