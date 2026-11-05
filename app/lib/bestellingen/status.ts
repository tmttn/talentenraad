/** Labels for the order statuses, for parents and for the board. Client-safe. */
import type {OrderStatus} from '../db/schema';

export const statusLabels: Record<OrderStatus, string> = {
  wacht: 'Wacht op betaling',
  betaald: 'Betaald',
  afgehaald: 'Afgehaald',
  geannuleerd: 'Geannuleerd',
  terugbetalen: 'Terug te betalen',
};

/** What a parent sees on their order page. */
export const statusVoorOuder: Record<OrderStatus, string> = {
  wacht: 'Wacht op betaling',
  betaald: 'Betaald · klaar om af te halen',
  afgehaald: 'Afgehaald',
  geannuleerd: 'Geannuleerd',
  terugbetalen: 'Geannuleerd · we storten het bedrag terug',
};

/** `Ontbijtmand voor 2 (bruin, cava)`: the product with the choices made. */
export function regelNaam(regel: {naam: string; keuzes: Array<{keuze: string}>}): string {
  return regel.keuzes.length === 0 ? regel.naam : `${regel.naam} (${regel.keuzes.map(keuze => keuze.keuze.toLowerCase()).join(', ')})`;
}
