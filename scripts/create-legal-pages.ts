/* eslint-disable n/prefer-global/process */
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

async function createPrivacyPolicy(): Promise<void> {
	const blocks = [
		createPageWrapper([
			createTextBlock('<h1 style="font-size: 2.5rem; font-weight: bold; color: #1f2937;">Privacybeleid</h1>', {marginBottom: '10px'}),
			createTextBlock('<p style="color: #6b7280; font-style: italic;">Laatst bijgewerkt: december 2024</p>', {marginBottom: '30px'}),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">1. Wie zijn wij?</h2>
				<p style="color: #4b5563; line-height: 1.7;">De Talentenraad is de ouderraad van basisschool Het Talentenhuis, gevestigd aan de Zonhoevestraat 32, 3740 Bilzen-Hoeselt. Wij zijn verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in dit privacybeleid.</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;"><strong>Contactgegevens:</strong><br>E-mail: voorzitterouderraad@talentenhuis.be</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">2. Welke gegevens verzamelen wij?</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij verzamelen en verwerken de volgende persoonsgegevens:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Contactformulier:</strong> Naam, e-mailadres en uw bericht</li>
					<li><strong>Nieuwsbriefinschrijving:</strong> E-mailadres</li>
					<li><strong>Activiteiteninschrijving:</strong> Naam, e-mailadres, telefoonnummer, naam en klas van uw kind(eren)</li>
					<li><strong>Analytische gegevens:</strong> Geanonimiseerde gegevens over websitegebruik via Vercel Analytics</li>
				</ul>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">3. Waarom verzamelen wij deze gegevens?</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij gebruiken uw persoonsgegevens voor:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Het beantwoorden van uw vragen via het contactformulier</li>
					<li>Het versturen van nieuwsbrieven en updates over activiteiten</li>
					<li>Het organiseren en beheren van schoolactiviteiten</li>
					<li>Het verbeteren van onze website en dienstverlening</li>
				</ul>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">4. Hoe lang bewaren wij uw gegevens?</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij bewaren uw persoonsgegevens niet langer dan strikt noodzakelijk:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Contactformulierberichten:</strong> Maximaal 1 jaar na afhandeling</li>
					<li><strong>Nieuwsbriefabonnementen:</strong> Tot u zich uitschrijft</li>
					<li><strong>Activiteitenregistraties:</strong> Maximaal 1 jaar na de activiteit</li>
					<li><strong>Analytische gegevens:</strong> Maximaal 26 maanden (geanonimiseerd)</li>
				</ul>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">5. Delen wij uw gegevens met derden?</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij delen uw persoonsgegevens alleen met derden indien dit noodzakelijk is voor de uitvoering van onze diensten:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Vercel:</strong> Voor hosting en analytics van onze website</li>
					<li><strong>Builder.io:</strong> Voor content management</li>
				</ul>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">Wij verkopen uw gegevens nooit aan derden.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">6. Uw rechten</h2>
				<p style="color: #4b5563; line-height: 1.7;">U heeft de volgende rechten met betrekking tot uw persoonsgegevens:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Inzagerecht:</strong> U kunt opvragen welke gegevens wij van u hebben</li>
					<li><strong>Recht op rectificatie:</strong> U kunt onjuiste gegevens laten corrigeren</li>
					<li><strong>Recht op verwijdering:</strong> U kunt vragen om uw gegevens te verwijderen</li>
					<li><strong>Recht op beperking:</strong> U kunt de verwerking van uw gegevens beperken</li>
					<li><strong>Recht op overdraagbaarheid:</strong> U kunt uw gegevens in een leesbaar formaat ontvangen</li>
					<li><strong>Recht van bezwaar:</strong> U kunt bezwaar maken tegen de verwerking</li>
				</ul>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">Om uw rechten uit te oefenen, kunt u contact met ons opnemen via voorzitterouderraad@talentenhuis.be.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">7. Beveiliging</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen tegen verlies, misbruik en ongeautoriseerde toegang. Onze website maakt gebruik van een beveiligde HTTPS-verbinding.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">8. Klachten</h2>
				<p style="color: #4b5563; line-height: 1.7;">Heeft u een klacht over de verwerking van uw persoonsgegevens? Neem dan eerst contact met ons op. U kunt ook een klacht indienen bij de Gegevensbeschermingsautoriteit (GBA):</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">
					Gegevensbeschermingsautoriteit<br>
					Drukpersstraat 35, 1000 Brussel<br>
					contact@apd-gba.be<br>
					www.gegevensbeschermingsautoriteit.be
				</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">9. Wijzigingen</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij kunnen dit privacybeleid van tijd tot tijd aanpassen. De meest actuele versie is altijd beschikbaar op deze pagina. Bij belangrijke wijzigingen zullen wij u hierover informeren via onze website of nieuwsbrief.</p>
			`),
		]),
	];

	await createPage('Privacybeleid', {
		url: '/privacybeleid',
		title: 'Privacybeleid - Talentenraad',
		blocks,
	});
}

async function createCookiePolicy(): Promise<void> {
	const blocks = [
		createPageWrapper([
			createTextBlock('<h1 style="font-size: 2.5rem; font-weight: bold; color: #1f2937;">Cookiebeleid</h1>', {marginBottom: '10px'}),
			createTextBlock('<p style="color: #6b7280; font-style: italic;">Laatst bijgewerkt: december 2024</p>', {marginBottom: '30px'}),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">1. Wat zijn cookies?</h2>
				<p style="color: #4b5563; line-height: 1.7;">Cookies zijn kleine tekstbestanden die op uw computer, tablet of smartphone worden opgeslagen wanneer u onze website bezoekt. Ze helpen ons om de website goed te laten functioneren en om uw voorkeuren te onthouden.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">2. Welke cookies gebruiken wij?</h2>
				<p style="color: #4b5563; line-height: 1.7;">Onze website maakt gebruik van de volgende soorten cookies:</p>

				<h3 style="font-size: 1.2rem; font-weight: 600; color: #374151; margin-top: 20px; margin-bottom: 10px;">Noodzakelijke cookies</h3>
				<p style="color: #4b5563; line-height: 1.7;">Deze cookies zijn essentieel voor het functioneren van de website. Zonder deze cookies werkt de website niet naar behoren.</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>cookie-consent:</strong> Onthoudt uw cookievoorkeuren (1 jaar)</li>
					<li><strong>cookie-preferences:</strong> Slaat uw gedetailleerde cookievoorkeuren op (1 jaar)</li>
				</ul>

				<h3 style="font-size: 1.2rem; font-weight: 600; color: #374151; margin-top: 20px; margin-bottom: 10px;">Analytische cookies</h3>
				<p style="color: #4b5563; line-height: 1.7;">Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken. De gegevens worden geanonimiseerd verzameld.</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Vercel Analytics:</strong> Verzamelt geanonimiseerde gegevens over paginabezoeken en gebruikersgedrag om de website te verbeteren</li>
					<li><strong>Vercel Speed Insights:</strong> Meet de laadsnelheid van pagina's om de prestaties te optimaliseren</li>
				</ul>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">3. Cookies van derden</h2>
				<p style="color: #4b5563; line-height: 1.7;">Onze website kan cookies bevatten van derde partijen:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Vercel:</strong> Onze hostingprovider plaatst analytische cookies om websitestatistieken te verzamelen</li>
					<li><strong>Builder.io:</strong> Ons content management systeem kan technische cookies plaatsen</li>
				</ul>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">4. Uw cookievoorkeuren beheren</h2>
				<p style="color: #4b5563; line-height: 1.7;">Bij uw eerste bezoek aan onze website vragen wij uw toestemming voor het plaatsen van cookies. U kunt uw voorkeuren op elk moment wijzigen via de "Cookie-instellingen" link in de footer van onze website.</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">U kunt ook cookies beheren of verwijderen via uw browserinstellingen. Houd er rekening mee dat het uitschakelen van bepaalde cookies de functionaliteit van de website kan beïnvloeden.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">5. Cookies verwijderen</h2>
				<p style="color: #4b5563; line-height: 1.7;">U kunt cookies verwijderen via uw browserinstellingen:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li><strong>Chrome:</strong> Instellingen → Privacy en beveiliging → Browsegegevens wissen</li>
					<li><strong>Firefox:</strong> Instellingen → Privacy & Beveiliging → Cookies en sitegegevens → Gegevens wissen</li>
					<li><strong>Safari:</strong> Voorkeuren → Privacy → Websitegegevens beheren</li>
					<li><strong>Edge:</strong> Instellingen → Privacy, zoeken en services → Browsegegevens wissen</li>
				</ul>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">6. Wijzigingen</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij kunnen dit cookiebeleid van tijd tot tijd aanpassen. De meest actuele versie is altijd beschikbaar op deze pagina.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">7. Contact</h2>
				<p style="color: #4b5563; line-height: 1.7;">Heeft u vragen over ons cookiebeleid? Neem dan contact met ons op via voorzitterouderraad@talentenhuis.be.</p>
			`),
		]),
	];

	await createPage('Cookiebeleid', {
		url: '/cookiebeleid',
		title: 'Cookiebeleid - Talentenraad',
		blocks,
	});
}

