import {type NextRequest, NextResponse} from 'next/server';

type ContactFormData = {
	name: string;
	email: string;
	phone?: string;
	subject?: string;
	message: string;
};

// Validation helpers
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
	return input
		.trim()
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;');
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json() as ContactFormData;

		// Validate required fields
		const errors: Record<string, string> = {};

		if (!body.name?.trim()) {
			errors.name = 'Naam is verplicht';
		} else if (body.name.trim().length < 2) {
			errors.name = 'Naam moet minstens 2 karakters bevatten';
		}

		if (!body.email?.trim()) {
			errors.email = 'E-mailadres is verplicht';
		} else if (!isValidEmail(body.email)) {
			errors.email = 'Ongeldig e-mailadres';
		}

		if (!body.message?.trim()) {
			errors.message = 'Bericht is verplicht';
		} else if (body.message.trim().length < 10) {
			errors.message = 'Bericht moet minstens 10 karakters bevatten';
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

		// Sanitize inputs
		const sanitizedData = {
			name: sanitizeInput(body.name),
			email: sanitizeInput(body.email),
			phone: body.phone ? sanitizeInput(body.phone) : undefined,
			subject: body.subject ? sanitizeInput(body.subject) : 'Algemene vraag',
			message: sanitizeInput(body.message),
			timestamp: new Date().toISOString(),
		};

		// Log the contact form submission (in production, you would send an email or save to database)
		console.log('Contact form submission:', sanitizedData);

		// In a production environment, you would:
		// 1. Send an email using a service like SendGrid, Resend, or Nodemailer
		// 2. Save to a database
		// 3. Integrate with a CRM
		// 4. Send a Slack notification

		// Example with Builder.io write API (if you want to store submissions)
		// eslint-disable-next-line n/prefer-global/process
		const builderPrivateKey = process.env.BUILDER_PRIVATE_KEY;

		if (builderPrivateKey) {
			try {
				// Store submission in Builder.io (optional)
				const builderResponse = await fetch('https://builder.io/api/v1/write/contact-submission', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${builderPrivateKey}`,
					},
					body: JSON.stringify({
						data: sanitizedData,
					}),
				});

				if (!builderResponse.ok) {
					console.warn('Failed to save to Builder.io:', await builderResponse.text());
				}
			} catch (builderError) {
				// Log but don't fail the request if Builder.io save fails
				console.warn('Builder.io save error:', builderError);
			}
		}

		return NextResponse.json(
			{
				success: true,
				message: 'Bedankt voor uw bericht! We nemen zo snel mogelijk contact met u op.',
			},
			{status: 200},
		);
	} catch (error) {
		console.error('Contact form error:', error);

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
