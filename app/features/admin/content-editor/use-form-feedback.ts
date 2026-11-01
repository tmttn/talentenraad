import {useEffect, useRef} from 'react';

export const generalErrorMessage = 'Er klopt iets niet aan dit item. Controleer de velden of vraag de beheerder om hulp.';

export type Feedback = {message?: string; errors?: Record<string, string>; attempt?: number};

/**
 * After a failed submit: focus the first invalid field (or the form message) and
 * turn errors for fields that are not on screen into a general message.
 */
export function useFormFeedback(state: Feedback, visibleFields: string[]) {
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const hasHiddenError = Object.keys(state.errors ?? {}).some(key => !visibleFields.includes(key));
  const message = state.message ?? (hasHiddenError ? generalErrorMessage : undefined);

  useEffect(() => {
    if (!state.attempt) {
      return;
    }

    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (invalid ?? messageRef.current)?.focus();
  }, [state]);

  return {formRef, messageRef, message};
}
