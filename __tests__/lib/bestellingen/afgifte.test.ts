// @vitest-environment node
import {describe, expect, it} from 'vitest';
import {afgifte, alAfgehaaldTekst, formatTijd} from '@lib/bestellingen/afgifte';

const order = {
  actie: 'pizzaverkoop',
  afhaalId: 'vrijdag',
  afhaalLabel: 'Zaterdag 23 januari, 10:00 - 12:00',
  status: 'betaald' as const,
  totaalCent: 3200,
  afgehaaldOp: null,
  afgehaaldDoor: null,
};
const waar = {actie: 'pizzaverkoop', moment: 'vrijdag'};

describe('afgifte', () => {
  it('lets a paid order of this moment go', () => {
    expect(afgifte(order, waar)).toEqual({toestand: {soort: 'klaar'}, anderMoment: undefined, magMeegeven: true});
  });

  it('warns about another moment or sale, and still lets a paid order go', () => {
    expect(afgifte(order, {...waar, moment: 'zaterdag'})).toEqual({toestand: {soort: 'klaar'}, anderMoment: 'zaterdag 23 januari, 10:00 - 12:00', magMeegeven: true});
    expect(afgifte(order, {...waar, actie: 'andere'}).anderMoment).toBe('zaterdag 23 januari, 10:00 - 12:00');
  });

  it('stops an unpaid order with the open amount', () => {
    expect(afgifte({...order, status: 'wacht'}, waar)).toMatchObject({toestand: {soort: 'niet-betaald', openCent: 3200}, magMeegeven: false});
  });

  it('stops an order picked up already, with when and by whom', () => {
    const op = new Date('2027-01-22T17:42:00');
    expect(afgifte({
      ...order, status: 'afgehaald', afgehaaldOp: op, afgehaaldDoor: 'Sara',
    }, waar)).toMatchObject({toestand: {soort: 'al-afgehaald', op, door: 'Sara'}, magMeegeven: false});
  });

  it('stops a cancelled order, also one to pay back', () => {
    expect(afgifte({...order, status: 'geannuleerd'}, waar).toestand).toEqual({soort: 'geannuleerd'});
    expect(afgifte({...order, status: 'terugbetalen'}, waar)).toMatchObject({toestand: {soort: 'geannuleerd'}, magMeegeven: false});
  });
});

describe('alAfgehaaldTekst', () => {
  const op = new Date('2027-01-22T16:42:00Z');

  it('says the time in Belgian time on the same day', () => {
    expect(formatTijd(op)).toBe('17:42');
    expect(alAfgehaaldTekst(op, 'Sara', new Date('2027-01-22T18:00:00Z'))).toBe('Al afgehaald om 17:42 door Sara');
  });

  it('adds the date on another day, and leaves out an unknown name', () => {
    expect(alAfgehaaldTekst(op, '', new Date('2027-01-23T09:00:00Z'))).toBe('Al afgehaald op 22 januari om 17:42');
  });
});
