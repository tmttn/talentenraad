'use client';

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import {ArrowRight, Loader2, XCircle} from 'lucide-react';
import {SpeechBubble} from '@components/ui';
import {HoneypotField} from '@components/ui/honeypot-field';
import {
  contactMessages, subjectOptions, validateContact, type ContactErrors,
} from '@lib/contact-validation';
import {sendContact, type ContactState} from '../../(main)/contact/actions';

type ContactFormProperties = {
  titel?: string;
  /** Subject chosen up front, e.g. from /contact?onderwerp=activiteit. */
  defaultSubject?: string;
  /** Signed "shown at" token from the page; the server refuses forms sent faster than a person types. */
  formToken: string;
  showPhone?: boolean;
  showSubject?: boolean;
  /** For tests; the page uses the real server action. */
  action?: (state: ContactState, data: FormData) => Promise<ContactState>;
};

type Field = keyof ContactErrors;

const initialState: ContactState = {status: 'idle'};

const labelClass = 'font-bold text-[15px] text-gray-900';
const inputClass = [
  'w-full px-3.5 py-[13px] text-[17px] text-gray-900 bg-white rounded-control',
  'border-(length:--contour-width-sm) border-ink transition-colors',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
].join(' ');
// Error state as on the artboard: red outline, light red fill, message under the field
const inputErrorClass = 'border-red-700 bg-red-50';
const errorClass = 'text-sm font-semibold text-red-700';

type FieldProps = {
  id: string;
  label: ReactNode;
  error?: string;
  className?: string;
  children: (describedBy: string | undefined) => ReactNode;
};

function Field({id, label, error, className = '', children}: FieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children(error ? `${id}-fout` : undefined)}
      {error && <p id={`${id}-fout`} className={errorClass}>{error}</p>}
    </div>
  );
}

function SuccessMessage() {
  return (
    <div role='status' className='pb-8'>
      <SpeechBubble tone='green' tail='bottom' size='md'>
        <h2 className='mb-2 font-display font-extrabold text-black text-3xl leading-tight'>Bedankt voor je bericht!</h2>
        <p className='text-[17px] text-black'>We antwoorden zo snel mogelijk.</p>
      </SpeechBubble>
    </div>
  );
}

function SubmitButton({pending}: {pending: boolean}) {
  return (
    <button
      type='submit'
      disabled={pending}
      className={[
        'inline-flex items-center gap-2.5 px-6 py-3.5 text-[17px] font-bold text-white bg-primary rounded-control',
        'contour-sm shadow-hard-sm hover:bg-primary-hover active:translate-x-1 active:translate-y-1 active:shadow-none',
        'disabled:opacity-60 disabled:cursor-not-allowed transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
      ].join(' ')}
    >
      {pending
        ? (
          <>
            <Loader2 className='animate-spin h-5 w-5' aria-hidden='true' />
            Bezig met versturen…
          </>
        )
        : (
          <>
            Verstuur je bericht
            <ArrowRight className='h-5 w-5' strokeWidth={2.5} aria-hidden='true' />
          </>
        )}
    </button>
  );
}

const formValues = (form: HTMLFormElement) => {
  const data = new FormData(form);
  const text = (key: string) => {
    const value = data.get(key);
    return typeof value === 'string' ? value : '';
  };

  return {name: text('name'), email: text('email'), subject: text('subject'), message: text('message')};
};

/**
 * Contact form on a server action. Without JavaScript the browser posts it and the server renders
 * the errors or the thank-you; with JavaScript it validates first and shows the same messages
 * without reloading. Spam protection: a honeypot and a signed timing token (see form-timing).
 */
