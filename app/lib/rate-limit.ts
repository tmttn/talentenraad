import {checkRateLimit} from '@vercel/firewall';
import {NextResponse} from 'next/server';

export type RateLimitResult = {
	limited: boolean;
	response?: NextResponse;
};

/**
 * Check rate limit for an API endpoint
 * Returns a rate limit response if limited, otherwise continues
 *
 * Note: Rate limits must be configured in Vercel Dashboard:
 * Project Settings > Firewall > Rate Limiting
 */
export async function withRateLimit(
	rateLimitId: string,
	request: Request,
): Promise<RateLimitResult> {
	try {
		const {rateLimited} = await checkRateLimit(rateLimitId, {request});

		if (rateLimited) {
			return {
				limited: true,
				response: NextResponse.json(
					{
						success: false,
						message: 'Te veel verzoeken. Probeer het later opnieuw.',
					},
					{status: 429},
				),
			};
		}

		return {limited: false};
	} catch (error) {
		// In development or if rate limiting is not configured, allow the request
		// This prevents blocking requests when Vercel Firewall is unavailable
		console.warn('Rate limit check failed (may be expected in development):', error);
		return {limited: false};
	}
}
