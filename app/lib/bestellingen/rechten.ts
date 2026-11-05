/** Who may do what with orders; every server action and page checks these, not only the buttons. */
import type {Role} from '@lib/db/schema';

type Wie = {user: {role: Role; bankToegang: boolean; name?: string | null; email: string}};

/** The order list, cancelling, notes, mails, export: admins and editors. */
export const kanBeheren = (session: Wie) => session.user.role === 'admin' || session.user.role === 'redacteur';

/** Confirming a payment or a refund: only with access to the bank account, whatever the role. */
export const kanBetalingBevestigen = (session: Wie) => session.user.bankToegang;

/** How a member is named in "betaald door", "afgehaald door". */
export const doorWie = (session: Wie) => session.user.name?.trim() || session.user.email;
