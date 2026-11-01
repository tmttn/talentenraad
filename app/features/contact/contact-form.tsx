'use client';

import {
  useState,
  Suspense,
  type SyntheticEvent,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {ArrowRight, Loader2, XCircle} from 'lucide-react';
import {SpeechBubble} from '@components/ui';
import {HoneypotField} from '@components/ui/honeypot-field';
import {
  contactMessages, isValidSubject, subjectOptions, validateContact, type ContactErrors,
} from '@lib/contact-validation';
import {useRecaptcha} from './use-recaptcha';

type ContactFormProperties = {
  titel?: string;
  showPhone?: boolean;
  showSubject?: boolean;
};

type FormErrors = ContactErrors & {general?: string};

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  errors?: FormErrors;
};

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

function GeneralErrorMessage({message}: {message: string}) {
  return (
    <p className='flex items-center gap-2 p-4 rounded-control border-(length:--contour-width-sm) border-red-700 bg-red-50 font-semibold text-red-700' role='alert'>
      <XCircle className='h-5 w-5 shrink-0' aria-hidden='true' />
      {message}
    </p>
  );
}

function SubmitButton({isSubmitting}: {isSubmitting: boolean}) {
  return (
    <button
      type='submit'
      disabled={isSubmitting}
      className={[
        'inline-flex items-center gap-2.5 px-6 py-3.5 text-[17px] font-bold text-white bg-primary rounded-control',
        'contour-sm shadow-hard-sm hover:bg-primary-hover active:translate-x-1 active:translate-y-1 active:shadow-none',
        'disabled:opacity-60 disabled:cursor-not-allowed transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
      ].join(' ')}
    >
      {isSubmitting
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

type ContactFormInnerProperties = ContactFormProperties & {
  defaultSubject: string;
};

function ContactFormInner({
  titel = 'Stuur ons een bericht',
  showPhone = true,
  showSubject = true,
  defaultSubject,
}: Readonly<ContactFormInnerProperties>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: defaultSubject,
    message: '',
  });
  const {executeRecaptcha} = useRecaptcha();

  const handleInputChange = (field: keyof FormData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(previous => ({...previous, [field]: event.target.value}));
    if (errors[field]) {
      setErrors(previous => ({...previous, [field]: undefined}));
    }
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('');

    const form = event.currentTarget;
    const found = validateContact(formData, showSubject);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatusMessage(contactMessages.invalid);
      // Move to the first field that needs attention, after the error state has rendered
      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setStatusMessage('Je bericht wordt verstuurd…');

    try {
      const recaptchaToken = await executeRecaptcha('contact_form');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...formData, website, recaptchaToken}),
      });

      const data = await response.json() as ApiResponse;

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({general: data.message ?? contactMessages.failed});
        }

        setStatusMessage(data.message ?? contactMessages.failed);
        return;
      }

      setIsSubmitted(true);
      setStatusMessage(contactMessages.success);
    } catch {
      setErrors({general: contactMessages.network});
      setStatusMessage(contactMessages.network);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <SuccessMessage />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby='contact-form-titel'
      className='bg-white rounded-panel contour shadow-hard-lg p-[clamp(24px,3.5vw,44px)] flex flex-col gap-[22px]'
    >
      <div className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
        {statusMessage}
      </div>
      <h2 id='contact-form-titel' className='font-display font-extrabold text-black text-[clamp(28px,2.6vw,34px)] tracking-[-0.01em]'>{titel}</h2>

      {errors.general && <GeneralErrorMessage message={errors.general} />}

      <HoneypotField id='contact-website' value={website} onChange={setWebsite} />

      <div className='flex flex-wrap gap-5'>
        <Field id='name' label='Naam' error={errors.name} className='flex-[1_1_220px] min-w-0'>
          {describedBy => (
            <input
              id='name'
              name='name'
              type='text'
              autoComplete='name'
              required
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy}
              className={`${inputClass} ${errors.name ? inputErrorClass : ''}`}
              value={formData.name}
              onChange={handleInputChange('name')}
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
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy}
              className={`${inputClass} ${errors.email ? inputErrorClass : ''}`}
              value={formData.email}
              onChange={handleInputChange('email')}
            />
          )}
        </Field>
      </div>

      {showPhone && (
        <Field id='phone' label={<>Telefoon <span className='font-medium text-gray-600'>(niet verplicht)</span></>} error={errors.phone}>
          {describedBy => (
            <input
              id='phone'
              name='phone'
              type='tel'
              autoComplete='tel'
              aria-describedby={describedBy}
              className={`${inputClass} max-w-80`}
              value={formData.phone}
              onChange={handleInputChange('phone')}
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
                  checked={formData.subject === option.value}
                  aria-invalid={errors.subject && index === 0 ? true : undefined}
                  onChange={handleInputChange('subject')}
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
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy}
            className={`${inputClass} leading-normal resize-y ${errors.message ? inputErrorClass : ''}`}
            value={formData.message}
            onChange={handleInputChange('message')}
          />
        )}
      </Field>

      <div className='flex flex-wrap items-center justify-between gap-4 pt-1'>
        <p className='flex-[1_1_260px] text-sm leading-normal text-gray-600'>
          We gebruiken je gegevens alleen om je te antwoorden. Meer in ons{' '}
          <Link href='/privacybeleid' className='text-primary-text underline underline-offset-2'>privacybeleid</Link>.
        </p>
        <SubmitButton isSubmitting={isSubmitting} />
      </div>
    </form>
  );
}

function ContactFormSkeleton() {
  return <div aria-hidden='true' className='h-[640px] rounded-panel contour bg-gray-50 animate-pulse' />;
}

/** Reads ?onderwerp= so links like /contact?onderwerp=activiteit preselect the subject. */
function ContactFormWithParameters(props: Readonly<ContactFormProperties>) {
  const searchParameters = useSearchParams();
  const urlSubject = searchParameters.get('onderwerp');
  const defaultSubject = isValidSubject(urlSubject) ? urlSubject : 'vraag';

  return <ContactFormInner {...props} defaultSubject={defaultSubject} />;
}

export function ContactForm(props: Readonly<ContactFormProperties>) {
  return (
    <Suspense fallback={<ContactFormSkeleton />}>
      <ContactFormWithParameters {...props} />
    </Suspense>
  );
}