async function createTermsOfService(): Promise<void> {
	const blocks = [
		createPageWrapper([
			createTextBlock('<h1 style="font-size: 2.5rem; font-weight: bold; color: #1f2937;">Algemene Voorwaarden</h1>', {marginBottom: '10px'}),
			createTextBlock('<p style="color: #6b7280; font-style: italic;">Laatst bijgewerkt: december 2024</p>', {marginBottom: '30px'}),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">1. Algemeen</h2>
				<p style="color: #4b5563; line-height: 1.7;">Deze algemene voorwaarden zijn van toepassing op het gebruik van de website van de Talentenraad, de ouderraad van basisschool Het Talentenhuis. Door gebruik te maken van onze website gaat u akkoord met deze voorwaarden.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">2. Doel van de website</h2>
				<p style="color: #4b5563; line-height: 1.7;">De website van de Talentenraad heeft als doel:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Ouders te informeren over activiteiten en nieuws</li>
					<li>Inschrijvingen voor activiteiten te faciliteren</li>
					<li>Contact mogelijk te maken tussen ouders en de ouderraad</li>
					<li>Informatie te delen over de school en de ouderraad</li>
				</ul>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">3. Intellectueel eigendom</h2>
				<p style="color: #4b5563; line-height: 1.7;">Alle content op deze website, inclusief teksten, afbeeldingen, logo's en ontwerp, is eigendom van de Talentenraad of wordt gebruikt met toestemming. Het is niet toegestaan om content te kopiëren, verspreiden of gebruiken zonder voorafgaande schriftelijke toestemming.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">4. Aansprakelijkheid</h2>
				<p style="color: #4b5563; line-height: 1.7;">De Talentenraad spant zich in om de informatie op deze website zo accuraat en actueel mogelijk te houden. Wij kunnen echter niet garanderen dat alle informatie te allen tijde volledig, juist en up-to-date is.</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">De Talentenraad is niet aansprakelijk voor:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Eventuele fouten of onvolledigheden in de informatie</li>
					<li>Schade als gevolg van het gebruik van de website</li>
					<li>De inhoud van externe websites waarnaar wij linken</li>
					<li>Technische storingen of onderbrekingen van de website</li>
				</ul>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">5. Activiteiten en inschrijvingen</h2>
				<p style="color: #4b5563; line-height: 1.7;">Bij inschrijving voor activiteiten gelden de volgende voorwaarden:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Inschrijvingen zijn persoonlijk en niet overdraagbaar</li>
					<li>De Talentenraad behoudt het recht om activiteiten te wijzigen of te annuleren</li>
					<li>Bij annulering door de Talentenraad worden eventuele betalingen teruggestort</li>
					<li>Deelname aan activiteiten is op eigen risico</li>
				</ul>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">6. Gedragsregels</h2>
				<p style="color: #4b5563; line-height: 1.7;">Bij het gebruik van onze website en deelname aan activiteiten verwachten wij dat u:</p>
				<ul style="color: #4b5563; line-height: 1.7; margin-left: 20px; margin-top: 10px;">
					<li>Respectvol omgaat met andere ouders, kinderen en medewerkers</li>
					<li>Geen aanstootgevende of illegale content verspreidt</li>
					<li>Geen spam of ongewenste berichten verstuurt</li>
					<li>De privacy van anderen respecteert</li>
				</ul>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">7. Privacy</h2>
				<p style="color: #4b5563; line-height: 1.7;">Wij respecteren uw privacy en verwerken uw persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG). Meer informatie vindt u in ons <a href="/privacybeleid" style="color: #ec4899;">privacybeleid</a>.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">8. Wijzigingen</h2>
				<p style="color: #4b5563; line-height: 1.7;">De Talentenraad behoudt het recht om deze algemene voorwaarden te wijzigen. Wijzigingen worden op deze pagina gepubliceerd. Door na wijziging gebruik te blijven maken van de website, accepteert u de gewijzigde voorwaarden.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">9. Toepasselijk recht</h2>
				<p style="color: #4b5563; line-height: 1.7;">Op deze algemene voorwaarden en het gebruik van de website is Belgisch recht van toepassing. Eventuele geschillen worden voorgelegd aan de bevoegde rechtbank in België.</p>
			`),

			createTextBlock(`
				<h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 15px;">10. Contact</h2>
				<p style="color: #4b5563; line-height: 1.7;">Heeft u vragen over deze algemene voorwaarden? Neem dan contact met ons op:</p>
				<p style="color: #4b5563; line-height: 1.7; margin-top: 10px;">
					Talentenraad - Het Talentenhuis<br>
					Zonhoevestraat 32<br>
					3740 Bilzen-Hoeselt<br>
					E-mail: voorzitterouderraad@talentenhuis.be
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
