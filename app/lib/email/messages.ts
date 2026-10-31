import {getSiteUrl, sendMail} from './mailer';

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
  const loginUrl = `${getSiteUrl()}/admin/login`;
  const greeting = data.name ? `Beste ${data.name}` : 'Beste';
  const inviter = data.inviterName ? ` door ${data.inviterName}` : '';

  await sendMail({
    to: data.email,
    subject: 'Uitnodiging voor Talentenraad Admin',
    html: `
      <h2>Welkom bij Talentenraad!</h2>
      <p>${greeting},</p>
      <p>Je bent uitgenodigd om toegang te krijgen tot het admin dashboard van Talentenraad${inviter}.</p>
      <p>Ga naar de inlogpagina en vul je e-mailadres (${data.email}) in. Je ontvangt dan een e-mail met een link waarmee je meteen bent ingelogd.</p>
      <p style="margin: 24px 0;">
        <a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Ga naar Admin Dashboard
        </a>
      </p>
      <p>Of kopieer deze link naar je browser:</p>
      <p><a href="${loginUrl}">${loginUrl}</a></p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 14px;">
        Als je deze uitnodiging niet verwacht had, kun je deze e-mail negeren.
      </p>
    `,
    text: `${greeting},

Je bent uitgenodigd om toegang te krijgen tot het admin dashboard van Talentenraad${inviter}.

Ga naar ${loginUrl} en vul je e-mailadres (${data.email}) in. Je ontvangt dan een e-mail met een link waarmee je meteen bent ingelogd.

Als je deze uitnodiging niet verwacht had, kun je deze e-mail negeren.`,
  });
}

export async function sendLoginLink({to, url}: {to: string; url: string}): Promise<void> {
  await sendMail({
    to,
    subject: 'Je inloglink voor Talentenraad',
    html: `
      <h2>Inloggen bij Talentenraad</h2>
      <p>Klik op de knop om in te loggen. De link is 15 minuten geldig en werkt één keer.</p>
      <p style="margin: 24px 0;">
        <a href="${url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Inloggen
        </a>
      </p>
      <p>Of kopieer deze link naar je browser:</p>
      <p><a href="${url}">${url}</a></p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 14px;">
        Heb je deze link niet aangevraagd? Dan kun je deze e-mail negeren.
      </p>
    `,
    text: `Gebruik de onderstaande link om in te loggen bij Talentenraad. De link is 15 minuten geldig en werkt één keer.

${url}

Heb je deze link niet aangevraagd? Dan kun je deze e-mail negeren.`,
  });
}

export async function sendContactNotification(data: ContactNotificationData) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'voorzitterouderraad@talentenhuis.be';
  const siteUrl = getSiteUrl();
  const subjectLabel = subjectLabels[data.subject] ?? data.subject;
  const submissionUrl = `${siteUrl}/admin/submissions/${data.submissionId}`;

  await sendMail({
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
      <p><a href="${submissionUrl}">Bekijk in admin dashboard</a></p>
    `,
    text: `Nieuw contactbericht ontvangen

Van: ${data.name} (${data.email})
${data.phone ? `Telefoon: ${data.phone}\n` : ''}Onderwerp: ${subjectLabel}

${data.message}

Bekijk in admin dashboard: ${submissionUrl}`,
  });
}
