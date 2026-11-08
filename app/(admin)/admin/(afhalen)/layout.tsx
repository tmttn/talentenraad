import type {Metadata, Viewport} from 'next';
import {requireStaffSession} from '@lib/auth/require-admin';

export const metadata: Metadata = {
  title: 'Afhalen',
  manifest: '/afhalen.webmanifest',
  appleWebApp: {capable: true, title: 'Afhalen', statusBarStyle: 'default'},
  robots: {index: false, follow: false},
};

export const viewport: Viewport = {themeColor: '#ffffff'};

/**
 * The pickup app: a phone-sized web app for admins, editors and helpers. Helpers only get this part
 * of the admin; every page and action checks the session again.
 */
export default async function AfhaalLayout({children}: Readonly<{children: React.ReactNode}>) {
  await requireStaffSession();
  return (
    <div className='min-h-dvh bg-gray-50 text-gray-900'>
      <div className='max-w-md mx-auto min-h-dvh flex flex-col'>{children}</div>
    </div>
  );
}
