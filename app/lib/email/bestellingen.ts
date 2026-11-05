/**
 * The two order mails: confirmation with payment instructions, and the pickup code once paid.
 * Tables and inline styles, because mail apps ignore most CSS; every value from a parent is escaped.
 * Layout and copy follow the mockups "Mail 1" and "Mail 2" in the design canvas.
 */
import {escapeHtml} from './escape';

export type MailRegel = {aantal: number; naam: string; bedrag: string};

export type BestelMailData = {
  titel: string;
  nummer: number;
  regels: MailRegel[];
  totaal: string;
  afhaalLabel: string;
  afhaalPlaats: string;
  /** Link to /b/<token>. */
  link: string;
  logoUrl: string;
  /** Up to which day a parent can cancel, e.g. `zondag 17 januari`; empty when it is no longer possible. */
  annulerenTot?: string;
};

export type Betaalgegevens = {
  bedrag: string;
  iban: string;
  begunstigde: string;
  mededeling: string;
  /** e.g. `vrijdag 8 januari` */
  uiterlijk: string;
  cash: boolean;
};

const ink = '#000000';
const text = '#364153';
const quiet = '#4a5565';
const font = 'font-family: system-ui, -apple-system, \'Segoe UI\', Roboto, Arial, sans-serif;';

export const cashTekst = 'Liever cash? Geef het bedrag in een gesloten envelop met je naam en bestelnummer af aan een lid van de Talentenraad, vóór het afhalen.';

function frame(data: BestelMailData, body: string): string {
  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(data.titel)}</title></head>
<body style="margin: 0; padding: 0; background: #f3f4f6; ${font} color: #101828;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6;"><tr><td align="center" style="padding: 24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 592px; background: #ffffff; border: 3px solid ${ink}; border-radius: 22px;">
<tr><td style="padding: 20px 28px; border-bottom: 2.5px solid ${ink};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td><img src="${escapeHtml(data.logoUrl)}" alt="Talentenraad Beverst" height="48" style="display: block; height: 48px; width: auto; border: 0;"></td>
<td align="right" style="${font} font-size: 13px; font-weight: 700; color: ${quiet};">Bestelling nr. ${data.nummer}</td>
</tr></table>
</td></tr>
<tr><td style="padding: 28px;">${body}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const paragraph = (content: string, extra = '') => `<p style="margin: 0 0 20px; ${font} font-size: 16px; line-height: 1.6; color: ${text}; ${extra}">${content}</p>`;

