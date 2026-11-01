import {notConfiguredMessage} from '@lib/content-store/entry-types';

export function NotConfigured() {
  return (
    <p role='status' className='rounded-card border border-gray-200 bg-white p-4 text-gray-700'>
      {notConfiguredMessage}
    </p>
  );
}
