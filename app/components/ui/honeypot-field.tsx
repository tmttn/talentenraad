import type {ChangeEvent} from 'react';

type HoneypotFieldProperties = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

/** Spam trap: moved off-screen, invisible to people and screen readers, but bots fill it in. */
export function HoneypotField({id, value, onChange}: Readonly<HoneypotFieldProperties>) {
  return (
    <div className='absolute -left-[9999px] top-auto h-px w-px overflow-hidden' aria-hidden='true'>
      <label htmlFor={id}>Website</label>
      <input
        id={id}
        type='text'
        name='website'
        value={value}
        tabIndex={-1}
        autoComplete='off'
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value);
        }}
      />
    </div>
  );
}
