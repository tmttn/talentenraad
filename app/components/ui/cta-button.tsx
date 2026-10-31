'use client';

import {ArrowRight} from 'lucide-react';

/**
 * CSS for button arrow animations using design tokens
 * - Transition: duration-base (200ms)
 */
const buttonStyles = `
	.cta-button {
		transition: all var(--duration-base) var(--easing-smooth);
	}

	.cta-button-arrow {
		transition: transform var(--duration-base) var(--easing-smooth);
	}

	.cta-button:hover .cta-button-arrow {
		transform: translateX(4px);
	}
`;

type CtaButtonProperties = {
  text?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'white';
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
};

/**
 * Variant styles using design tokens
 * - Shadow: shadow-elevated on hover
 */
const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary-hover hover:shadow-elevated hover:shadow-primary/25 focus:ring-primary border border-transparent',
  secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/20 focus:ring-white',
  outline: 'bg-transparent border-2 border-white text-white hover:bg-white/10 focus:ring-white',
  white: 'bg-white text-gray-900 hover:bg-gray-100 focus:ring-white border border-transparent',
};

/**
 * Size styles using design tokens
 * - Gap: gap-gap-xs (sm/md), gap-gap-sm (lg)
 */
const sizeStyles = {
  sm: 'py-2 px-4 text-sm gap-gap-xs',
  md: 'py-3 px-6 text-base gap-gap-xs',
  lg: 'py-4 px-8 text-lg gap-gap-sm',
};

const arrowSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-5 w-5',
};

export function CtaButton({
  text = 'Klik hier',
  href = '#',
  variant = 'primary',
  size = 'md',
  showArrow = true,
}: Readonly<CtaButtonProperties>) {
  // Uses rounded-button token for consistent border radius
  const baseClasses = `cta-button inline-flex items-center justify-center font-semibold rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles[variant]} ${sizeStyles[size]}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: buttonStyles}} />
      <a href={href} className={baseClasses}>
        {text}
        {showArrow && <ArrowRight className={`cta-button-arrow ${arrowSizes[size]} flex-shrink-0`} aria-hidden='true' />}
      </a>
    </>
  );
}
