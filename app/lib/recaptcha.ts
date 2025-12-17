// reCAPTCHA v3 verification utility

type RecaptchaVerifyResponse = {
	success: boolean;
	score: number;
	action: string;
	challenge_ts: string;
	hostname: string;
	'error-codes'?: string[];
};

export type RecaptchaResult = {
	success: boolean;
	score: number;
	error?: string;
};

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MIN_SCORE = 0.5;

/**
 * Verify a reCAPTCHA v3 token with Google's API
 * Returns success: true if the token is valid and score >= 0.5
 */
export async function verifyRecaptcha(token: string): Promise<RecaptchaResult> {
	const secretKey = process.env.RECAPTCHA_SECRET_KEY;

	// Skip verification in development if env vars are not set
	if (!secretKey) {
		console.warn('RECAPTCHA_SECRET_KEY not set, skipping verification');
		return {success: true, score: 1};
	}

	if (!token) {
		return {success: false, score: 0, error: 'No reCAPTCHA token provided'};
	}

	try {
		const response = await fetch(RECAPTCHA_VERIFY_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				secret: secretKey,
				response: token,
			}),
		});

		if (!response.ok) {
			return {success: false, score: 0, error: 'Failed to verify reCAPTCHA'};
		}

		const data = await response.json() as RecaptchaVerifyResponse;

		if (!data.success) {
			const errorCodes = data['error-codes']?.join(', ') ?? 'Unknown error';
			return {success: false, score: 0, error: `reCAPTCHA verification failed: ${errorCodes}`};
		}

		// Check if score meets minimum threshold
		if (data.score < MIN_SCORE) {
			return {
				success: false,
				score: data.score,
				error: `reCAPTCHA score too low: ${data.score}`,
			};
		}

		return {success: true, score: data.score};
	} catch (error) {
		console.error('reCAPTCHA verification error:', error);
		return {success: false, score: 0, error: 'reCAPTCHA verification failed'};
	}
}
