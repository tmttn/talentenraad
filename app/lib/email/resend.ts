import {Resend} from 'resend';

// Lazy initialization to avoid errors during build time
let resend: Resend | null = null;

function getResendClient(): Resend {
  resend ??= new Resend(process.env.RESEND_API_KEY);

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

type InvitationEmailData = {
  email: string;
  name?: string;
  inviterName?: string;
};

export async function sendInvitationEmail(data: InvitationEmailData) {
  const siteUrl = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://talentenraad.be';
  const loginUrl = `${siteUrl}/admin/login`;
  const greeting = data.name ? `Beste ${data.name}` : 'Beste';

  await getResendClient().emails.send({
    from: 'Talentenraad <noreply@notifications.talentenraad.be>',
    to: data.email,
    subject: 'Uitnodiging voor Talentenraad Admin',
    html: `
			<h2>Welkom bij Talentenraad!</h2>
			<p>${greeting},</p>
			<p>Je bent uitgenodigd om toegang te krijgen tot het admin dashboard van Talentenraad${data.inviterName ? ` door ${data.inviterName}` : ''}.</p>
			<p>Klik op de onderstaande link om in te loggen en je account te activeren:</p>
			<p style="margin: 24px 0;">
				<a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
					Ga naar Admin Dashboard
				</a>
			</p>
			<p>Of kopieer deze link naar je browser:</p>
			<p><a href="${loginUrl}">${loginUrl}</a></p>
			<hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
			<p style="color: #6b7280; font-size: 14px;">
				Als je deze uitnodiging niet verwacht had, kun je deze email negeren.
			</p>
		`,
  });
}

export async function sendContactNotification(data: ContactNotificationData) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'voorzitterouderraad@talentenhuis.be';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://talentenraad.be';
  const subjectLabel = subjectLabels[data.subject] ?? data.subject;

  await getResendClient().emails.send({
    from: 'Talentenraad <noreply@notifications.talentenraad.be>',
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
