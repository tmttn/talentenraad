import {type NextRequest, NextResponse} from 'next/server';
import {db, submissions} from '@/lib/db';
import {sendContactNotification} from '@/lib/email/resend';

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
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll('\'', '&#x27;');
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
			phone: body.phone ? sanitizeInput(body.phone) : null,
			subject: body.subject ? sanitizeInput(body.subject) : 'vraag',
			message: sanitizeInput(body.message),
		};

		// Save to database
		const [submission] = await db.insert(submissions)
			.values({
				name: sanitizedData.name,
				email: sanitizedData.email,
				phone: sanitizedData.phone,
				subject: sanitizedData.subject,
				message: sanitizedData.message,
			})
			.returning();

		// Send email notification (non-blocking)
		sendContactNotification({
			name: sanitizedData.name,
			email: sanitizedData.email,
			phone: sanitizedData.phone ?? undefined,
			subject: sanitizedData.subject,
			message: sanitizedData.message,
			submissionId: submission.id,
		}).catch(error => {
			console.error('Failed to send notification email:', error);
		});

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
