'use client';

import {User} from 'lucide-react';

type LoginButtonProps = {
  returnTo: string;
};

export function LoginButton({returnTo}: LoginButtonProps) {
  const loginUrl = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <a
      href={loginUrl}
      className='w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-white rounded-card hover:bg-primary-hover transition-colors font-medium'
    >
      <User className='w-5 h-5' />
      Inloggen
    </a>
  );
}