function overzicht(data: BestelMailData, totaalLabel: string): string {
  const rows = data.regels.map(regel => `<tr>
<td style="padding: 4px 0; ${font} font-size: 16px; color: #101828;">${regel.aantal} × ${escapeHtml(regel.naam)}</td>
<td align="right" style="padding: 4px 0; ${font} font-size: 16px; font-weight: 700; color: #101828; white-space: nowrap;">${escapeHtml(regel.bedrag)}</td>
</tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 22px;">${rows}
<tr><td style="padding: 10px 0 0; border-top: 2px solid ${ink}; ${font} font-size: 18px; font-weight: 700;">${totaalLabel}</td>
<td align="right" style="padding: 10px 0 0; border-top: 2px solid ${ink}; ${font} font-size: 18px; font-weight: 800; white-space: nowrap;">${escapeHtml(data.totaal)}</td></tr>
</table>`;
}

function knop(href: string, label: string, primary: boolean): string {
  const colors = primary ? 'color: #ffffff; background: #d41769;' : `color: ${ink}; background: #ffffff;`;
  return `<a href="${escapeHtml(href)}" style="display: inline-block; padding: 13px 20px; ${font} font-size: 16px; font-weight: 700; ${colors} text-decoration: none; border: 2.5px solid ${ink}; border-radius: 14px;">${label}</a>`;
}

const regelTekst = (regels: MailRegel[]) => regels.map(regel => `${regel.aantal} × ${regel.naam}  ${regel.bedrag}`).join('\n');

/** Mail 1: the order is in, this is how to pay. */
export function bevestigingMail(data: BestelMailData, betalen: Betaalgegevens): {subject: string; html: string; text: string} {
  const subject = `Je bestelling voor de ${data.titel.toLowerCase()} (nr. ${data.nummer}): zo betaal je`;
  const cash = betalen.cash ? `<p style="margin: 14px 0 0; ${font} font-size: 14px; line-height: 1.5; color: ${ink};">${escapeHtml(cashTekst)}</p>` : '';
  const betaalRij = (label: string, value: string, mono = false) => `<tr>
<td style="padding: 3px 10px 3px 0; ${font} font-size: 15px; color: ${ink}; width: 105px; vertical-align: top;">${label}</td>
<td style="padding: 3px 0; ${mono ? 'font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 16px; white-space: nowrap;' : `${font} font-size: 16px;`} font-weight: 700; color: ${ink};">${escapeHtml(value)}</td>
</tr>`;
  const annuleren = data.annulerenTot ? `Annuleren kan tot en met ${escapeHtml(data.annulerenTot)}. ` : '';

  const html = frame(data, `<h1 style="margin: 0 0 16px; ${font} font-size: 28px; line-height: 1.15; font-weight: 800; color: ${ink};">Bedankt voor je bestelling!</h1>
${paragraph('Hieronder staat wat je bestelde en hoe je betaalt. Zodra je betaling binnen is, krijg je een tweede mail met je afhaalcode.')}
${overzicht(data, 'Totaal')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 22px; background: #fcb040; border: 2.5px solid ${ink}; border-radius: 18px;"><tr><td style="padding: 20px;">
<p style="margin: 0 0 12px; ${font} font-size: 20px; font-weight: 800; color: ${ink};">Betaal uiterlijk ${escapeHtml(betalen.uiterlijk)}</p>
<table role="presentation" cellpadding="0" cellspacing="0">
${betaalRij('Bedrag', betalen.bedrag)}
${betaalRij('Rekening', betalen.iban, true)}
${betaalRij('Op naam van', betalen.begunstigde)}
${betaalRij('Mededeling', betalen.mededeling, true)}
</table>
<p style="margin: 14px 0 0; ${font} font-size: 14px; line-height: 1.5; color: ${ink};">Gebruik precies deze mededeling, dan vinden we je betaling meteen terug.</p>
${cash}
</td></tr></table>
<p style="margin: 0 0 4px; ${font} font-size: 16px; font-weight: 700; color: #101828;">Afhalen</p>
${paragraph(`${escapeHtml(data.afhaalLabel)}<br>${escapeHtml(data.afhaalPlaats)}`)}
<p style="margin: 0 0 16px;">${knop(data.link, 'Bekijk of annuleer je bestelling', true)}</p>
<p style="margin: 0; ${font} font-size: 13px; line-height: 1.5; color: ${quiet};">${annuleren}Vragen? Antwoord gewoon op deze mail.</p>`);

  const textBody = `Bedankt voor je bestelling voor de ${data.titel.toLowerCase()} (nr. ${data.nummer})!

${regelTekst(data.regels)}
Totaal: ${data.totaal}

Betaal uiterlijk ${betalen.uiterlijk}
Bedrag: ${betalen.bedrag}
Rekening: ${betalen.iban}
Op naam van: ${betalen.begunstigde}
Mededeling: ${betalen.mededeling}
Gebruik precies deze mededeling, dan vinden we je betaling meteen terug.${betalen.cash ? `\n${cashTekst}` : ''}

Afhalen: ${data.afhaalLabel}, ${data.afhaalPlaats}
Zodra je betaling binnen is, krijg je een tweede mail met je afhaalcode.

Bekijk of annuleer je bestelling: ${data.link}
${annuleren}Vragen? Antwoord gewoon op deze mail.`;

  return {subject, html, text: textBody};
}

/** Mail 2: paid (or free), with the QR code as an inline image `cid:afhaalcode`. */
export function afhaalcodeMail(data: BestelMailData, korteCode: string, gratis: boolean): {subject: string; html: string; text: string} {
  const titel = data.titel.toLowerCase();
  const subject = gratis ? `Je bestelling voor de ${titel} is bevestigd` : `Betaling ontvangen: je afhaalcode voor de ${titel}`;
  const kop = gratis ? 'Je bestelling is bevestigd. Tot bij het afhalen!' : 'Je betaling is binnen. Tot bij het afhalen!';
  const regels = data.regels.map(regel => `${regel.aantal} × ${escapeHtml(regel.naam)}`).join(' · ');

  const html = frame(data, `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<p style="margin: 0 0 16px;"><span style="display: inline-block; padding: 4px 14px; ${font} font-size: 14px; font-weight: 700; color: ${ink}; background: #8ec63f; border: 2px solid ${ink}; border-radius: 9999px;">${gratis ? 'Bevestigd' : 'Betaald'}</span></p>
<h1 style="margin: 0 0 16px; ${font} font-size: 28px; line-height: 1.15; font-weight: 800; color: ${ink};">${kop}</h1>
${paragraph('Toon deze code bij het afhalen, op je telefoon of op papier. Wie je bestelling ophaalt, mag ook deze mail tonen.')}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 18px; border: 3px solid ${ink}; border-radius: 22px;"><tr><td style="padding: 14px; background: #ffffff; border-radius: 20px;">
<img src="cid:afhaalcode" alt="QR-code om je bestelling af te halen" width="240" height="240" style="display: block; width: 240px; height: 240px; border: 0;">
</td></tr></table>
<p style="margin: 0; ${font} font-size: 13px; color: ${quiet};">Lukt scannen niet? Geef deze code:</p>
<p style="margin: 2px 0 22px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 30px; font-weight: 800; letter-spacing: 0.08em; color: ${ink};">${escapeHtml(korteCode)}</p>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 22px; background: #fdf2f8; border: 2px solid ${ink}; border-radius: 18px;"><tr><td style="padding: 18px 20px;">
<p style="margin: 0 0 6px; ${font} font-size: 18px; font-weight: 800; color: ${ink};">${escapeHtml(data.afhaalLabel)}</p>
<p style="margin: 0 0 8px; ${font} font-size: 16px; color: ${text};">${escapeHtml(data.afhaalPlaats)}</p>
<p style="margin: 0; ${font} font-size: 16px; color: #101828;">${regels}</p>
</td></tr></table>
<p style="margin: 0;">${knop(data.link, 'Bekijk je bestelling online', false)}</p>`);

  const textBody = `${kop}

Toon je QR-code of deze code bij het afhalen: ${korteCode}
Je QR-code staat ook op ${data.link}

Afhalen: ${data.afhaalLabel}, ${data.afhaalPlaats}
${data.regels.map(regel => `${regel.aantal} × ${regel.naam}`).join('\n')}`;

  return {subject, html, text: textBody};
}
