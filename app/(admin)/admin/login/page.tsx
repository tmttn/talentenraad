import type {Metadata} from 'next';
import Image from 'next/image';
import {redirect} from 'next/navigation';
import {safeReturnTo} from '@lib/auth/admin';
import {getSession} from '@lib/auth/session';
import {LoginForm} from './login-form';

export const metadata: Metadata = {
  title: 'Inloggen',
};

type AdminLoginPageProps = {
  searchParams: Promise<{
    returnTo?: string;
    error?: string;
  }>;
};

export default async function AdminLoginPage({searchParams}: AdminLoginPageProps) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);

  let session: Awaited<ReturnType<typeof getSession>>;
  try {
    session = await getSession();
  } catch (error) {
    // Database trouble: still show the login form.
    console.error('Session lookup failed on login page:', error);
  }

  // Already signed in: go straight to the requested admin page (outside the try: redirect throws)
  if (session) {
    redirect(returnTo);
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <div className='bg-white p-6 sm:p-8 rounded-modal shadow-elevated max-w-md w-full'>
        <div className='text-center mb-6 sm:mb-8'>
          <Image
            src='/Logo.png'
            alt='Talentenraad'
            width={160}
            height={107}
            className='h-16 w-auto mx-auto mb-4'
            priority
          />
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>
            Admin Dashboard
          </h1>
          <p className='text-gray-500 text-sm sm:text-base'>
            Vul je e-mailadres in. Je ontvangt een link waarmee je meteen bent ingelogd.
          </p>
        </div>
        <LoginForm returnTo={returnTo} error={params.error} />
        <p className='mt-6 text-center text-xs sm:text-sm text-gray-500'>
          Alleen geautoriseerde beheerders kunnen inloggen.
        </p>
      </div>
    </div>
  );
}
