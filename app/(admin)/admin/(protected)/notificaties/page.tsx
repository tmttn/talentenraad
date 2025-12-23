import type {Metadata} from 'next';
import {NotificatiesManager} from './notificaties-manager';

export const metadata: Metadata = {
  title: 'Notificaties',
};

export default function NotificatiesPage() {
  return (
    <div>
      <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8'>
        Push Notificaties
      </h1>
      <NotificatiesManager />
    </div>
  );
}
