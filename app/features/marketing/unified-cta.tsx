'use client';

import type {ReactNode} from 'react';
import {Container} from '@components/ui/layout';

type UnifiedCtaProperties = {
  variant?: 'compact' | 'full' | 'minimal';
  children?: ReactNode;
};

const variantStyles: Record<string, string> = {
  minimal: 'bg-gray-900 py-8 px-6',
  compact: 'bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 py-10 px-6',
  full: 'bg-gradient-to-br from-gray-900 to-gray-800 py-16 px-6',
};

const containerConfig: Record<string, {size: 'lg' | 'xl'; className?: string}> = {
  minimal: {size: 'lg', className: 'text-center'},
  compact: {size: 'lg'},
  full: {size: 'xl'},
};

function UnifiedCta({
  variant = 'full',
  children,
}: Readonly<UnifiedCtaProperties>) {
  const config = containerConfig[variant];

  return (
    <section className={variantStyles[variant]}>
      <Container size={config.size} className={config.className}>
        {children}
      </Container>
    </section>
  );
}

export const UnifiedCtaInfo = {
  name: 'UnifiedCTA',
  component: UnifiedCta,
  inputs: [
    {
      name: 'variant',
      type: 'string',
      enum: ['compact', 'full', 'minimal'],
      defaultValue: 'full',
      helperText: 'Achtergrondstijl: compact (primaire gradient), full (donkere gradient), minimal (donker)',
    },
  ],
  canHaveChildren: true,
};
