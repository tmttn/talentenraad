
import 'dotenv/config';

const WRITE_BASE_URL = 'https://builder.io/api/v1/write';
const builderPrivateKey = process.env.BUILDER_PRIVATE_KEY ?? '';

type BuilderBlock = {
  '@type': string;
  component?: {
    name: string;
    options: Record<string, unknown>;
  };
  responsiveStyles?: Record<string, Record<string, string>>;
  children?: BuilderBlock[];
};

type PageData = {
  url: string;
  title: string;
  blocks: BuilderBlock[];
};

async function createPage(name: string, data: PageData): Promise<void> {
  const url = `${WRITE_BASE_URL}/page`;

  const body = {
    name,
    published: 'published',
    data,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${builderPrivateKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create page "${name}": ${error}`);
  }

  const result = await response.json();
  console.log(`✓ Created page: ${name} (ID: ${result.id})`);
}

function createTextBlock(html: string, styles?: Record<string, string>): BuilderBlock {
  return {
    '@type': '@builder.io/sdk:Element',
    component: {
      name: 'Text',
      options: {
        text: html,
      },
    },
    responsiveStyles: {
      large: {
        marginBottom: '25px',
        ...styles,
      },
    },
  };
}

function createPageWrapper(children: BuilderBlock[]): BuilderBlock {
  return {
    '@type': '@builder.io/sdk:Element',
    component: {
      name: 'Box',
      options: {},
    },
    responsiveStyles: {
      large: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
      },
    },
    children,
  };
}

// Privacy Policy based on Belgian GDPR requirements (Article 13)
async function createPrivacyPolicy(): Promise<void> {
  const blocks = [
    createPageWrapper([
      createTextBlock('<h1 style="font-size: 2.5rem; font-weight: bold; color: #1f2937;">Privacybeleid</h1>', {marginBottom: '10px'}),
      createTextBlock('<p style="color: #6b7280; font-style: italic;">Laatst bijgewerkt: 17 december 2025</p>', {marginBottom: '30px'}),

      createTextBlock(`
				<p style="color: #4b5563; line-height: 1.7;">Dit privacybeleid beschrijft hoe de Talentenraad uw persoonsgegevens verzamelt, gebruikt en beschermt in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG/GDPR) en de Belgische Wet van 30 juli 2018 betreffende de bescherming van natuurlijke personen met betrekking tot de verwerking van persoonsgegevens.</p>
			`),

      // Article 13(1)(a) - Identity and contact details
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">1. Verwerkingsverantwoordelijke</h2>
				<p style="color: #4b5563; line-height: 1.7;">De verwerkingsverantwoordelijke voor uw persoonsgegevens is:</p>
				<div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 10px;">
					<p style="color: #4b5563; line-height: 1.7; margin: 0;">
						<strong>Talentenraad</strong> (Ouderraad van Het Talentenhuis)<br>
						Zonhoevestraat 32<br>
						3740 Bilzen-Hoeselt<br>
						België<br><br>
						E-mail: <a href="mailto:voorzitterouderraad@talentenhuis.be" style="color: #ec4899;">voorzitterouderraad@talentenhuis.be</a>
					</p>
				</div>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 15px;">De Talentenraad is een vrijwilligersorganisatie zonder rechtspersoonlijkheid. Vanwege de beperkte omvang van onze gegevensverwerking hebben wij geen Functionaris Gegevensbescherming (DPO) aangesteld. U kunt voor alle privacygerelateerde vragen contact opnemen via bovenstaand e-mailadres.</p>
			`),

      // Article 13(1)(c) - Purposes and legal basis
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">2. Welke gegevens verwerken wij en waarom?</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij verwerken de volgende categorieën persoonsgegevens voor de onderstaande doeleinden en rechtsgronden:</p>

				<h3 style="font-size: 1.1rem; font-weight: 600; color: #374151; margin-top: 20px; margin-bottom: 10px;">Contactformulier</h3>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px;">
					<li><strong>Gegevens:</strong> Naam, e-mailadres, bericht</li>
					<li><strong>Doel:</strong> Beantwoorden van uw vragen</li>
					<li><strong>Rechtsgrond:</strong> Toestemming (Art. 6(1)(a) AVG)</li>
				</ul>

				<h3 style="font-size: 1.1rem; font-weight: 600; color: #374151; margin-top: 20px; margin-bottom: 10px;">Inschrijving activiteiten</h3>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px;">
					<li><strong>Gegevens:</strong> Naam ouder/verzorger, e-mailadres, telefoonnummer, naam en klas kind(eren), eventuele dieetvoorkeuren of allergieën</li>
					<li><strong>Doel:</strong> Organisatie en uitvoering van schoolactiviteiten</li>
					<li><strong>Rechtsgrond:</strong> Uitvoering van een overeenkomst (Art. 6(1)(b) AVG)</li>
				</ul>

				<h3 style="font-size: 1.1rem; font-weight: 600; color: #374151; margin-top: 20px; margin-bottom: 10px;">Website analytics</h3>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px;">
					<li><strong>Gegevens:</strong> Geanonimiseerde bezoekersstatistieken (geen IP-adressen of persoonlijke identificatiegegevens)</li>
					<li><strong>Doel:</strong> Verbetering van de website</li>
					<li><strong>Rechtsgrond:</strong> Toestemming (Art. 6(1)(a) AVG)</li>
				</ul>
			`),

      // Article 13(1)(e) - Recipients
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">3. Met wie delen wij uw gegevens?</h2>
				<p style="color: #4b5563; line-height: 1.7;">Uw persoonsgegevens kunnen worden gedeeld met de volgende ontvangers:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Vercel Inc.</strong> (VS) - Hosting van onze website en analytische diensten. Vercel voldoet aan de EU-US Data Privacy Framework.</li>
					<li><strong>Builder.io</strong> (VS) - Content management systeem. Gegevens worden verwerkt conform hun privacybeleid.</li>
					<li><strong>Bestuursleden Talentenraad</strong> - Voor het beantwoorden van vragen en organiseren van activiteiten</li>
					<li><strong>School Het Talentenhuis</strong> - Alleen indien noodzakelijk voor de organisatie van gezamenlijke activiteiten</li>
				</ul>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 15px;"><strong>Wij verkopen uw gegevens nooit aan derden.</strong></p>
			`),

      // Article 13(1)(f) - International transfers
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">4. Doorgifte buiten de EER</h2>
				<p style="color: #4b5563; line-height: 1.7;">Sommige van onze dienstverleners zijn gevestigd in de Verenigde Staten. Deze doorgiften vinden plaats op basis van:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Het EU-US Data Privacy Framework (voor gecertificeerde organisaties)</li>
					<li>Standaardcontractbepalingen (SCCs) goedgekeurd door de Europese Commissie</li>
				</ul>
			`),

      // Article 13(2)(a) - Retention periods
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">5. Hoe lang bewaren wij uw gegevens?</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn verzameld:</p>
				<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
					<tr style="background: #f9fafb;">
						<th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb; color: #374151;">Gegevens</th>
						<th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb; color: #374151;">Bewaartermijn</th>
					</tr>
					<tr>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Contactformulier berichten</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">1 jaar na afhandeling vraag</td>
					</tr>
					<tr style="background: #f9fafb;">
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Activiteiteninschrijvingen</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">1 jaar na datum activiteit</td>
					</tr>
					<tr>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Website analytics</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">26 maanden (geanonimiseerd)</td>
					</tr>
				</table>
			`),

      // Article 13(2)(b)(c)(d) - Rights
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">6. Uw rechten</h2>
				<p style="color: #4b5563; line-height: 1.7;">Op grond van de AVG heeft u de volgende rechten:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Recht op inzage (Art. 15):</strong> U kunt een kopie opvragen van de persoonsgegevens die wij van u verwerken.</li>
					<li><strong>Recht op rectificatie (Art. 16):</strong> U kunt verzoeken om onjuiste of onvolledige gegevens te corrigeren.</li>
					<li><strong>Recht op gegevenswissing (Art. 17):</strong> U kunt verzoeken om uw gegevens te verwijderen ("recht om vergeten te worden").</li>
					<li><strong>Recht op beperking (Art. 18):</strong> U kunt verzoeken om de verwerking van uw gegevens te beperken.</li>
					<li><strong>Recht op overdraagbaarheid (Art. 20):</strong> U kunt uw gegevens in een gestructureerd, gangbaar formaat ontvangen.</li>
					<li><strong>Recht van bezwaar (Art. 21):</strong> U kunt bezwaar maken tegen de verwerking van uw gegevens.</li>
					<li><strong>Recht om toestemming in te trekken (Art. 7(3)):</strong> Waar verwerking op toestemming is gebaseerd, kunt u deze op elk moment intrekken. Dit heeft geen invloed op de rechtmatigheid van de verwerking vóór de intrekking.</li>
				</ul>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 15px;">Om uw rechten uit te oefenen, kunt u contact opnemen via <a href="mailto:voorzitterouderraad@talentenhuis.be" style="color: #ec4899;">voorzitterouderraad@talentenhuis.be</a>. Wij reageren binnen 30 dagen op uw verzoek.</p>
			`),

      // Article 13(2)(e) - Statutory/contractual requirement
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">7. Verplichte gegevens</h2>
				<p style="color: #4b5563; line-height: 1.7;">Het verstrekken van persoonsgegevens is niet wettelijk of contractueel verplicht. Echter:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Zonder uw contactgegevens kunnen wij niet reageren op uw vraag via het contactformulier.</li>
					<li>Zonder de benodigde gegevens kunt u of uw kind niet deelnemen aan activiteiten.</li>
				</ul>
			`),

      // Article 13(2)(f) - Automated decision-making
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">8. Geautomatiseerde besluitvorming</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij maken geen gebruik van geautomatiseerde besluitvorming of profilering die rechtsgevolgen heeft voor u of u anderszins aanmerkelijk treft.</p>
			`),

      // Security measures
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">9. Beveiliging</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen tegen ongeautoriseerde toegang, verlies of misbruik:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>SSL/TLS-versleuteling (HTTPS) voor alle dataoverdracht</li>
					<li>Beperkte toegang tot gegevens voor geautoriseerde bestuursleden</li>
					<li>Veilige hosting bij Vercel met adequate beveiligingsmaatregelen</li>
				</ul>
			`),

      // Article 13(2)(d) - Right to lodge complaint
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">10. Klachten</h2>
				<p style="color: #4b5563; line-height: 1.7;">Bent u niet tevreden over de manier waarop wij met uw persoonsgegevens omgaan? Neem dan eerst contact met ons op. U heeft ook het recht om een klacht in te dienen bij de toezichthoudende autoriteit:</p>
				<div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 10px;">
					<p style="color: #4b5563; line-height: 1.7; margin: 0;">
						<strong>Gegevensbeschermingsautoriteit (GBA)</strong><br>
						Drukpersstraat 35<br>
						1000 Brussel<br>
						Tel: +32 (0)2 274 48 00<br>
						E-mail: <a href="mailto:contact@apd-gba.be" style="color: #ec4899;">contact@apd-gba.be</a><br>
						Website: <a href="https://www.gegevensbeschermingsautoriteit.be" style="color: #ec4899;" target="_blank" rel="noopener">www.gegevensbeschermingsautoriteit.be</a>
					</p>
				</div>
			`),

      // Changes
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">11. Wijzigingen</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij kunnen dit privacybeleid van tijd tot tijd wijzigen. De actuele versie is altijd beschikbaar op deze pagina met vermelding van de datum van de laatste wijziging. Bij belangrijke wijzigingen zullen wij dit kenbaar maken via onze website.</p>
			`),
    ]),
  ];

  await createPage('Privacybeleid', {
    url: '/privacybeleid',
    title: 'Privacybeleid - Talentenraad',
    blocks,
  });
}

