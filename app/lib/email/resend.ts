import {Resend} from 'resend';

// Lazy initialization to avoid errors during build time
let resend: Resend | null = null;

function getResendClient(): Resend {
	if (!resend) {
		// eslint-disable-next-line n/prefer-global/process
		resend = new Resend(process.env.RESEND_API_KEY);
	}

	return resend;
}

type ContactNotificationData = {
	name: string;
	email: string;
	phone?: string;
	subject: string;
	message: string;
	submissionId: string;
};

const subjectLabels: Record<string, string> = {
	vraag: 'Algemene vraag',
	activiteit: 'Vraag over activiteit',
	lidmaatschap: 'Lid worden',
	sponsoring: 'Sponsoring',
	anders: 'Anders',
};

export async function sendContactNotification(data: ContactNotificationData) {
	// eslint-disable-next-line n/prefer-global/process
	const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'voorzitterouderraad@talentenhuis.be';
	// eslint-disable-next-line n/prefer-global/process
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://talentenraad.be';
	const subjectLabel = subjectLabels[data.subject] ?? data.subject;

	await getResendClient().emails.send({
		from: 'Talentenraad <noreply@talentenraad.be>',
		to: adminEmail,
		subject: `Nieuw contactbericht: ${subjectLabel}`,
		html: `
			<h2>Nieuw contactbericht ontvangen</h2>
			<p><strong>Van:</strong> ${data.name} (${data.email})</p>
			${data.phone ? `<p><strong>Telefoon:</strong> ${data.phone}</p>` : ''}
			<p><strong>Onderwerp:</strong> ${subjectLabel}</p>
			<hr />
			<p><strong>Bericht:</strong></p>
			<p>${data.message.replaceAll('\n', '<br />')}</p>
			<hr />
			<p><a href="${siteUrl}/admin/submissions/${data.submissionId}">Bekijk in admin dashboard</a></p>
		`,
	});
}