export function ContactForm({
  titel = 'Stuur ons een bericht',
  defaultSubject = 'vraag',
  formToken,
  showPhone = true,
  showSubject = true,
  action = sendContact,
}: Readonly<ContactFormProperties>) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<ContactErrors | undefined>();
  // Server errors the visitor has started fixing, remembered per answer from the server
  const [fixed, setFixed] = useState<{state: ContactState; fields: Field[]}>({state, fields: []});
  const formRef = useRef<HTMLFormElement>(null);

  const serverErrors = state.status === 'error' ? state.errors : undefined;
  const errors: ContactErrors = clientErrors ?? Object.fromEntries(Object.entries(serverErrors ?? {})
    .filter(([field]) => !(fixed.state === state && fixed.fields.includes(field as Field))));
  const values = state.values;

  // After the server answers, move to the first field (or message) that needs attention
  useEffect(() => {
    if (state.status === 'error') {
      const form = formRef.current;
      (form?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? form?.querySelector<HTMLElement>('[role="alert"]'))?.focus();
    }
  }, [state]);

  const markFixed = (field: Field) => () => {
    if (clientErrors?.[field]) {
      setClientErrors(previous => {
        const next = {...previous};
        delete next[field];
        return Object.keys(next).length > 0 ? next : undefined;
      });
    } else if (serverErrors?.[field]) {
      setFixed(previous => ({state, fields: previous.state === state ? [...previous.fields, field] : [field]}));
    }
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const found = validateContact(formValues(form), showSubject);
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      setClientErrors(found);
      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    setClientErrors(undefined);
  };

  if (state.status === 'sent') {
    return <SuccessMessage />;
  }

  const hasFieldErrors = Object.keys(errors).length > 0;
  const formMessage = state.status === 'error' && !state.errors ? state.message : (hasFieldErrors ? contactMessages.invalid : undefined);
  const invalid = (field: Field) => (errors[field] ? true : undefined);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby='contact-form-titel'
      className='bg-white rounded-panel contour shadow-hard-lg p-[clamp(24px,3.5vw,44px)] flex flex-col gap-[22px]'
    >
      <h2 id='contact-form-titel' className='font-display font-extrabold text-black text-[clamp(28px,2.6vw,34px)] tracking-[-0.01em]'>{titel}</h2>

      {formMessage && (
        <p
          role='alert'
          tabIndex={-1}
          className='flex items-center gap-2 p-4 rounded-control border-(length:--contour-width-sm) border-red-700 bg-red-50 font-semibold text-red-700 focus:outline-none'
        >
          <XCircle className='h-5 w-5 shrink-0' aria-hidden='true' />
          {formMessage}
        </p>
      )}

      <HoneypotField id='contact-website' />
      <input type='hidden' name='formToken' value={state.formToken ?? formToken} />

      <div className='flex flex-wrap gap-5'>
        <Field id='name' label='Naam' error={errors.name} className='flex-[1_1_220px] min-w-0'>
          {describedBy => (
            <input
              id='name'
              name='name'
              type='text'
              autoComplete='name'
              required
              defaultValue={values?.name}
              aria-invalid={invalid('name')}
              aria-describedby={describedBy}
              className={`${inputClass} ${errors.name ? inputErrorClass : ''}`}
              onChange={markFixed('name')}
            />
          )}
        </Field>
        <Field id='email' label='E-mail' error={errors.email} className='flex-[1_1_220px] min-w-0'>
          {describedBy => (
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              defaultValue={values?.email}
              aria-invalid={invalid('email')}
              aria-describedby={describedBy}
              className={`${inputClass} ${errors.email ? inputErrorClass : ''}`}
              onChange={markFixed('email')}
            />
          )}
        </Field>
      </div>

      {showPhone && (
        <Field id='phone' label={<>Telefoon <span className='font-medium text-gray-600'>(niet verplicht)</span></>}>
          {() => (
            <input
              id='phone'
              name='phone'
              type='tel'
              autoComplete='tel'
              defaultValue={values?.phone}
              className={`${inputClass} max-w-80`}
            />
          )}
        </Field>
      )}

      {showSubject && (
        <fieldset aria-describedby={errors.subject ? 'subject-fout' : undefined} className='flex flex-col gap-2.5'>
          <legend className={`${labelClass} mb-2.5`}>Waarover gaat het?</legend>
          <div className='flex flex-wrap gap-2.5'>
            {subjectOptions.map((option, index) => (
              <label
                key={option.value}
                className={[
                  'inline-flex items-center gap-2 px-4 py-[9px] font-bold rounded-full contour-xs cursor-pointer transition-colors',
                  'bg-white text-black hover:bg-brand-primary-50',
                  'has-[:checked]:bg-black has-[:checked]:text-white',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus has-[:focus-visible]:ring-offset-2',
                ].join(' ')}
              >
                <input
                  type='radio'
                  name='subject'
                  value={option.value}
                  defaultChecked={(values?.subject ?? defaultSubject) === option.value}
                  aria-invalid={errors.subject && index === 0 ? true : undefined}
                  onChange={markFixed('subject')}
                  className='m-0 accent-primary focus:outline-none'
                />
                {option.label}
              </label>
            ))}
          </div>
          {errors.subject && <p id='subject-fout' className={errorClass}>{errors.subject}</p>}
        </fieldset>
      )}

      <Field id='message' label='Je bericht' error={errors.message}>
        {describedBy => (
          <textarea
            id='message'
            name='message'
            rows={6}
            required
            defaultValue={values?.message}
            aria-invalid={invalid('message')}
            aria-describedby={describedBy}
            className={`${inputClass} leading-normal resize-y ${errors.message ? inputErrorClass : ''}`}
            onChange={markFixed('message')}
          />
        )}
      </Field>

      <div className='flex flex-wrap items-center justify-between gap-4 pt-1'>
        <p className='flex-[1_1_260px] text-sm leading-normal text-gray-600'>
          We gebruiken je gegevens alleen om je te antwoorden. Meer in ons{' '}
          <Link href='/privacybeleid' className='text-primary-text underline underline-offset-2'>privacybeleid</Link>.
        </p>
        <SubmitButton pending={pending} />
      </div>
    </form>
  );
}
