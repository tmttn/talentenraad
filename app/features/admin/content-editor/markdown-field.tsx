'use client';

import {useEffect, useState} from 'react';
import {FormField, Textarea} from '@components/ui';

type Properties = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
};

export function MarkdownField({
  name, label, value, onChange, error, required,
}: Readonly<Properties>) {
  const [html, setHtml] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/admin/content/preview', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({markdown: value}),
          signal: controller.signal,
        });
        if (response.ok) {
          setHtml((await response.json() as {html: string}).html);
          setFailed(false);
        } else {
          setFailed(true);
        }
      } catch {
        if (!controller.signal.aborted) {
          setFailed(true);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <FormField
        label={label}
        htmlFor={name}
        required={required}
        error={error}
        hint='Opmaak: **vet**, *schuin*, - lijst, [link](https://…), > citaat (wordt een spraakballon in nieuwsberichten)'
      >
        <Textarea
          id={name}
          name={name}
          rows={14}
          value={value}
          error={Boolean(error)}
          aria-invalid={error ? true : undefined}
          onChange={event => {
            onChange(event.target.value);
          }}
        />
      </FormField>
      <div>
        <p className='text-sm font-medium text-gray-700 mb-1'>Voorbeeld</p>
        <div
          className='prose max-w-none min-h-[10rem] rounded-input border border-gray-200 bg-white p-4 text-gray-800'
        >
          {failed && <p className='text-sm text-red-600'>Het voorbeeld kan nu niet geladen worden.</p>}
          {!failed && value.trim() === '' && <p className='text-sm text-gray-500'>Hier zie je straks hoe je tekst eruitziet.</p>}
          {/* The server renders with the sanitizing site renderer. */}
          {!failed && value.trim() !== '' && <div dangerouslySetInnerHTML={{__html: html}} />}
        </div>
      </div>
    </div>
  );
}
