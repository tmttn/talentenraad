import {unstable_isUnrecognizedActionError, unstable_rethrow} from 'next/navigation';

export const unreachableMessage = 'De server was even niet bereikbaar, waarschijnlijk omdat de site net wordt bijgewerkt. Je wijzigingen staan er nog: probeer over een halve minuut opnieuw op te slaan.';
export const updatedMessage = 'De site is intussen bijgewerkt en kent dit formulier niet meer. Kopieer je wijzigingen, herlaad de pagina en probeer opnieuw.';

/**
 * Every save starts a deploy, so a later save can hit the restarting server (502) or
 * a newer build. Without this the rejection reaches the error page and the typed
 * edits are gone; now it becomes a form message and the form keeps its values.
 * Navigation errors pass through: Next rejects the action with the redirect after a save.
 */
export async function guardAction<State>(run: () => Promise<State>): Promise<State | {message: string}> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error);
    return {message: unstable_isUnrecognizedActionError(error) ? updatedMessage : unreachableMessage};
  }
}
