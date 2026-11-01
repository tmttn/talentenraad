import {isValidSubject, validateContact} from '@lib/contact-validation';

const ok = {name: 'Lies Peeters', email: 'lies@voorbeeld.be', message: 'Een bericht dat lang genoeg is.'};

describe('validateContact', () => {
  it('accepts a complete message', () => {
    expect(validateContact(ok)).toEqual({});
    expect(validateContact({...ok, subject: 'sponsoring'}, true)).toEqual({});
  });

  it('speaks to the visitor in the je-form', () => {
    expect(validateContact({name: '', email: '', message: ''})).toEqual({
      name: 'Vul je naam in.',
      email: 'Vul je e-mailadres in, bv. naam@voorbeeld.be',
      message: 'Schrijf je bericht.',
    });
    expect(validateContact({name: 'L', email: 'lies.peeters@', message: 'Kort'})).toEqual({
      name: 'Vul je volledige naam in.',
      email: 'Vul een volledig e-mailadres in, bv. naam@voorbeeld.be',
      message: 'Schrijf iets meer: minstens 10 tekens.',
    });
  });

  it('checks the subject only when it is asked', () => {
    expect(validateContact({...ok, subject: 'iets'}, true)).toEqual({subject: 'Kies waarover het gaat.'});
    expect(validateContact({...ok, subject: 'iets'})).toEqual({});
  });

  it('knows the subjects', () => {
    expect(isValidSubject('lidmaatschap')).toBe(true);
    expect(isValidSubject('anders')).toBe(true);
    expect(isValidSubject(null)).toBe(false);
  });
});
