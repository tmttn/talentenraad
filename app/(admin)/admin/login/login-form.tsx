'use client';

import {type FormEvent, useState} from 'react';
import {Mail, MailCheck} from 'lucide-react';
import {Input} from '@components/ui/form/Input';

type LoginFormProps = {
  returnTo: string;
  error?: string;
};

type Status = 'idle' | 'sending' | 'sent' | 'failed';

const linkErrorMessage = 'Deze link is ongeldig of verlopen. Vraag een nieuwe aan.';
const failedMessage = 'Er ging iets mis. Probeer het opnieuw.';

export function LoginForm({returnTo, error}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/auth/request', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, returnTo}),
      });
      const data = await response.json() as {message: string};
      setMessage(data.message);
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  if (status === 'sent') {
    return (
      <div className='text-center' aria-live='polite'>
        <MailCheck className='w-10 h-10 mx-auto mb-3 text-primary' aria-hidden='true' />
        <h2 className='text-lg font-semibold text-gray-800 mb-2'>Check je mailbox</h2>
        <p className='text-gray-500 text-sm sm:text-base'>{message}</p>
      </div>
    );
  }

  const alert = status === 'failed' ? failedMessage : (error === 'link' ? linkErrorMessage : undefined);

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {alert && (
        <p role='alert' className='rounded-card bg-red-50 px-4 py-3 text-sm text-red-700'>
          {alert}
        </p>
      )}
      <div>
        <label htmlFor='login-email' className='block text-sm font-semibold text-gray-800 mb-2'>
          E-mailadres
        </label>
        <Input
          id='login-email'
          type='email'
          name='email'
          autoComplete='email'
          required
          value={email}
          onChange={event => {
            setEmail(event.target.value);
          }}
          placeholder='naam@voorbeeld.be'
        />
      </div>
      <button
        type='submit'
        disabled={status === 'sending'}
        className='w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-white rounded-card hover:bg-primary-hover transition-colors font-medium disabled:opacity-60'
      >
        <Mail className='w-5 h-5' aria-hidden='true' />
        Stuur inloglink
      </button>
    </form>
  );
}
