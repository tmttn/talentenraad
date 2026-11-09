import {
  afhaalcodeMail, afhaalHerinneringMail, betaalHerinneringMail, bevestigingMail, cashTekst,
} from '@lib/email/bestellingen';
import {escapeHtml} from '@lib/email/escape';

const data = {
  titel: 'Pizzaverkoop',
  nummer: 14,
  regels: [{aantal: 2, naam: 'Margherita', bedrag: '€ 20,00'}, {aantal: 1, naam: '<b>Vegetariana</b>', bedrag: '€ 12,00'}],
  totaal: '€ 32,00',
  afhaalLabel: 'Vrijdag 22 januari, 17:00 - 19:00',
  afhaalPlaats: 'Refter van het Talentenhuis',
  link: 'https://talentenraad.be/b/abc',
  logoUrl: 'https://talentenraad.be/Logo.png',
  annulerenTot: 'zondag 17 januari',
};
const betalen = {
  bedrag: '€ 32,00', iban: 'BE68 5390 0754 7034', begunstigde: 'Talentenraad Het Talentenhuis', mededeling: '+++000/0000/01414+++', uiterlijk: 'vrijdag 15 januari', cash: true,
};

describe('order mails', () => {
  it('confirms with everything needed to pay', () => {
    const mail = bevestigingMail(data, betalen);
    expect(mail.subject).toBe('Je bestelling voor de pizzaverkoop (nr. 14): zo betaal je');
    for (const part of ['€ 32,00', 'BE68 5390 0754 7034', 'Talentenraad Het Talentenhuis', '+++000/0000/01414+++', 'Betaal uiterlijk vrijdag 15 januari', 'https://talentenraad.be/b/abc', 'tot en met zondag 17 januari']) {
      expect(mail.html).toContain(part);
      expect(mail.text).toContain(part.replace('Betaal uiterlijk', 'Betaal uiterlijk'));
    }

    expect(mail.html).toContain(escapeHtml(cashTekst));
    expect(bevestigingMail(data, {...betalen, cash: false}).text).not.toContain('cash');
  });

  it('escapes what parents and editors typed', () => {
    const mail = bevestigingMail({...data, titel: 'Fuif "O\'Brien"'}, betalen);
    expect(mail.html).toContain('1 × &lt;b&gt;Vegetariana&lt;/b&gt;');
    expect(mail.html).not.toContain('<b>Vegetariana');
    expect(mail.html).toContain('<title>Fuif &quot;O&#39;Brien&quot;</title>');
  });

  it('sends the pickup code with the inline QR image', () => {
    const mail = afhaalcodeMail(data, 'K7P-4QX', false);
    expect(mail.subject).toBe('Betaling ontvangen: je afhaalcode voor de pizzaverkoop');
    expect(mail.html).toContain('src="cid:afhaalcode"');
    expect(mail.html).toContain('K7P-4QX');
    expect(mail.text).toContain('K7P-4QX');
    expect(afhaalcodeMail(data, 'K7P-4QX', true).subject).toBe('Je bestelling voor de pizzaverkoop is bevestigd');
  });

  it('reminds to pay with the same payment details', () => {
    const mail = betaalHerinneringMail(data, betalen);
    expect(mail.subject).toBe('Herinnering: betaal je bestelling voor de pizzaverkoop (nr. 14) uiterlijk vrijdag 15 januari');
    for (const part of ['Nog niet betaald?', '€ 32,00', 'BE68 5390 0754 7034', '+++000/0000/01414+++', 'Betaal uiterlijk vrijdag 15 januari', 'https://talentenraad.be/b/abc', 'Net betaald?']) {
      expect(mail.html).toContain(part);
      expect(mail.text).toContain(part);
    }

    expect(mail.text).toContain(cashTekst);
  });

  it('reminds to pick up tomorrow with the QR code and escapes product names', () => {
    const mail = afhaalHerinneringMail(data, 'K7P-4QX');
    expect(mail.subject).toBe('Morgen afhalen: je bestelling voor de pizzaverkoop');
    expect(mail.html).toContain('src="cid:afhaalcode"');
    expect(mail.html).toContain('K7P-4QX');
    expect(mail.html).toContain('Vrijdag 22 januari, 17:00 - 19:00');
    expect(mail.html).toContain('&lt;b&gt;Vegetariana&lt;/b&gt;');
    expect(mail.html).not.toContain('<b>Vegetariana</b>');
    expect(mail.text).toContain('2 × Margherita');
    expect(mail.text).toContain('K7P-4QX');
  });
});