// Cookie Policy based on Belgian DPA requirements
async function createCookiePolicy(): Promise<void> {
  const blocks = [
    createPageWrapper([
      createTextBlock('<h1 style="font-size: 2.5rem; font-weight: bold; color: #1f2937;">Cookiebeleid</h1>', {marginBottom: '10px'}),
      createTextBlock('<p style="color: #6b7280; font-style: italic;">Laatst bijgewerkt: 17 december 2025</p>', {marginBottom: '30px'}),

      createTextBlock(`
				<p style="color: #4b5563; line-height: 1.7;">Dit cookiebeleid legt uit hoe de Talentenraad cookies en vergelijkbare technologieën gebruikt op onze website talentenraad.be, in overeenstemming met de Belgische wetgeving inzake elektronische communicatie en de richtlijnen van de Gegevensbeschermingsautoriteit (GBA).</p>
			`),

      // Controller identity (Belgian DPA requirement)
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">1. Verwerkingsverantwoordelijke</h2>
				<div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
					<p style="color: #4b5563; line-height: 1.7; margin: 0;">
						<strong>Talentenraad</strong> (Ouderraad van Het Talentenhuis)<br>
						Zonhoevestraat 32, 3740 Bilzen-Hoeselt<br>
						E-mail: <a href="mailto:voorzitterouderraad@talentenhuis.be" style="color: #ec4899;">voorzitterouderraad@talentenhuis.be</a>
					</p>
				</div>
			`),

      // What are cookies
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">2. Wat zijn cookies?</h2>
				<p style="color: #4b5563; line-height: 1.7;">Cookies zijn kleine tekstbestanden die op uw apparaat (computer, tablet, smartphone) worden opgeslagen wanneer u een website bezoekt. Ze worden veel gebruikt om websites te laten functioneren of efficiënter te maken, en om informatie te verstrekken aan de eigenaars van de website.</p>
			`),

      // Types of cookies with details (Belgian DPA requirement)
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">3. Welke cookies gebruiken wij?</h2>

				<h3 style="font-size: 1.2rem; font-weight: 600; color: #374151; margin-top: 25px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #ec4899;">Strikt noodzakelijke cookies</h3>
				<p style="color: #4b5563; line-height: 1.7;">Deze cookies zijn essentieel voor het functioneren van de website. Hiervoor is geen toestemming vereist.</p>
				<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
					<tr style="background: #f9fafb;">
						<th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb; color: #374151; width: 25%;">Naam</th>
						<th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb; color: #374151; width: 40%;">Doel</th>
						<th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb; color: #374151; width: 20%;">Bewaartermijn</th>
						<th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb; color: #374151; width: 15%;">Partij</th>
					</tr>
					<tr>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">cookie-consent</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Onthoudt uw cookievoorkeuren</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">1 jaar</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Eerste partij</td>
					</tr>
					<tr style="background: #f9fafb;">
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">cookie-preferences</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Slaat gedetailleerde voorkeuren op</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">1 jaar</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Eerste partij</td>
					</tr>
				</table>
				<p style="color: #6b7280; font-size: 0.9rem; margin-top: 10px;"><strong>Rechtsgrond:</strong> Legitiem belang - noodzakelijk voor de werking van de website (Art. 6(1)(f) AVG)</p>

				<h3 style="font-size: 1.2rem; font-weight: 600; color: #374151; margin-top: 25px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #ec4899;">Analytische cookies</h3>
				<p style="color: #4b5563; line-height: 1.7;">Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken. <strong>Deze cookies worden alleen geplaatst na uw uitdrukkelijke toestemming.</strong></p>
				<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
					<tr style="background: #f9fafb;">
						<th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb; color: #374151; width: 25%;">Naam</th>
						<th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb; color: #374151; width: 40%;">Doel</th>
						<th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb; color: #374151; width: 20%;">Bewaartermijn</th>
						<th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb; color: #374151; width: 15%;">Partij</th>
					</tr>
					<tr>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Vercel Analytics</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Verzamelt geanonimiseerde bezoekersstatistieken (paginaweergaven, verwijzingen). Geen persoonlijke identificatie.</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Sessie</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Derde partij (Vercel)</td>
					</tr>
					<tr style="background: #f9fafb;">
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Vercel Speed Insights</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Meet laadtijden en prestaties van pagina's voor optimalisatie.</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Sessie</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; color: #4b5563;">Derde partij (Vercel)</td>
					</tr>
				</table>
				<p style="color: #6b7280; font-size: 0.9rem; margin-top: 10px;"><strong>Rechtsgrond:</strong> Toestemming (Art. 6(1)(a) AVG)</p>
			`),

      // Third-party access (Belgian DPA requirement)
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">4. Derde partijen met toegang tot cookies</h2>
				<p style="color: #4b5563; line-height: 1.7;">De volgende derde partijen kunnen gegevens ontvangen via cookies op onze website:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Vercel Inc.</strong> (Verenigde Staten) - Onze hostingprovider. Vercel verwerkt analytische gegevens namens ons. Meer informatie: <a href="https://vercel.com/legal/privacy-policy" style="color: #ec4899;" target="_blank" rel="noopener">Vercel Privacy Policy</a></li>
				</ul>
			`),

      // Consent management
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">5. Uw toestemming beheren</h2>
				<p style="color: #4b5563; line-height: 1.7;">Bij uw eerste bezoek aan onze website verschijnt een cookiebanner waarin wij uw toestemming vragen voor niet-noodzakelijke cookies.</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;"><strong>U kunt uw keuze op elk moment wijzigen</strong> door te klikken op de link "Cookie-instellingen" onderaan elke pagina van onze website.</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">U heeft de volgende opties:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Accepteren:</strong> Alle cookies worden geplaatst</li>
					<li><strong>Weigeren:</strong> Alleen strikt noodzakelijke cookies worden geplaatst</li>
				</ul>
			`),

      // How to delete cookies (Belgian DPA requirement)
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">6. Cookies verwijderen via uw browser</h2>
				<p style="color: #4b5563; line-height: 1.7;">U kunt ook cookies beheren of verwijderen via de instellingen van uw browser:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Chrome:</strong> Instellingen → Privacy en beveiliging → Cookies en andere sitegegevens</li>
					<li><strong>Firefox:</strong> Instellingen → Privacy & Beveiliging → Cookies en sitegegevens</li>
					<li><strong>Safari:</strong> Voorkeuren → Privacy → Websitegegevens beheren</li>
					<li><strong>Edge:</strong> Instellingen → Cookies en sitemachtigingen → Cookies beheren en verwijderen</li>
				</ul>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 15px;"><strong>Let op:</strong> Het verwijderen of blokkeren van cookies kan invloed hebben op de werking van onze website.</p>
			`),

      // User rights
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">7. Uw rechten</h2>
				<p style="color: #4b5563; line-height: 1.7;">Met betrekking tot de gegevens die via cookies worden verzameld, heeft u de volgende rechten:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Recht op informatie over welke gegevens worden verzameld</li>
					<li>Recht om uw toestemming in te trekken</li>
					<li>Recht om een klacht in te dienen bij de Gegevensbeschermingsautoriteit</li>
				</ul>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 15px;">Voor meer informatie over uw privacyrechten, zie ons <a href="/privacybeleid" style="color: #ec4899;">privacybeleid</a>.</p>
			`),

      // Contact
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">8. Contact</h2>
				<p style="color: #4b5563; line-height: 1.7;">Heeft u vragen over ons cookiebeleid? Neem contact met ons op via <a href="mailto:voorzitterouderraad@talentenhuis.be" style="color: #ec4899;">voorzitterouderraad@talentenhuis.be</a>.</p>
			`),

      // Changes
      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">9. Wijzigingen</h2>
				<p style="color: #4b5563; line-height: 1.7;">Dit cookiebeleid kan worden aangepast. Controleer deze pagina regelmatig voor de meest actuele versie. De datum van de laatste wijziging staat bovenaan vermeld.</p>
			`),
    ]),
  ];

  await createPage('Cookiebeleid', {
    url: '/cookiebeleid',
    title: 'Cookiebeleid - Talentenraad',
    blocks,
  });
}

// Terms of Service
async function createTermsOfService(): Promise<void> {
  const blocks = [
    createPageWrapper([
      createTextBlock('<h1 style="font-size: 2.5rem; font-weight: bold; color: #1f2937;">Algemene Voorwaarden</h1>', {marginBottom: '10px'}),
      createTextBlock('<p style="color: #6b7280; font-style: italic;">Laatst bijgewerkt: 17 december 2025</p>', {marginBottom: '30px'}),

      createTextBlock(`
				<p style="color: #4b5563; line-height: 1.7;">Deze algemene voorwaarden zijn van toepassing op het gebruik van de website talentenraad.be en deelname aan activiteiten georganiseerd door de Talentenraad, de ouderraad van basisschool Het Talentenhuis.</p>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">1. Identiteit</h2>
				<div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
					<p style="color: #4b5563; line-height: 1.7; margin: 0;">
						<strong>Talentenraad</strong><br>
						Ouderraad van Het Talentenhuis<br>
						Zonhoevestraat 32<br>
						3740 Bilzen-Hoeselt<br>
						België<br><br>
						E-mail: <a href="mailto:voorzitterouderraad@talentenhuis.be" style="color: #ec4899;">voorzitterouderraad@talentenhuis.be</a>
					</p>
				</div>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 15px;">De Talentenraad is een vrijwilligersorganisatie zonder rechtspersoonlijkheid, verbonden aan basisschool Het Talentenhuis.</p>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">2. Doel van de website</h2>
				<p style="color: #4b5563; line-height: 1.7;">Deze website heeft als doel:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Ouders en verzorgers te informeren over activiteiten en nieuws van de Talentenraad</li>
					<li>Inschrijvingen voor activiteiten te faciliteren</li>
					<li>Contact mogelijk te maken tussen ouders en de ouderraad</li>
					<li>Informatie te delen over de werking van de ouderraad</li>
				</ul>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">3. Intellectuele eigendom</h2>
				<p style="color: #4b5563; line-height: 1.7;">Alle content op deze website, waaronder teksten, afbeeldingen, logo's, grafische elementen en software, is eigendom van de Talentenraad of wordt gebruikt met toestemming van de rechthebbenden.</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">Het is niet toegestaan om zonder voorafgaande schriftelijke toestemming:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Content te kopiëren, reproduceren of verspreiden</li>
					<li>Content te wijzigen of er afgeleide werken van te maken</li>
					<li>Content voor commerciële doeleinden te gebruiken</li>
				</ul>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">4. Aansprakelijkheid</h2>
				<p style="color: #4b5563; line-height: 1.7;">De Talentenraad streeft ernaar correcte en actuele informatie te verstrekken, maar kan niet garanderen dat alle informatie te allen tijde volledig, juist en up-to-date is.</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;"><strong>De Talentenraad is niet aansprakelijk voor:</strong></p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Eventuele fouten, onvolledigheden of verouderde informatie op de website</li>
					<li>Directe of indirecte schade voortvloeiend uit het gebruik van de website</li>
					<li>De inhoud van externe websites waarnaar wordt verwezen</li>
					<li>Technische storingen, onderbrekingen of onbeschikbaarheid van de website</li>
					<li>Ongeautoriseerde toegang tot of wijziging van gegevens door derden</li>
				</ul>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">5. Activiteiten en inschrijvingen</h2>
				<p style="color: #4b5563; line-height: 1.7;">Bij inschrijving voor activiteiten georganiseerd door de Talentenraad gelden de volgende voorwaarden:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Inschrijvingen zijn persoonlijk en niet overdraagbaar, tenzij anders vermeld</li>
					<li>Door inschrijving verklaart u akkoord te gaan met deze voorwaarden</li>
					<li>De Talentenraad behoudt het recht om activiteiten te wijzigen, uit te stellen of te annuleren</li>
					<li>Bij annulering door de Talentenraad worden eventuele vooraf betaalde bijdragen teruggestort</li>
					<li>Annulering door deelnemers dient zo spoedig mogelijk te worden gemeld</li>
					<li>Deelname aan activiteiten geschiedt op eigen risico van de deelnemer/ouder</li>
				</ul>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">6. Gedragsregels</h2>
				<p style="color: #4b5563; line-height: 1.7;">Bij het gebruik van de website en deelname aan activiteiten verwachten wij dat u:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Respectvol omgaat met andere ouders, kinderen, leerkrachten en vrijwilligers</li>
					<li>Geen aanstootgevende, discriminerende of illegale content verspreidt</li>
					<li>Geen spam of ongewenste commerciële berichten verstuurt</li>
					<li>De privacy van anderen respecteert</li>
					<li>Geen valse of misleidende informatie verstrekt</li>
				</ul>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">De Talentenraad behoudt het recht om personen die deze regels overtreden uit te sluiten van activiteiten.</p>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">7. Privacy</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij respecteren uw privacy en verwerken persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG/GDPR). Voor meer informatie verwijzen wij naar ons <a href="/privacybeleid" style="color: #ec4899;">privacybeleid</a>.</p>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">8. Cookies</h2>
				<p style="color: #4b5563; line-height: 1.7;">Deze website maakt gebruik van cookies. Voor meer informatie over welke cookies wij gebruiken en hoe u deze kunt beheren, verwijzen wij naar ons <a href="/cookiebeleid" style="color: #ec4899;">cookiebeleid</a>.</p>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">9. Wijzigingen</h2>
				<p style="color: #4b5563; line-height: 1.7;">De Talentenraad behoudt het recht om deze algemene voorwaarden te allen tijde te wijzigen. Wijzigingen worden op deze pagina gepubliceerd met vermelding van de datum van de laatste wijziging.</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">Door na een wijziging gebruik te blijven maken van de website, accepteert u de gewijzigde voorwaarden.</p>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">10. Toepasselijk recht en geschillen</h2>
				<p style="color: #4b5563; line-height: 1.7;">Op deze algemene voorwaarden en het gebruik van de website is <strong>Belgisch recht</strong> van toepassing.</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">Bij geschillen zullen partijen eerst trachten in onderling overleg tot een oplossing te komen. Indien dit niet lukt, zijn de rechtbanken van het gerechtelijk arrondissement Limburg bevoegd.</p>
			`),

      createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">11. Contact</h2>
				<p style="color: #4b5563; line-height: 1.7;">Heeft u vragen over deze algemene voorwaarden? Neem contact met ons op:</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">
					E-mail: <a href="mailto:voorzitterouderraad@talentenhuis.be" style="color: #ec4899;">voorzitterouderraad@talentenhuis.be</a>
				</p>
			`),
    ]),
  ];

  await createPage('Algemene Voorwaarden', {
    url: '/algemene-voorwaarden',
    title: 'Algemene Voorwaarden - Talentenraad',
    blocks,
  });
}

async function main(): Promise<void> {
  if (!builderPrivateKey) {
    console.error('Error: BUILDER_PRIVATE_KEY is not set');
    process.exit(1);
  }

  console.log('Creating legal pages in Builder.io...\n');

  try {
    await createPrivacyPolicy();
    await createCookiePolicy();
    await createTermsOfService();
    console.log('\n✓ All legal pages created successfully!');
  } catch (error) {
    console.error('Error creating pages:', error);
    process.exit(1);
  }
}

main();
