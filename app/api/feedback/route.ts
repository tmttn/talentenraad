import {type NextRequest, NextResponse} from 'next/server';
import {db, feedback} from '@lib/db';
import {verifyRecaptcha} from '@lib/recaptcha';

type FeedbackFormData = {
	rating: number;
	comment?: string;
	email?: string;
	pageUrl?: string;
	pageTitle?: string;
	recaptchaToken?: string | null;
};

function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
	return input
		.trim()
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll('\'', '&#x27;');
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json() as FeedbackFormData;

		// Validate required fields
		const errors: Record<string, string> = {};

		if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
			errors.rating = 'Beoordeling moet tussen 1 en 5 zijn';
		}

		if (body.email?.trim() && !isValidEmail(body.email)) {
			errors.email = 'Ongeldig e-mailadres';
		}

		if (body.comment && body.comment.length > 2000) {
			errors.comment = 'Opmerking mag maximaal 2000 tekens bevatten';
		}

		// Return validation errors if any
		if (Object.keys(errors).length > 0) {
			return NextResponse.json(
				{
					success: false,
					errors,
					message: 'Validatie mislukt. Controleer de velden.',
				},
				{status: 400},
			);
		}

		// Verify reCAPTCHA token
		if (body.recaptchaToken) {
			const recaptchaResult = await verifyRecaptcha(body.recaptchaToken);

			if (!recaptchaResult.success) {
				console.warn('reCAPTCHA verification failed:', recaptchaResult.error);
				return NextResponse.json(
					{
						success: false,
						message: 'Beveiligingsverificatie mislukt. Probeer het opnieuw.',
					},
					{status: 400},
				);
			}
		}

		// Get user agent
		const userAgent = request.headers.get('user-agent') ?? undefined;

		// Sanitize inputs
		const sanitizedData = {
			rating: body.rating,
			comment: body.comment ? sanitizeInput(body.comment) : null,
			email: body.email?.trim() ? sanitizeInput(body.email) : null,
			pageUrl: body.pageUrl ? sanitizeInput(body.pageUrl).slice(0, 500) : null,
			pageTitle: body.pageTitle ? sanitizeInput(body.pageTitle).slice(0, 200) : null,
			userAgent: userAgent?.slice(0, 500),
		};

		// Save to database
		await db.insert(feedback).values({
			rating: sanitizedData.rating,
			comment: sanitizedData.comment,
			email: sanitizedData.email,
			pageUrl: sanitizedData.pageUrl,
			pageTitle: sanitizedData.pageTitle,
			userAgent: sanitizedData.userAgent,
		});

		return NextResponse.json(
			{
				success: true,
				message: 'Bedankt voor je feedback!',
			},
			{status: 200},
		);
	} catch (error) {
		console.error('Feedback submission error:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Er is een fout opgetreden. Probeer het later opnieuw.',
			},
			{status: 500},
		);
	}
}

// Handle unsupported methods
export async function GET() {
	return NextResponse.json(
		{message: 'Method not allowed'},
		{status: 405},
	);
}
