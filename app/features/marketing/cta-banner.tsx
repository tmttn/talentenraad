'use client';

import type {ReactNode} from 'react';
import {Container} from '@components/ui/layout';
import {useFlag} from '@lib/flags-client';

type CtaBannerProperties = {
  variant?: 'default' | 'accent' | 'light';
  children?: ReactNode;
};

function CtaBanner({
  variant = 'default',
  children,
}: Readonly<CtaBannerProperties>) {
  const isEnabled = useFlag('ctaBanner');

  if (!isEnabled) {
    return null;
  }

  const variants = {
    default: 'bg-gray-900',
    accent: 'bg-gradient-to-r from-brand-primary-500 to-brand-primary-700',
    light: 'bg-gray-100',
  };

  const bg = variants[variant] ?? variants.default;

  return (
    <section className={`py-12 md:py-16 ${bg}`}>
      <Container size='lg' className='text-center'>
        {children}
      </Container>
    </section>
  );
}

export const CtaBannerInfo = {
  name: 'CTABanner',
  component: CtaBanner,
  inputs: [
    {
      name: 'variant',
      type: 'string',
      enum: ['default', 'accent', 'light'],
      defaultValue: 'default',
      helperText: 'default: donkergrijs, accent: primaire kleur gradient, light: lichtgrijs',
    },
  ],
  canHaveChildren: true,
};
